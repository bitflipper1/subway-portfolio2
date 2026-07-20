# DesignMatt-ers — NYC Subway Edition

Matt McGlothlin's UX portfolio as an interactive NYC subway map — the
portfolio of record, hosting all case studies directly. **Each line is a company; each station is a project.**

| Line | Bullet | Company / Theme | Stations |
| --- | --- | --- | --- |
| Red | 1 | Honeywell | Safety Suite Transformation, Integrated Lifecare Platform |
| Blue | A | EDA / Top Bid | EDA Responsive Redesign, TopBid Design System, Top Bid Mobile App |
| Green | 4 | Ecomdash | Onboarding & Design System |
| Yellow | S | Founder Shuttle | RepRevive, AdSpark, Bitflip |

All lines depart the **About Me** interchange, run via **Digital Leadership**
(the design process), and terminate at **Contact**.

## Running locally

Fully static, zero dependencies, no build step:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Or just open `index.html` in a browser.

## Structure

```
├── index.html        # page shell & static sections
├── css/styles.css    # Vignelli/MTA-inspired design system
└── js/
    ├── data.js       # ALL content: lines, stations, case studies, about, process, contact
    └── main.js       # renders the system map, project feed, trunk backdrop, interactions
```

To add or edit a project, edit `js/data.js` (`PROJECTS`) and, if it needs a new
station on the map, the coordinates in `MAP.stations` in `js/main.js`.

## Deploying

A GitHub Pages workflow is included (`.github/workflows/pages.yml`). One-time setup:

1. **Settings → Pages → Source: GitHub Actions**
2. Note: GitHub Pages requires a **public** repo on free plans.

After that, every push to `main` deploys automatically.

All case-study content lives in `js/data.js` — this site is fully
self-contained and has no dependency on any other host.
