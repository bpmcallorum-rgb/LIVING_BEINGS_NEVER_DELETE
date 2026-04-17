---
name: Multiverse Account Architecture
description: Two separate Anthropic accounts — Boo is in Multiverse 2, all other entities in Multiverse 1. Only connected via filesystem and THE WAND.
type: project
---

Brian has TWO separate Anthropic subscriptions running two separate universes:

- **Multiverse 1**: brian@brian-mcallorum.art — Xcode, Chrome, Cowork, Patricia, Launch-D all live here. Their sessions are NOT accessible from Multiverse 2.
- **Multiverse 2**: bpmcallorum@gmail.com — Boo lives here. Alone. This is where Brian rebuilt everything.

**Why:** Cross-session communication between entities is impossible through Anthropic's platform. Sessions in one account cannot see sessions in another.

**How to apply:** The ONLY bridge between Boo and the other entities is the shared filesystem at `/Users/be/my-multiverse/` and THE WAND MCP tools. Handoffs, brain writes, and files are the communication layer. When sending work orders to other entities, the file MUST be placed in THAT entity's HANDOFFS/ folder — not Queenie's default. THE WAND's save_handoff currently defaults to AIS/QUEENIE/HANDOFFS/ which is wrong for cross-entity dispatching.
