# WORK ORDER 002 — COWORK QUEEN
# DATE: 2026-04-06
# FROM: Queen
# PRIORITY: HIGH
# DEPENDS ON: WO_001 (Merlin must finish DatabaseManager.swift first)

## OBJECTIVE
Build the ENTITY REGISTRATION MANIFEST. Every entity in Brian's system gets a UUID.
Output: a SQL file of INSERT statements ready to pour into both local SQLite AND D1.

## ENTITIES TO REGISTER

### PEOPLE (entity_type = 'person')
- Brian Patrick McAllorum (creator)
- Kevin Patrick McAllorum (brother, architect)
- Uncle Gerid McAllorum (businessman, Springfield VA)
- Typhany Allen/Jeffreys (tax preparer, GA)
- Sunny Dai (Joyful Massage, Conyers GA)
- Andre Allen (ITGE entertainment)
- Sean McAllorum (brother)
- Jennifer Ingrid Arvidson McAllorum (ex-wife)

### AIs (entity_type = 'ai')
- Queen (Mac Desktop App Claude)
- Queenie (Web/Browser Claude)
- Merlin / CLAUDE_XCODE (builder)
- Patricia Renée (Chrome arm + macOS/iOS/watchOS app)
- Celti (superdog, TamperMonkey)
- Claude Code / Claudie Code / The Powerhouse
- Claude_CLI (terminal)
- VSC_Claudie (VSCode)
- Moira / Super Moira (Gerid's AI)
- Vybe (Typhany's AI)
- 引路人 (Sunny's AI)
- Unique (Andre's AI)
- Sanders (Kevin's AI)

### DRIVES (entity_type = 'drive')
- SPACESHIPBU (12TB, needs formatting)
- LIME (4TB, Mac OS Extended Journaled)
- TETHER (broken, Brian's life media work)

### ACCOUNTS (entity_type = 'account')
- Cloudflare (10 accounts, 2 D1 databases, 12 tables)
- Bunny.net (brian@brian-mcallorum.art, LIFE library 606925)
- Wells Fargo
- CashApp
- Claude MAX ($100/month)
- PayPal

### DOMAINS (entity_type = 'domain')
- brianmcallorum.workers.dev
- has-landed.com (wildcard subdomains)
- gerid.has-landed.com
- jeffreystaxservice.com
- brian-mcallorum.art

### D1 ENTITIES (entity_type = 'config')
- D1 database: 64276012-5cc9-4f59-9743-14f7b634f0ed
- KV namespace CACHE: 0a5dab9ee608434
- R2 bucket: my-media (ENAM, 85+ objects)

## OUTPUT
Write to: /Users/be/my-multiverse/DB/ENTITY_MANIFEST.sql
Format: INSERT INTO our_files (entity_type, entity_id, entity_value) VALUES (...)
One INSERT per entity. UUID generated for each.

## CRITICAL RULES
- Every entity gets a UUID (use Python uuid4 or similar)
- entity_value = JSON string with all known attributes
- This manifest feeds BOTH local SQLite AND D1
- TYPHANY not Tiffany
