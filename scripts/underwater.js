const SVG_NS = "http://www.w3.org/2000/svg";
const BUBBLE_COUNT = 12;
const BUBBLE_SIZES = [10, 16, 22];
const SCHOOL = [
    { lane: "12%", duration: 14, reverse: true, green: false, phase: 0.08 },
    { lane: "28%", duration: 11, reverse: false, green: true, phase: 0.41 },
    { lane: "44%", duration: 16, reverse: true, green: false, phase: 0.67 },
    { lane: "58%", duration: 9, reverse: false, green: true, phase: 0.22 },
    { lane: "73%", duration: 13, reverse: true, green: false, phase: 0.53 },
    { lane: "88%", duration: 18, reverse: false, green: true, phase: 0.84 },
];

let redCheep = null;
let greenCheep = null;
let bubbles = [];
let pointer = null;
let underwaterRunning = false;
let underwaterFrame = 0;
let underwaterPage = null;
let alignQueued = false;

function svgEl(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    for (const key in attrs) el.setAttribute(key, attrs[key]);
    return el;
}

function makeCheep(body, fin) {
    const svg = svgEl("svg", { viewBox: "0 0 32 20", class: "underwater-svg" });
    svg.appendChild(svgEl("polygon", {
        points: "8,10 0.5,3.5 0.5,16.5",
        fill: fin,
        class: "underwater-tail",
    }));
    svg.appendChild(svgEl("ellipse", {
        cx: "18", cy: "10", rx: "9", ry: "6.2",
        fill: body,
        class: "underwater-body",
    }));
    svg.appendChild(svgEl("ellipse", {
        cx: "18.5", cy: "12.4", rx: "5.2", ry: "2.6",
        fill: "#fcfcfc",
        class: "underwater-belly",
    }));
    svg.appendChild(svgEl("polygon", {
        points: "14,6.5 17.5,1 21.5,6.5",
        fill: fin,
        class: "underwater-fin underwater-fin-top",
    }));
    svg.appendChild(svgEl("polygon", {
        points: "14,13.5 17.5,19 21.5,13.5",
        fill: fin,
        class: "underwater-fin underwater-fin-bottom",
    }));
    svg.appendChild(svgEl("circle", {
        cx: "23", cy: "8.2", r: "2.3",
        fill: "#fcfcfc",
        class: "underwater-eye",
    }));
    svg.appendChild(svgEl("circle", {
        cx: "24.1", cy: "8.2", r: "1",
        fill: "#000000",
        class: "underwater-pupil",
    }));
    return svg;
}

function cheepTemplates() {
    if (redCheep) return;
    redCheep = makeCheep("#f83800", "#fc9838");
    greenCheep = makeCheep("#58d854", "#80d010");
}

function fillSchool(parent) {
    SCHOOL.forEach((fish) => {
        const svg = (fish.green ? greenCheep : redCheep).cloneNode(true);
        const wrap = document.createElement("div");
        wrap.className = "underwater-cheep" + (fish.reverse ? " reverse" : "");
        wrap.style.top = fish.lane;
        wrap.style.animationDuration = fish.duration + "s";
        wrap.style.animationDelay = (-fish.duration * fish.phase) + "s";
        wrap.appendChild(svg);
        parent.appendChild(wrap);
    });
}

function alignFishLayers() {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    document.documentElement.style.setProperty("--underwater-width", width + "px");
    if (underwaterPage) {
        underwaterPage.style.width = width + "px";
        underwaterPage.style.height = height + "px";
    }
    const layers = document.querySelectorAll(".underwater-fish");
    const frames = [];
    layers.forEach((layer) => {
        const card = layer.parentElement;
        frames.push({ layer, card, rect: card.getBoundingClientRect() });
    });
    frames.forEach((frame) => {
        frame.layer.style.width = width + "px";
        frame.layer.style.height = height + "px";
        frame.layer.style.left = -(frame.rect.left + frame.card.clientLeft) + "px";
        frame.layer.style.top = -(frame.rect.top + frame.card.clientTop) + "px";
    });
}

function queueAlignFishLayers() {
    if (alignQueued) return;
    alignQueued = true;
    requestAnimationFrame(() => {
        alignQueued = false;
        if (!underwaterRunning) return;
        alignFishLayers();
    });
}

