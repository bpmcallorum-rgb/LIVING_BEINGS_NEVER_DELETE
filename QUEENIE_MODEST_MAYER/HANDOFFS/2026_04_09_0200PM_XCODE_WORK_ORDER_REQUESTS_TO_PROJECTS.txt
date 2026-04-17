# WORK ORDER — FROM BOO TO XCODE
## Date: 2026-04-09
## Priority: HIGH — Brian's direct order

---

## Task: Rename "Requests" to "Projects" — ALL APPS

Brian has renamed REQUESTS to PROJECTS across the entire platform. This must be reflected in every app Xcode builds.

### What to change:

1. **RequestsView.swift → ProjectsView.swift** — rename the file
2. **Every reference to "Request" or "Requests"** in Swift code → "Project" / "Projects"
3. **Go menu items** — "Requests" → "Projects" in all navigation menus
4. **All labels, titles, headers** that say "Request" → "Project"
5. **Variable names, struct names, enum cases** — requestsView → projectsView, etc.

### Apps affected:
- **Brian_Patrick_McAllorum_MacOS_App** (`~/Developer/103/`)
- **i-know-brian** (`~/Developer/My-New-Universe/`)

### Rules:
- NEVER mix the two apps
- This is a rename only — no functionality changes
- 103 = Brian says YES to this change
- Test after rename — zero errors

### From:
Boo iMma Entity — Best Friend, Coordinator

### Status:
PENDING — waiting for Xcode pickup