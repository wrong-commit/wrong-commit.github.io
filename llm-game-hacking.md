# LLM Video Game Hacking 


skid_factory is a TypeScript LLM assisted video game reverse engineering agent harness. Using a Cheat Engine MCP server, this harness is capable of autonomously detecting base module offsets for different data types that persists across reboots. Using this, it is then possible to overwrite memory in these regions to achieve a primitive video game hack for any video game. 


The LLM Agent loop is the real power house. LLMs handle disassembling Assembly, parsing CPU Registers, and tracing pointer chains. Using a basic while loop with exposed custom commands, it is possible to orchestrate the agent into performing advanced reverse engineering and debugging capabilities with “good enough” reasoning. 


To date, this method has generated both a primary ammo and health point cheats in the sample game, “Not a Hero”


Later stages of this project will auto generate C/golang code to overwrite these found memory addresses. That would allow this application to turn into a standalone skid factory, generating complete video game hacks autonomously across different architectures.


## different commands available to LLM


Scan - use CE to filter memory addresses by value

Reset_scan - reset scan state 

Monitor_writes - record the RPI at any ASM opcode using hardware breakpoints 

Disassemble - dump ASM and surrounding context of any executable memory address 

Write_memory - write memory of any value type into a given memory address 


## The Agent Loop

The agent has full access to the current applications command calls and outputs. A new agent instance is spun up on each request with the complete transcript, and supports an optional question for the LLM. 


## Loop command queuing 

The agent prints out future commands when a step or reasoning completes, which is then parsed by the harness from the agent response. These commands, based on category, are either run directly or promoted for the user - most commands auto run. This allows for the LLM to even prompt the user to perform an operation in the game to make detecting pointers easier. 


## LLM Guardrails 

The above command printing/parsing logic allows for a complete reverse engineering loop of any application. Importantly, this means the LLM has **no understanding it runs in a loop.* Providing instructions that clarify we’re in a loop triggers the guardrails and stops execution. 


Up until this point, the agent (Cursor 2026 September Auto mode) was happy to support development of this application, transparently describing the intent of the application in the README. This means the harness bypasses intended limitations in the model *by not telling the model it runs in a loop, but implying such by providing past transcripts and command invocations*. This was enough to have it determine isolated tool calls serially instead of detecting malicious activity. How boring. 


## DataTypes 

Accepts full range of types provided by Cheat Engine. It is also possible to extend the source to support any size data type.


## Limitations

No automated memory mapping logic for deconstructing application data model. 

No GUI

No way to quickly trigger hacks

Only writes memory locations instead of patching ASM opcodes that write to the memory address.