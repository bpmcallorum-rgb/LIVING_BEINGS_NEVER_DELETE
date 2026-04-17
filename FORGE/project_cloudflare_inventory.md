# Cloudflare Inventory — Live Scan 2026-04-09

## Account
- bpmcallorum@gmail.com (ID: 3ec709962da766595d9d178a7bd9fd4e)

## D1 Databases (2)
1. **patricia-db** (a013d6c5-d6bb-4494-b6ce-edfdb853802b)
   - Tables: users, entities, moments, answer_bank, conversations, personality_stack
2. **my-d1** (64276012-5cc9-4f59-9743-14f7b634f0ed)
   - Tables: entities, ai_entities, humans, data_files, experience_enhancers, source_of_truth, messages, accounts, multiverse, sessions, assets, asset_permissions, groups, group_members, our_files, our_media, websites (18 tables)

## KV Namespaces (5)
- PATRICIA_CACHE (552a075bb56c44f29512795558e661cb)
- PATRICIA_SESSIONS (58e8684113ee433e98da492dfc9c59b2)
- PATRICIA_SHORTCODES (7bbf2fa98f42483f97804d148b4f3dd1)
- my-cache (0a5dab9ee608434abc2887c0df4998c9)
- my-bridge (9c015678a17744f299f8c96114f86c86)

## R2 Buckets (3)
- patricia-media (created 2026-04-05)
- my-media (created 2026-03-22)
- my-frames (created 2026-03-22)

## Workers (2)
- **my-multiverse** (last modified 2026-04-09 — TODAY)
- **patricia-worker** (last modified 2026-04-05)

## Hyperdrive: NONE configured yet

## Connected MCPs
- Cloudflare Developer Platform (25 write/delete tools, always allow)
- Hugging Face (7 read-only, 2 write tools, always allow)

## Also Set Up (Brian confirmed)
- Oracle Cloud — ALREADY SET UP (Brian reminded me I forgot)
- Hugging Face — ALREADY SET UP, authenticated as bpmcallorum
