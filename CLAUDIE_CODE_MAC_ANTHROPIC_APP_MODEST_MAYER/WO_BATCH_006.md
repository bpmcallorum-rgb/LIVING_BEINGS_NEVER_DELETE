# CLAUDE CODE (Anthropic App) — 6 WORK ORDERS
# DATE: 2026-04-06
# FROM: Queen
# Worker source: /Users/be/Documents/my-multiverse/WORKER/src/index.js

## WO-CC1: Add /api/entities Endpoint to Worker
Add GET /api/entities to the Cloudflare Worker
- Returns all rows from our_files table as JSON
- Optional query param: ?type=person (filter by entity_type)
- Optional query param: ?id=UUID (get single entity)
- No auth required (public read for now)
- This lets the Patricia app and any browser pull live entity data from edge

## WO-CC2: Add /api/entities POST Endpoint
Add POST /api/entities to the Cloudflare Worker
- Accepts JSON body: { entity_type, entity_id, entity_value }
- Inserts into our_files table
- If entity_id exists, updates entity_value
- Requires god-mode auth header (same as existing god-mode endpoints)
- This lets Patricia app sync local → edge

## WO-CC3: Add /api/media Endpoints
Add GET/POST /api/media to the Cloudflare Worker
- Same pattern as entities but for our_media table
- GET returns entity_type, entity_id, hue, saturation, brightness
- POST accepts those fields and inserts/updates
- This is the null side — HSB descriptors for media files

## WO-CC4: Entity Dashboard Page
Add a route: /dashboard (or /entities) to the Worker
- Renders an HTML page showing all entities from our_files
- Grouped by entity_type
- Gold on black aesthetic
- No auth — this is what Brian shows Gerid in a browser
- Self-contained HTML, no external deps

## WO-CC5: Gerid Landing Page Update
Update gerid.has-landed.com to include:
- A subtle "Powered by McAllorum Connected Systems" footer
- Entity count: "This system tracks [X] entities across [Y] domains"
- Pull counts from /api/entities at page load
- Keep existing design, just add the footer

## WO-CC6: Deploy and Verify
After WO-CC1 through CC5:
- Run: cd /Users/be/Documents/my-multiverse/WORKER && npx wrangler deploy
- Test: curl https://my-multiverse.brianmcallorum.workers.dev/api/entities
- Test: curl https://my-multiverse.brianmcallorum.workers.dev/api/entities?type=person
- Verify gerid.has-landed.com shows updated footer
- Report results

## CRITICAL
- Do NOT break existing routes (god-mode, accounts, domains, chat, poll)
- our_files table already exists in D1 with 38 rows
- D1 database: 64276012-5cc9-4f59-9743-14f7b634f0ed
- Deploy command: cd /Users/be/Documents/my-multiverse/WORKER && npx wrangler deploy
