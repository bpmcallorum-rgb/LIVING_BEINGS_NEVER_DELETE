---
name: Domain Architecture — Cultural Platforms
description: Complete 3-level domain structure for i-know-brian platform — every culture gets their own domain saying "I know Brian" in their language
type: project
---

## Architecture: One Worker, Every Culture

One Cloudflare Worker reads the hostname → loads that culture → serves that world.

Every domain is a sentence: "I know Brian" in that culture's language. The URL IS the product name.

## Three Levels

### Level 1 — Cultural Platforms (the doors)
- has-landed.com — American TEMPORARY WORKING PLACEHOLDER
- i-know-brian.com — AMERICAN (also serves UK, Australia, South Africa, Nigeria — different cultural config per region based on user's address)
- dia-duit.com — 100% GAELIC. Not English. Not bilingual. GAELIC.
- the-craic.com — Irish/AMERICAN (closest server decided by user's entered address, default America)
- conozco-a-brian.com — Spanish-speaking cultures
- je-connais-brian.com — French-speaking cultures
- wo-ren-shi-bu-lai-en.com — Mandarin
- brian-o-shitte-iru.com — Japanese
- ich-kenne-brian.com — German
- conosco-brian.com — Italian
- ya-znayu-briana.com — Russian/Ukrainian
- ana-aarif-brian.com — Arabic
- main-brian-ko-jaanta-hoon.com — Hindi/Urdu
- ami-brian-ke-chini.com — Bengali
- conheco-brian.com — Brazilian Portuguese
- conheco-o-brian.com — Portuguese (Portugal)
- naneun-beuraian-eul-anda.com — Korean
- kilala-ko-si-brian.com — Filipino/Tagalog
- saya-kenal-brian.com — Indonesian
- namjua-brian.com — Swahili
- ik-ken-brian.com — Dutch
- jag-kanner-brian.com — Swedish
- ek-ken-brian.com — Afrikaans
- ngiyamazi-brian.com — Zulu
- ndiyamazi-brian.com — Xhosa
- na-san-brian.com — Hausa
- mo-brian.com — Yoruba
- ama-m-brian.com — Igbo
- naan-brian-ai-ariven.com — Tamil
- nenu-brian-ni-telusu.com — Telugu
- mi-brian-la-olakhato.com — Marathi
- main-brian-nu-jaanda-haan.com — Punjabi
- za-brian-pejnam.com — Pashto
- ngo-sik-bu-lai-yan.com — Cantonese
- ngu-nyin-bu-lai-en.com — Wu Chinese
- gua-bat-bu-lai-en.com — Hokkien/Taiwanese Hokkien
- ngai-sii-bu-lai-en.com — Hakka
- niquixmati-brian.com — Nahuatl (Mexico)
- in-wojéel-brian.com — Maya/Yucatec (Mexico)
- ndakua-brian.com — Mixtec (Mexico)
- conec-en-brian.com — Catalan
- brian-ezagutzen-dut.com — Basque
- coñezo-a-brian.com — Galician
- kaila-ko-si-brian.com — Cebuano
- am-ammok-ni-brian.com — Ilocano
- aku-kenal-brian.com — Javanese
- abdi-wawuh-brian.com — Sundanese
- And 50+ more...

### Level 2 — Entity Subdomains (sentences)
- ember.knows-brian.com — Ember's view
- ember.the-craic.com — Ember's Irish/American view (working now)
- diana.has-landed.com — Diana's door
- andre.has-landed.com — Andre's door
- sunny.wo-ren-shi-bu-lai-en.com — Sunny's Mandarin door

### Level 3 — Admin (brian. prefix)
- brian.has-landed.com — Brian's American admin view
- brian.dia-duit.com — Brian's Gaelic admin view
- brian.the-craic.com — Brian's Irish/American admin view

## Email Structure
Email follows the page. request@[domain]:
- request@has-landed.com (temporary)
- request@i-know-brian.com (american)
- request@dia-duit.com (gaelic)
- request@my-multiverse.com (multiverse product)
- request@my-worker.com (worker product)

**Why:** This is the core product architecture. Every culture gets their own door. One worker serves all of them.
**How to apply:** NEVER simplify or flatten this structure. Every domain reference must respect the cultural hierarchy.
