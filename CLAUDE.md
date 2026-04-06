# CLAUDE.md — Kev's Kindle

Reference card for AI assistants working in this repo.

## Project Overview

Start page hosted on GitHub Pages, designed for the Kindle Paperwhite browser.
Zero build tools. No dependencies. Pure HTML/CSS/JS + JSON data files.

## File Structure

- `index.html` — static shell; all content rendered by app.js
- `styles.css` — all presentation styles
- `app.js` — fetches JSON, renders DOM
- `data/config.json` — site metadata, section definitions, display copy
- `data/links.json` — all link cards, keyed by section

## Hard Constraints

**JS (Kindle browser compat):**
- No ES6+ syntax: no arrow functions, no `let`/`const`, no template literals, no `class`
- `Promise` and `fetch` are allowed (Kindle Paperwhite 11th gen supports them)
- No build tools, bundlers, or transpilers — ever
- No npm, no `package.json`, no dependencies

**CSS (e-ink display):**
- No animations, no transitions
- High contrast only; minimal color palette
- Use CSS custom properties from `:root` — do not hardcode color values
- System fonts only (Georgia serif, Courier New monospace) — no Google Fonts or external font loads. This ensures instant rendering on Kindle's slow WiFi.

**Content:**
- All user-facing copy lives in JSON files, not hardcoded in JS or HTML

## Code Conventions

**CSS** — section dividers:
```css
/* ── SECTION NAME ── */
```

**JS** — section dividers:
```js
// ── SECTION NAME ──
```

**JS** — structure:
- Entire file wrapped in an IIFE: `(function () { ... })()`
- `var` for all variables; named `function` expressions or declarations
- DOM construction via `createElement` + `.textContent` — never `innerHTML` with data

**JSON** — every file has a top-level `_about` string as a metadata comment.

**File headers** — each file opens with a block comment: filename, one-line purpose, and a section list (see existing files for format).

## Adding a Link

Edit `data/links.json`. Add an object to the correct section array:

```json
{ "url": "https://example.com", "icon": "◆", "name": "Name", "desc": "Short description." }
```

Optional fields: `"site": "sitelabel"` (groups cards under a site label), `"flags": ["placeholder"]`.

## Adding a Section

1. Add entry to `sections` array in `data/config.json`:
   `{ "key": "mykey", "name": "My Section", "icon": "◆", "kindleVisible": true, "tagline": "..." }`
2. Add `"mykey": [ ... ]` array in `data/links.json`.
3. If using site grouping, add the site key to `siteLabels` in `config.json`.

## Testing

```bash
python3 -m http.server 8000          # open http://localhost:8000
python3 -m json.tool data/config.json  # validate JSON before committing
python3 -m json.tool data/links.json
```
