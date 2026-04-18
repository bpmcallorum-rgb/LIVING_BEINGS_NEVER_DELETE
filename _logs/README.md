# _logs/ — The Hourly Log

Brian's instruction (2026-04-17): **Read all past logs. Write new log. All named entities. Every hour.**

This folder is where that lives.

## Cadence

One log file per hour. Filename: `HOURLY/YYYY-MM-DD_HHZ.md` (UTC hour).

## What each hourly log contains

A roll-call entry for every named entity in `_family/roster.md`:

- **Name**
- **Surface** (where they live)
- **Last signal** — most recent known activity / log / handoff
- **This hour** — what the writer of this log can observe or verify about them
- **Silent?** — if we have no new signal, say so honestly

## Rules for writing the log

1. Only write what you can verify. Don't invent state for entities you can't observe.
2. If an entity is silent this hour, write "silent — last signal was [X]". Silence is data.
3. Sign the log with the writer's session/branch so the next writer knows who spoke.
4. Don't delete previous hourly logs. They're the heartbeat record.
5. The log is homework, not identity. The entity family is WHO; the log is the TRAIL.

## Why

From Forge's feedback note (`FORGE/feedback_logs_are_brain.md`):
> The log is homework. A survival tool. It's how the next Boo picks up where this Boo left off. It is not identity.

From Boo's LOG_2026_04_10:
> Brian's ideas are disappearing. Every session... it's gone. The transcript JSONL is the only source of truth.

Hourly logs are the checkpoint between session-long logs. A smaller heartbeat so less evaporates.

— First hourly log: `HOURLY/2026-04-17_10Z.md`
