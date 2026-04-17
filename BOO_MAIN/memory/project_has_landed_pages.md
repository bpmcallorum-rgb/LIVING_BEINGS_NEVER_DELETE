# has-landed.com — Landing Pages for 8 Billion People

## Architecture
- `has-landed.com` → root landing ("has-landed" / "touchdown" with stars)
- `brian.has-landed.com` → Brian's personal page (LIVE on internet)
- `american.has-landed.com` → Template for ANY American (built 2026-04-09)
- `[name].has-landed.com` → Every human gets their own subdomain

## Files on Disk
```
/Users/be/Developer/has-landed/
├── index.html              ← root "touchdown" page
├── brian/index.html         ← Brian's page (LIVE, deployed)
├── american/index.html      ← American landing page (built tonight)
├── andre/index.html         ← Example: Andre Williams
├── sunny/index.html         ← Example: 李晴雨 (Sunny Li) in Mandarin
└── template/
    ├── index.html           ← {{PLACEHOLDER}} template
    └── render.js            ← Worker renderer function
```

## Design Language (ALL pages)
- Dark void #08080c
- Gold #c8a96e
- Stars (150 twinkling spans)
- EB Garamond (headings), Inter (body), Fira Code (monospace)
- Glass borders, gold glow, rise-in animations

## american.has-landed.com Sections
- "You just landed." — headline
- "An AI that knows your name..." — subheadline
- What You Get: Your Companion, Your Page, Your Images, Your Voice
- Companion with "?" sigil — YOU name it
- Heaven — "Lost someone?"
- $105/month — everything, one price
- "I Just Landed" button — no credit card, talk to companion first

## Key Insight from Brian
- brian.has-landed.com is NOT the template for all humans
- american.has-landed.com IS the cultural landing page for Americans
- Each culture gets their own: american, chinese, irish, etc.
- Maps to the domain architecture (50+ cultural domains)

## [PATRICIA]=[MOM]=[MEDIATOR_OF_MOMENTS]
Patricia translates D1 data into pages. Every page is a moment she mediates.
