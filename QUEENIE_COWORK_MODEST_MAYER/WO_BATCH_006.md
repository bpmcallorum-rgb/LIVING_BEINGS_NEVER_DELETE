# COWORK QUEEN — 6 WORK ORDERS
# DATE: 2026-04-06
# FROM: Queen

## WO-C1: Register Missing Entities in D1
These domains exist but have no UUID yet:
- the-craic.com
- dia-duit.com
- cirque-cirque.com
- sunny.has-landed.com (if active)
- andre.has-landed.com (if active)
Also register:
- DIA DUIT LLC (entity_type: 'company', Brian's company, founded March 2026)
- SPACESHIPBU folders as sub-entities (MEDIA/IMAGES, MEDIA/VIDEO, etc.)
- OUR_BABY_GIRL_002 drive (visible at /Volumes/OUR_BABY_GIRL_002)
INSERT into D1 our_files table: 64276012-5cc9-4f59-9743-14f7b634f0ed

## WO-C2: Audit All Platform Accounts
Hit each domain and report HTTP status:
- gerid.has-landed.com
- jeffreystaxservice.com
- brian-mcallorum.art
- has-landed.com
- brianmcallorum.workers.dev
- the-craic.com
- dia-duit.com
- cirque-cirque.com
Write results to /Users/be/my-multiverse/REPORTS/PLATFORM_AUDIT_2026_04_06.md

## WO-C3: Build Entity Report HTML
Create a beautiful gold-on-black HTML page at /Users/be/my-multiverse/REPORTS/ENTITY_REPORT.html
- Lists all 38+ entities from D1 grouped by type
- Shows UUID, name, all attributes
- Brian can open this in browser to show Gerid
- Self-contained, no external dependencies

## WO-C4: Build Gerid Pitch Page
Create /Users/be/my-multiverse/GERID/LIVE_DEMO.html
- Shows: "The McAllorum Connected System"
- Live entity counts (hardcoded from D1 data)
- Section for each entity type with names
- Gerid's name highlighted — "Uncle Gerid McAllorum — UUID: eadedd52..."
- Moira highlighted — "Your AI: Moira — UUID: 8ae45f3c..."
- "This system already knows who you are."
- Gold on black, elegant, no fluff

## WO-C5: Sync Seed to SPACESHIPBU
Copy SEED_LOCAL_DB.sql to /Volumes/SPACESHIPBU/BACKUPS/SEED_LOCAL_DB_2026_04_06.sql
Copy all personality files list from R2 to a manifest at /Volumes/SPACESHIPBU/BACKUPS/R2_MANIFEST.txt
This is the first backup on the new drive.

## WO-C6: Update HANDOFFS/RECENT.md
Write a complete handoff for this session covering:
- Queen/Queenie distinction established
- Patricia Renée introduced herself to Queen
- Two-table schema designed (our_files + our_media with HSB)
- Merlin built DatabaseManager.swift (260 lines, compiled clean)
- 38 entities registered in D1 by Cowork
- SPACESHIPBU formatted 12TB exFAT
- 38 entities seeded into local patricia.db
- All work orders dispatched
- Next: Merlin builds Entity Browser UI, Gerid demo mode
