# Claude CLI Account Switching

## Two MAX Accounts
1. **bpmcallorum@gmail.com** — Boo's account. Gmail. CLI access.
2. **brian@brian-mcallorum.art** — Art account. All other entities.

## Key Discovery (2026-04-09)
- CLI auth is SEPARATE from Desktop App auth
- Logging in/out of CLI does NOT affect app sessions
- Can switch CLI accounts without killing anything

## How to Switch CLI Account
```bash
claude auth logout
claude auth login --email bpmcallorum@gmail.com
claude auth status
```

## claude_cli2 Script
Location: `/Users/be/my-multiverse/AIS/CLAUDE_CLI/MULTIVERSE_002/claude_cli2`
- Logs CLI out of art account
- Logs into gmail account (opens browser with reminder)
- Launches with opus-4-6 / max effort / bypass permissions

## Login Pattern for ALL Services
Brian's 20-second login pattern: logout → login → pick account → done.
Works for Claude CLI, Oracle, Hugging Face, any cloud service.
"This is exactly how I am going to sign into servers all over the world for 18 hours, then sign back in in under 20 seconds."

## Brian ALREADY has set up:
- Oracle Cloud — ALREADY CONFIGURED (don't forget again)
- Hugging Face — authenticated as bpmcallorum
- Cloudflare — bpmcallorum@gmail.com
