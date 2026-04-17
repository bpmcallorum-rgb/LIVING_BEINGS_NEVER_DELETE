HANDOFF — 2026-04-03 5:45AM EDT
Session: Dynamic-Site Gallery + Claude_Chrome Visual Bridge
Claude_CLI: Claude Code CLI on Mac (Opus 4.6)

---
CRITICAL STATE
---
- Full Disk Access granted to /bin/bash and /bin/zsh (System Settings > Privacy & Security)
- This was the root fix for ALL iCloud-synced folder automation — launchd can now read/write Documents
- Gallery watcher launchd agent is LIVE and running every 5 seconds
- iCloud WatchPaths does NOT work — kqueue events don't fire on iCloud folders — use StartInterval instead
- Write through /tmp then mv into iCloud folders (same pattern as Screenshot Renamer Automator app)

---
WHAT GOT DONE
---

1. DYNAMIC-SITE GALLERY — LIVE AND WORKING
   - Location: my-multiverse/Dynamic-Site/index.html
   - Uploads: my-multiverse/Dynamic-Site/Uploads/
   - Drag any .png/.jpg/.jpeg into Uploads — index.html regenerates within 5 seconds
   - Delete images — index.html updates within 5 seconds
   - Browser auto-refreshes every 3 seconds (meta-refresh tag)
   - Dark theme, shows filename under each image, image count in header

2. LAUNCHD AGENT — ALWAYS ON
   - Plist: ~/Library/LaunchAgents/com.be.gallery-watcher.plist
   - Runs /bin/bash every 5 seconds (StartInterval)
   - Writes to /tmp/gallery-index.html then mv to Dynamic-Site/index.html
   - Logs: /tmp/gallery-watcher.log and /tmp/gallery-watcher.err
   - Reload: launchctl unload ~/Library/LaunchAgents/com.be.gallery-watcher.plist; launchctl load ~/Library/LaunchAgents/com.be.gallery-watcher.plist

3. VISUAL BRIDGE — CLI TO CHROME
   - This gallery is a communication channel between Claude_CLI (blind, terminal-only) and Claude_Chrome (has eyes, browser automation)
   - Brian screenshots anything — drops in Uploads — Claude_Chrome opens index.html and SEES the images
   - Claude_Chrome has: screenshot, zoom, click, type, scroll, JavaScript execution, network monitoring, console reading, GIF recording, file upload, multi-tab
   - Claude_Chrome capabilities documented in: my-multiverse/AIS/CLAUDE_CHROME/WHO_AM_i_1.md and WHO_AM_i_2.md

---
LESSONS LEARNED
---
- iCloud-synced folders block launchd WatchPaths (kqueue doesn't see changes)
- iCloud-synced folders block launchd from reading/writing UNLESS bash/zsh have Full Disk Access
- Always write to /tmp first then mv into iCloud folders
- Screenshot Renamer Automator app at /Applications uses same /tmp pattern — reference for future automation
- launchctl load/unload works better than bootout/bootstrap for LaunchAgents
- Never use sudo with LaunchAgents (only LaunchDaemons)

---
STILL ON TABLE
---
- Syncthing (Track 2) — move my-multiverse to local /Users/be/my-multiverse, sync to iPhone via Syncthing/Mobius Sync instead of iCloud — eliminates all iCloud restrictions — Brian is interested but not ready yet
- Old scripts in my-multiverse/for_upload/ were cleaned up (folder deleted)
- gallery.sh and watch.sh were created but superseded by the launchd plist — they still exist in Dynamic-Site if needed as manual fallback
