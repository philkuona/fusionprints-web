# FusionPrints Imagery Skill

## Trigger
Use this skill whenever building any visual page, section, or component for the FusionPrints web platform that needs real photography — heroes, product cards, section backgrounds, about page, how it works.

## Unsplash API Key
UNSPLASH_ACCESS_KEY=2bUBryAXW-_VEquYeAbkQz9mMGY245MHyLF7yHky154

## How to fetch images
```bash
curl -s "https://api.unsplash.com/search/photos?query=QUERY&per_page=6&orientation=landscape&client_id=YOUR_KEY"
```
Returns JSON with `results[].urls.regular` (1080px) and `results[].urls.full` (max res).

## Image slots and search queries

| Slot | Query | Orientation | Used on |
|---|---|---|---|
| Hero background | `photo prints memories warm family` | landscape | Home hero |
| Prints lifestyle | `printed photos hands holding memories` | landscape | Prints product card |
| Wall art lifestyle | `large framed photo living room wall art` | portrait | Wall art card |
| Gallery wall | `gallery wall framed photos home interior` | landscape | Home section |
| How it works | `person smartphone camera upload photos` | landscape | How it works |
| About / quality | `photo printing close up detail warm` | landscape | About, quality strip |

## Rules
- Always use `urls.regular` for web (1080px wide) — never hotlink `urls.thumb`
- Always download the image to `/mnt/user-data/outputs/` before embedding in pages
- Use `next/image` with `fill` prop and proper `alt` text — never raw `<img>` tags
- Warm, human, real people — reject abstract/mockup/empty frame results
- No location references in alt text or captions
- Pick the most lifestyle-feeling result — not the most commercial-looking