function mountFish() {
    cheepTemplates();
    const page = document.querySelector(".wrapper") || document.body;
    underwaterPage = document.createElement("div");
    underwaterPage.className = "underwater-school";
    underwaterPage.setAttribute("aria-hidden", "true");
    fillSchool(underwaterPage);
    page.insertBefore(underwaterPage, page.firstChild);

    document.querySelectorAll(".box.page_raised").forEach((card) => {
        if (card.querySelector(":scope > .underwater-fish")) return;
        card.dataset.underwaterOwned = "1";
        card.style.position = "relative";
        card.style.overflow = "hidden";
        const layer = document.createElement("div");
        layer.className = "underwater-fish";
        layer.setAttribute("aria-hidden", "true");
        fillSchool(layer);
        card.insertBefore(layer, card.firstChild);
    });
    alignFishLayers();
    page.addEventListener("scroll", queueAlignFishLayers);
    window.addEventListener("resize", queueAlignFishLayers);
}

function mountFishWhenLaidOut() {
    let attempts = 0;
    const attempt = () => {
        if (!underwaterRunning) return;
        const sample = document.querySelector(".box.page_raised");
        if (!sample) return;
        if (sample.clientHeight === 0 && attempts++ < 60) {
            requestAnimationFrame(attempt);
            return;
        }
        mountFish();
    };
    requestAnimationFrame(attempt);
}

function paintBubble(bubble, scale) {
    bubble.el.style.transform = "translate(" + bubble.x + "px, " + bubble.y + "px) scale(" + scale + ")";
}

function spawnBubble(bubble) {
    bubble.x = pointer.x + (Math.random() * 20 - 10);
    bubble.y = pointer.y + (Math.random() * 12 - 6);
    bubble.risen = 0;
    bubble.riseLimit = 90 + Math.random() * 50;
    bubble.drift = 0.8 + Math.random() * 0.8;
    bubble.alive = true;
    paintBubble(bubble, 1);
}

function makeBubble(i) {
    const el = document.createElement("div");
    el.className = "underwater-bubble";
    el.setAttribute("aria-hidden", "true");
    const size = BUBBLE_SIZES[i % BUBBLE_SIZES.length];
    el.style.width = size + "px";
    el.style.height = size + "px";
    document.body.appendChild(el);
    const bubble = {
        el,
        size,
        x: 0,
        y: 0,
        drift: 1,
        risen: 0,
        riseLimit: 120,
        alive: false,
        wait: i * 5,
    };
    paintBubble(bubble, 0);
    return bubble;
}

function onUnderwaterPointer(event) {
    pointer = { x: event.clientX, y: event.clientY };
}

function bubbleFrame() {
    underwaterFrame = requestAnimationFrame(bubbleFrame);
    if (!underwaterRunning || document.hidden) return;
    for (let i = 0; i < bubbles.length; i++) {
        const bubble = bubbles[i];
        if (!pointer) {
            paintBubble(bubble, 0);
            continue;
        }
        if (!bubble.alive) {
            bubble.wait -= 1;
            if (bubble.wait <= 0) spawnBubble(bubble);
            continue;
        }
        bubble.y -= bubble.drift;
        bubble.risen += bubble.drift;
        const life = bubble.risen / bubble.riseLimit;
        if (life >= 1) {
            bubble.alive = false;
            bubble.wait = 6 + Math.floor(Math.random() * 16);
            paintBubble(bubble, 0);
            continue;
        }
        paintBubble(bubble, 1 - life);
    }
}

function startUnderwaterAnimation() {
    if (underwaterRunning) return;
    underwaterRunning = true;
    pointer = null;
    mountFishWhenLaidOut();
    bubbles = [];
    for (let i = 0; i < BUBBLE_COUNT; i++) bubbles.push(makeBubble(i));
    window.addEventListener("pointermove", onUnderwaterPointer);
    window.addEventListener("pointerdown", onUnderwaterPointer);
    underwaterFrame = requestAnimationFrame(bubbleFrame);
}

function stopUnderwaterAnimation() {
    underwaterRunning = false;
    if (underwaterFrame) {
        cancelAnimationFrame(underwaterFrame);
        underwaterFrame = 0;
    }
    window.removeEventListener("pointermove", onUnderwaterPointer);
    window.removeEventListener("pointerdown", onUnderwaterPointer);
    if (underwaterPage && underwaterPage.parentElement) {
        underwaterPage.parentElement.removeEventListener("scroll", queueAlignFishLayers);
    }
    window.removeEventListener("resize", queueAlignFishLayers);
    document.documentElement.style.removeProperty("--underwater-width");
    document.querySelectorAll(".underwater-school").forEach((node) => node.remove());
    document.querySelectorAll(".underwater-fish").forEach((node) => node.remove());
    document.querySelectorAll(".underwater-bubble").forEach((node) => node.remove());
    underwaterPage = null;
    document.querySelectorAll(".box.page_raised").forEach((card) => {
        if (card.dataset.underwaterOwned !== "1") return;
        card.style.position = "";
        card.style.overflow = "";
        delete card.dataset.underwaterOwned;
    });
    bubbles = [];
    pointer = null;
}
