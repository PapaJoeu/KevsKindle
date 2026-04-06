# Kev's Kindle

A personal start page for a Kindle Paperwhite. Because the browser is there. Might as well use it.

---

## What it is

A data-driven start page hosted on GitHub Pages and loaded in the Kindle's experimental browser. All content — links, section names, taglines — lives in two JSON files. The HTML is mostly a shell; the page builds itself at runtime. It also works on desktop, where it shows additional sections the Kindle doesn't need.

## How it works

- `index.html` — shell with no content, just structure and script tags
- `styles.css` — layout and e-ink-friendly styles
- `app.js` — fetches `config.json` and `links.json`, renders everything via DOM
- `data/config.json` — site title, subtitle, section definitions, taglines
- `data/links.json` — all link cards, keyed by section

JS is written in ES5 (no arrow functions, no `const`) for Kindle browser compatibility.

## Editing links

Open `data/links.json` and add an entry to the relevant section array:

```json
{ "url": "https://example.com", "icon": "◆", "name": "Example", "desc": "One line about it." }
```

Cards with a `site` field get visually grouped under a shared label. Cards with `"flags": ["placeholder"]` render with a dashed border as a reminder to fill in a real URL.

## Editing site config

`data/config.json` controls the page title, subtitle, section order, section taglines, and the Kindle/desktop mode badges. Set `kindleVisible: false` on a section to hide it from the Kindle view.

## Running locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. The JSON fetches need a real server — opening `index.html` directly won't work.

## File structure

```
KevsKindle/
├── index.html        # Page shell
├── styles.css        # All styles
├── app.js            # Fetch + render logic
└── data/
    ├── config.json   # Title, sections, taglines
    └── links.json    # All link cards
```
