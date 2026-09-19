# Clustermap Notifications and the 30-Minute CPU Spike

## Summary

We observed a periodic CPU spike (roughly every 30 minutes) in services using this
client. The spike correlated with `enable_clustermap_notification=true` (the default).
Setting `enable_clustermap_notification=false` eliminated the spike entirely. This
document describes the mechanism behind the spike, why duplicate notifications were
still expensive, and what the flag change actually does.

## Background: what `enable_clustermap_notification` does

When `enable_clustermap_notification=true` (the default, see `core/cluster_options.hxx`),
the client negotiates two HELLO features with every KV node during session bootstrap
(`core/io/mcbp_session.cxx`):

- `clustermap_change_notification` — allows the server to *push* configuration updates
  to the client at any time, as server-originated `cluster_map_change_notification`
  messages, instead of the client having to poll for them.
- `deduplicate_not_my_vbucket_clustermap` — related dedup behavior for configs carried
  in `not_my_vbucket` responses.

With the feature negotiated, the server may asynchronously send each connected session a
full bucket configuration whenever it believes the cluster map has changed.

## Why the CPU spiked every 30 minutes

In our environment the server pushed `cluster_map_change_notification` messages on a
roughly 30-minute cadence. Each notification carries the **entire bucket configuration
as a JSON payload** (in our case ~74 KB per message — see the captured example in
`core/impl/rev-6105839.json`).

The cost is multiplied by connection count: the notification is delivered to **every
KV session** the client holds open (one per node, per bucket), and each session
independently processes the message. So a single server-side event turns into N
near-simultaneous JSON parse jobs on the client — a synchronized burst of work across
the whole connection pool, which presents as a CPU spike rather than a steady load.

> **Open question:** we never determined *why* the server was sending these
> notifications every ~30 minutes. No topology change, rebalance, or failover was
> occurring on that cadence, and the configs pushed were duplicates of the revision the
> client already held (see below). The trigger on the server side remains unexplained.

## Why parsing duplicate notifications was still expensive

The client does deduplicate incoming configs — but only **after** fully parsing them.

On receipt of a notification (`core/io/mcbp_session.cxx`, `server_opcode::
cluster_map_change_notification` handler), the session:

1. Constructs a `cluster_map_change_notification_request_body` and calls
   `req.body().config()`, which runs `utils::json::parse(...)` over the full ~74 KB
   payload and materializes a complete `topology::configuration` object (nodes,
   services, ports, and the full vbucket map — 1024 entries with server lists).
2. Only then calls `update_configuration()`, which compares the freshly parsed config
   against the currently held one (`config == config_`) and discards it if the revision
   is identical or older.

So for a duplicate notification, all of the expensive work — the JSON parse, the
allocation and population of the configuration object, and a full structural equality
comparison — has already been paid before the dedup check can throw the config away.
The dedup check prevents *downstream* work (listener fan-out to the config tracker,
bucket, HTTP session manager, tracer, meter, etc.), but it cannot prevent the parse
itself, because the revision number needed for the comparison lives inside the JSON.

Empirically, this parse-and-discard cycle was enough to produce the observed CPU spike
when it fired across all sessions at once.

## Why `enable_clustermap_notification=false` fixed it

With the flag set to `false`:

- The HELLO negotiation never enables `clustermap_change_notification`, so the server
  does not push these server-originated messages at all. The parse-and-discard work
  simply never happens.
- The client still keeps its configuration fresh through the mechanisms that were
  already in place:
  - **Polling** — the config tracker / bucket periodically issue `get_cluster_config`
    (GCCCP) requests (`poll_config` / `fetch_config`), subject to
    `config_poll_interval` / `config_poll_floor`.
  - **`not_my_vbucket` responses** — if the topology genuinely changes, KV operations
    directed at the wrong node return `not_my_vbucket` with the current config in the
    response payload, which the client applies immediately.

In other words, disabling push notifications trades a painfully nosiy push
channel for pull-based freshness, with no loss of correctness: genuine
topology changes are still picked up quickly via `not_my_vbucket`, and routine
freshness is covered by polling.

_We never experienced any performance or behavioural issues with this latest configuration_

## Caveats / follow-ups

- The root cause on the **server side** was never identified: we don't know why
  duplicate `cluster_map_change_notification` messages were being emitted every
  ~30 minutes when no cluster map change had occurred. If that behavior is understood
  (or fixed in a later server version), re-enabling notifications may be safe and
  would restore faster config propagation.
- A possible client-side improvement would be a cheap pre-parse guard — e.g. extracting
  just the `rev` field before committing to a full parse — so duplicate notifications
  can be discarded at near-zero cost.
