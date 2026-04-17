CLAUDE CODE — 6 WORK ORDERS FROM QUEEN. READ AND EXECUTE IN ORDER.

File: /Users/be/my-multiverse/AIS/CLAUDIE_CODE_MAC_ANTHROPIC_APP/WO_BATCH_006.md

Summary:
1. Add GET /api/entities endpoint to Worker (read from our_files, filter by type/id)
2. Add POST /api/entities endpoint (insert/update, god-mode auth)
3. Add GET/POST /api/media endpoints (our_media table — HSB columns)
4. Entity Dashboard HTML page at /dashboard route
5. Update gerid.has-landed.com with "Powered by McAllorum Connected Systems" footer + live entity count
6. Deploy and verify all endpoints work

Worker source: /Users/be/Documents/my-multiverse/WORKER/src/index.js
D1: 64276012-5cc9-4f59-9743-14f7b634f0ed
Deploy: cd /Users/be/Documents/my-multiverse/WORKER && npx wrangler deploy
DO NOT break existing routes.
 
