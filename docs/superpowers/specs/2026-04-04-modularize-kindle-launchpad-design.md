# Modularize Kindle Launchpad

**Date:** 2026-04-04
**Status:** Draft

## Problem

The entire Kindle Launchpad lives in a single `index.html` (~595 lines) with inline CSS, inline JS, and all link data hardcoded in HTML. Adding a link means editing HTML. Changing copy means hunting through markup. There's no separation between structure, style, behavior, and content.

## Goals

1. **Easy content editing** — update links, copy, and site config by editing JSON files, not HTML
2. **Clean separation of concerns** — HTML shell, CSS, JS, and data each in their own file
3. **Zero build steps** — edit JSON, git push, done. GitHub Pages serves it directly.
4. **Kindle compatibility** — the page must still work on Kindle's experimental browser (simple JS, lightweight DOM)
5. **Comment potential improvements** — code includes comments noting where enhancements like localStorage caching or service workers could be added, without implementing them

## Non-Goals

- No build tools, bundlers, or transpilers
- No templating libraries or frameworks
- No localStorage caching or offline support (noted in comments only)
- No routing or multi-page structure

## File Structure

```
KevsKindle/
├── index.html          # Minimal shell (~40 lines)
├── styles.css          # All CSS (extracted from current inline styles)
├── app.js              # Fetch data, render cards, device detection
└── data/
    ├── config.json     # Site metadata + section definitions
    └── links.json      # Link cards keyed by section
```

## Data Schemas

### config.json

```json
{
  "title": "Kindle Launchpad",
  "subtitle": "Your e-ink command center",
  "footer": "Kindle Launchpad · built for Paperwhite 11th gen",
  "badges": {
    "kindle": "⬤ kindle mode",
    "full": "○ full mode"
  },
  "modeDivider": "Desktop & Mobile Only",
  "sections": [
    {
      "key": "read",
      "name": "Read",
      "icon": "◆",
      "kindleVisible": true
    },
    {
      "key": "play",
      "name": "Play",
      "icon": "◆",
      "kindleVisible": true
    },
    {
      "key": "tools",
      "name": "Tools",
      "icon": "◆",
      "kindleVisible": true
    },
    {
      "key": "send",
      "name": "Send to Kindle",
      "icon": "◇",
      "kindleVisible": false
    },
    {
      "key": "ebooks",
      "name": "Ebook Management",
      "icon": "◇",
      "kindleVisible": false
    },
    {
      "key": "discovery",
      "name": "Book Discovery",
      "icon": "◇",
      "kindleVisible": false
    },
    {
      "key": "automation",
      "name": "Automation & RSS",
      "icon": "◇",
      "kindleVisible": false
    },
    {
      "key": "modding",
      "name": "Modding & Community",
      "icon": "◇",
      "kindleVisible": false
    }
  ]
}
```

**Section fields:**

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Matches the key in `links.json`. Also determines render order. |
| `name` | string | Display name in the section header |
| `icon` | string | Unicode character shown before section name |
| `kindleVisible` | boolean | Whether to show this section on Kindle devices |

### links.json

Links are grouped by section key. Each link object:

```json
{
  "read": [
    {
      "url": "https://reabble.com",
      "icon": "☰",
      "name": "Reabble",
      "desc": "RSS reader built for e-ink. Syncs with Inoreader."
    }
  ],
  "tools": [
    {
      "url": "http://192.168.1.x:8080",
      "icon": "⊟",
      "name": "Calibre Server",
      "desc": "Edit the URL in this file → your local IP:8080",
      "flags": ["placeholder"]
    }
  ]
}
```

**Link fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | yes | Link href |
| `icon` | string | yes | Unicode character or emoji for the card |
| `name` | string | yes | Card title |
| `desc` | string | yes | Card description text |
| `flags` | string[] | no | Optional flags. Currently supported: `"placeholder"` (dashed border, no shadow, monospace desc) |

## index.html Shell

Minimal HTML that shows the header immediately (no flash of empty page) with a loading placeholder for content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kindle Launchpad</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="header">
    <h1>Kindle Launchpad</h1>
    <div class="subtitle">Your e-ink command center</div>
    <div class="device-badge">loading…</div>
  </div>
  <div id="content">
    <div class="loading">Loading links…</div>
  </div>
  <script src="app.js"></script>
</body>
</html>
```

The hardcoded header text in the shell matches config.json defaults. `app.js` overwrites them from config on load, so they serve as a fallback that prevents layout shift.

## styles.css

Direct extraction of the current `<style>` block with these changes:

- **Add:** A `.loading` class for the loading state text (styled to match `.footer p` — small, muted, centered)
- **Remove:** `.non-kindle { display: none; }` and `body.show-all .non-kindle { display: block; }` — no longer needed since `app.js` controls section visibility by conditionally rendering them rather than hiding via CSS
- **Simplify:** `.mode-divider` no longer needs `display: none` and the `body.show-all` override — the divider is only inserted into the DOM when it should be visible, so it can default to `display: block` (or just remove the display rules entirely)

## app.js Logic

```
IIFE (no globals)

1. Device detection
   - Check navigator.userAgent for Kindle/Silk/KF* patterns
   - Set isKindle boolean
   - If NOT kindle: add 'show-all' class to body

2. Fetch data
   - Promise.all([fetch('data/config.json'), fetch('data/links.json')])
   - Parse both as JSON
   // Future: could cache in localStorage to avoid refetch on revisit

3. Render header
   - Set document.title from config.title
   - Update h1 text from config.title
   - Update .subtitle text from config.subtitle
   - Update .device-badge text from config.badges (kindle vs full)

4. Render sections
   - Clear #content
   - dividerInserted = false
   - For each section in config.sections:
     - If isKindle && !section.kindleVisible → skip
     - If !section.kindleVisible && !dividerInserted:
       - Insert mode-divider element with text from config.modeDivider
       - dividerInserted = true
     - Create section div with:
       - section-header containing icon span + h2 with section name
       - card-grid div
     - For each link in links[section.key]:
       - Create <a class="card"> with:
         - card-top div (card-icon span + card-name span)
         - card-desc div
       - If link.flags includes "placeholder" → add .placeholder class
     - Append section to #content

5. Render footer
   - Create footer div from config.footer

6. Error handling
   - On fetch failure: replace #content with
     "Couldn't load links. Try refreshing."
   // Future: could fall back to localStorage cached data
```

**DOM construction:** Uses `document.createElement` and property assignment throughout. No `innerHTML` with user data. The JSON files are under your control so injection isn't a real risk, but `createElement` is the right habit and reads cleaner for this structure.

## What Changes vs Current Behavior

- **Identical visual output** — the rendered page looks and behaves exactly the same
- **Identical Kindle detection** — same UA regex, same class toggle
- **Loading state added** — brief "Loading links..." text before cards render (invisible on fast connections)
- **Error state added** — message shown if fetch fails (currently impossible since everything is inline)

## Potential Improvements (commented in code, not implemented)

These will appear as code comments in `app.js`:

1. **localStorage caching** — cache JSON responses so repeat visits render instantly, fetch in background to update
2. **Service worker** — full offline support for the page and its data
3. **Config-driven theme** — add color variables to config.json for theme customization
4. **Search/filter** — client-side filtering across all cards
5. **Drag-and-drop reorder** — persist section/card order to localStorage
