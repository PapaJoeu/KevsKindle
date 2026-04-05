# Modularize Kindle Launchpad — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break the monolithic `index.html` into separate HTML shell, CSS, JS, and JSON data files so content can be updated by editing JSON instead of HTML.

**Architecture:** Zero-build static site. `index.html` is a minimal shell that loads `styles.css` and `app.js`. On load, `app.js` fetches `data/config.json` (site metadata, section definitions) and `data/links.json` (all link cards), then renders the page. GitHub Pages serves everything directly.

**Tech Stack:** Vanilla HTML, CSS, JS. No dependencies, no build tools.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `data/config.json` | Create | Site title, subtitle, footer, badges, mode divider text, section definitions |
| `data/links.json` | Create | All link cards keyed by section |
| `styles.css` | Create | All styles (extracted from `index.html` `<style>` block, with cleanup) |
| `app.js` | Create | Device detection, data fetching, DOM rendering, error handling |
| `index.html` | Rewrite | Minimal shell (~20 lines) with header fallback and loading state |

---

### Task 1: Create `data/config.json`

**Files:**
- Create: `data/config.json`

- [ ] **Step 1: Create the data directory and config file**

Create `data/config.json` with all site metadata and section definitions extracted from `index.html`:

```json
{
  "title": "Kindle Launchpad",
  "subtitle": "Your e-ink command center",
  "footer": "Kindle Launchpad \u00b7 built for Paperwhite 11th gen",
  "badges": {
    "kindle": "\u2b24 kindle mode",
    "full": "\u25cb full mode"
  },
  "modeDivider": "Desktop & Mobile Only",
  "sections": [
    { "key": "read",       "name": "Read",               "icon": "\u25c6", "kindleVisible": true },
    { "key": "play",       "name": "Play",               "icon": "\u25c6", "kindleVisible": true },
    { "key": "tools",      "name": "Tools",              "icon": "\u25c6", "kindleVisible": true },
    { "key": "send",       "name": "Send to Kindle",     "icon": "\u25c7", "kindleVisible": false },
    { "key": "ebooks",     "name": "Ebook Management",   "icon": "\u25c7", "kindleVisible": false },
    { "key": "discovery",  "name": "Book Discovery",     "icon": "\u25c7", "kindleVisible": false },
    { "key": "automation", "name": "Automation & RSS",    "icon": "\u25c7", "kindleVisible": false },
    { "key": "modding",    "name": "Modding & Community", "icon": "\u25c7", "kindleVisible": false }
  ]
}
```

- [ ] **Step 2: Validate JSON**

Run: `python3 -c "import json; json.load(open('data/config.json')); print('valid')"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add data/config.json
git commit -m "feat: add config.json with site metadata and section definitions"
```

---

### Task 2: Create `data/links.json`

**Files:**
- Create: `data/links.json`

- [ ] **Step 1: Create links.json with all link data extracted from index.html**

Every link card from the current `index.html`, grouped by section key. The `flags` field is only included when non-empty.

```json
{
  "read": [
    { "url": "https://reabble.com", "icon": "\u2630", "name": "Reabble", "desc": "RSS reader built for e-ink. Syncs with Inoreader." },
    { "url": "https://en.m.wikipedia.org", "icon": "W", "name": "Wikipedia", "desc": "Mobile encyclopedia. Fast on Kindle browser." },
    { "url": "https://www.gutenberg.org", "icon": "\ud83d\udcd6", "name": "Project Gutenberg", "desc": "70,000+ free public domain ebooks to download." },
    { "url": "https://standardebooks.org", "icon": "\u2726", "name": "Standard Ebooks", "desc": "Beautifully formatted open-source classics." },
    { "url": "https://old.reddit.com/r/kindle", "icon": "\u25cb", "name": "r/kindle", "desc": "Old Reddit works on Kindle. Tips, deals, hacks." }
  ],
  "play": [
    { "url": "https://kindleplay.com", "icon": "\u25a6", "name": "KindlePlay", "desc": "Sudoku, Hangman, Minesweeper, Lost PIN." },
    { "url": "https://www.brainbashers.com", "icon": "\u25e7", "name": "Brainbashers", "desc": "Futoshiki, Kakuro, Slitherlink, and dozens more." },
    { "url": "https://www.cryptograms.org", "icon": "\u2318", "name": "PuzzleBaron", "desc": "Cryptograms, logic puzzles, codewords." },
    { "url": "https://ink777.com", "icon": "\u2660", "name": "ink777", "desc": "Blackjack, Wordle, Solitaire, Checkers, Snake." }
  ],
  "tools": [
    { "url": "https://kinstant.com", "icon": "\u26a1", "name": "Kinstant", "desc": "Fast-loading start page with web shortcuts." },
    { "url": "https://forecast.weather.gov", "icon": "\u2601", "name": "Weather.gov", "desc": "Lightweight NOAA forecast. Enter your zip." },
    { "url": "https://rekindle.ink", "icon": "\u229e", "name": "ReKindle", "desc": "To-do, notes, flashcards, habits, Spotify remote." },
    { "url": "https://mail.google.com/mail/mu", "icon": "\u2709", "name": "Gmail", "desc": "Mobile Gmail. Read and compose on e-ink." },
    { "url": "https://lite.duckduckgo.com/lite", "icon": "\u2315", "name": "DuckDuckGo Lite", "desc": "Ultra-lightweight search. No clutter, fast loads." },
    { "url": "http://192.168.1.x:8080", "icon": "\u229f", "name": "Calibre Server", "desc": "Edit the URL in this file \u2192 your local IP:8080", "flags": ["placeholder"] }
  ],
  "send": [
    { "url": "https://www.pushtokindle.com", "icon": "\u2192", "name": "Push to Kindle", "desc": "One-click article cleanup and delivery." },
    { "url": "https://www.instapaper.com", "icon": "\u25a4", "name": "Instapaper", "desc": "Save articles, auto-deliver digests to Kindle." },
    { "url": "https://ktool.io", "icon": "K", "name": "KTool", "desc": "Send articles and newsletters to Kindle." },
    { "url": "https://any2k.com", "icon": "\u2200", "name": "Any2K", "desc": "Archive articles, RSS, files with Kindle delivery." },
    { "url": "https://epub.press", "icon": "\u2295", "name": "EpubPress", "desc": "Compile open browser tabs into one ebook." },
    { "url": "https://p2k.co", "icon": "P", "name": "P2K", "desc": "Pocket to Kindle bridge. 5 free articles/week." },
    { "url": "https://www.amazon.com/sendtokindle", "icon": "\u25c8", "name": "Send to Kindle", "desc": "Amazon's official browser extension." }
  ],
  "ebooks": [
    { "url": "https://calibre-ebook.com", "icon": "\u229f", "name": "Calibre", "desc": "Library management, conversion, metadata, server." },
    { "url": "https://github.com/noDRM/DeDRM_tools", "icon": "\u2297", "name": "DeDRM Plugin", "desc": "Strip DRM from Kindle, Kobo, Adobe ebooks." },
    { "url": "https://www.mobileread.com/forums/showthread.php?t=291290", "icon": "\u2298", "name": "KFX Input", "desc": "Calibre plugin for Amazon's KFX format." },
    { "url": "https://github.com/janeczku/calibre-web", "icon": "\u229e", "name": "Calibre-Web", "desc": "Modern web UI for your Calibre library." },
    { "url": "https://github.com/crocodilestick/Calibre-Web-Automated", "icon": "\u22a0", "name": "CWA", "desc": "Calibre-Web + auto-ingest, cover enforcement." }
  ],
  "discovery": [
    { "url": "https://www.bookbub.com", "icon": "\u2605", "name": "BookBub", "desc": "Free daily personalized ebook deal alerts." },
    { "url": "https://openlibrary.org", "icon": "\u2302", "name": "Open Library", "desc": "Borrow ebooks from the Internet Archive." },
    { "url": "https://www.overdrive.com", "icon": "\u22a1", "name": "Libby / OverDrive", "desc": "Borrow from your local public library." }
  ],
  "automation": [
    { "url": "https://ifttt.com/search?q=kindle", "icon": "\u27f3", "name": "IFTTT Kindle", "desc": "Dropbox\u2192Kindle, Pocket\u2192Kindle, RSS\u2192Kindle." },
    { "url": "https://github.com/cdhigh/KindleEar", "icon": "\u27d0", "name": "KindleEar", "desc": "Self-hosted RSS aggregator with Kindle push." },
    { "url": "https://kindle4rss.com", "icon": "\u27d1", "name": "Kindle4RSS", "desc": "Deliver RSS feeds as ebooks to your Kindle." }
  ],
  "modding": [
    { "url": "https://github.com/koreader/koreader", "icon": "\u22b3", "name": "KOReader", "desc": "Open-source reader app. Requires jailbreak." },
    { "url": "https://kindlemodding.org", "icon": "\u2699", "name": "KindleModding.org", "desc": "Step-by-step jailbreak guides." },
    { "url": "https://kindlemodshelf.me", "icon": "\u25a7", "name": "Kindle Mod Shelf", "desc": "Curated directory of tools, games, plugins." },
    { "url": "https://www.mobileread.com/forums/", "icon": "\u22b6", "name": "MobileRead", "desc": "The main forum for Kindle modding and ebooks." },
    { "url": "https://wiki.mobileread.com/wiki/Kindle_Hacks_Information", "icon": "\u22b7", "name": "MobileRead Wiki", "desc": "Community-maintained Kindle hacking wiki." }
  ]
}
```

- [ ] **Step 2: Validate JSON and verify link count**

Run: `python3 -c "import json; d=json.load(open('data/links.json')); total=sum(len(v) for v in d.values()); print(f'valid — {len(d)} sections, {total} links')"`
Expected: `valid — 8 sections, 38 links`

- [ ] **Step 3: Commit**

```bash
git add data/links.json
git commit -m "feat: add links.json with all 38 link cards across 8 sections"
```

---

### Task 3: Create `styles.css`

**Files:**
- Create: `styles.css`
- Reference: `index.html` lines 7–210 (current `<style>` block)

- [ ] **Step 1: Extract CSS from index.html into styles.css**

Copy the entire contents of the `<style>` block (lines 8–209 of `index.html`) into `styles.css` with these changes:

1. **Keep** the `@import` for Google Fonts at the top
2. **Keep** all existing rules as-is except the removals/changes below
3. **Remove** these rules (no longer needed — JS controls visibility by conditional rendering):
   - `.non-kindle { display: none; }`
   - `body.show-all .non-kindle { display: block; }`
4. **Simplify** `.mode-divider` — remove `display: none;` (the divider is only inserted into the DOM when visible)
5. **Remove** `body.show-all .mode-divider { display: block; }` rule
6. **Add** at the end, before the closing comment:

```css
/* -- LOADING -- */
.loading {
  text-align: center;
  padding: 40px 0;
  font-size: 0.6em;
  color: var(--text-muted);
  letter-spacing: 0.06em;
}

/* -- ERROR -- */
.error {
  text-align: center;
  padding: 40px 0;
  font-size: 0.7em;
  color: var(--text-muted);
}
```

The full `styles.css` content should be approximately 180 lines.

- [ ] **Step 2: Verify no leftover show-all or non-kindle display rules**

Run: `grep -n 'show-all\|non-kindle' styles.css`
Expected: No output (no matches)

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: extract styles.css from inline styles, add loading/error states"
```

---

### Task 4: Create `app.js`

**Files:**
- Create: `app.js`

- [ ] **Step 1: Write app.js**

```javascript
// Kindle Launchpad — app.js
// Fetches config + link data from JSON, renders the page.
//
// Potential improvements (not implemented):
// - localStorage caching: cache JSON so repeat visits render instantly,
//   then fetch in background to update stale data.
// - Service worker: full offline support for the page and its data files.
// - Config-driven theme: move CSS custom properties into config.json
//   so users can customize colors without editing CSS.
// - Search/filter: client-side filtering across all cards.
// - Drag-and-drop reorder: let users rearrange sections/cards,
//   persist order to localStorage.

(function () {
  var ua = navigator.userAgent || '';
  var isKindle = /Kindle|Silk|KFTT|KFOT|KFJW|KFSA/i.test(ua);

  // Future: could cache fetched JSON in localStorage here
  // and render from cache immediately, then update in background.

  Promise.all([
    fetch('data/config.json').then(function (r) { return r.json(); }),
    fetch('data/links.json').then(function (r) { return r.json(); })
  ])
    .then(function (results) {
      var config = results[0];
      var links = results[1];
      render(config, links, isKindle);
    })
    .catch(function () {
      var content = document.getElementById('content');
      content.innerHTML = '';
      var msg = document.createElement('div');
      msg.className = 'error';
      msg.textContent = "Couldn't load links. Try refreshing.";
      content.appendChild(msg);
    });

  function render(config, links, isKindle) {
    // Update page title and header from config
    document.title = config.title;
    document.querySelector('.header h1').textContent = config.title;
    document.querySelector('.header .subtitle').textContent = config.subtitle;
    document.querySelector('.header .device-badge').textContent =
      isKindle ? config.badges.kindle : config.badges.full;

    var content = document.getElementById('content');
    content.innerHTML = '';

    var dividerInserted = false;

    config.sections.forEach(function (section) {
      // On Kindle, skip sections not meant for e-ink
      if (isKindle && !section.kindleVisible) return;

      // Insert the mode divider before the first non-kindle section
      if (!section.kindleVisible && !dividerInserted) {
        content.appendChild(createDivider(config.modeDivider));
        dividerInserted = true;
      }

      content.appendChild(createSection(section, links[section.key] || []));
    });

    // Footer
    var footer = document.createElement('div');
    footer.className = 'footer';
    var footerP = document.createElement('p');
    footerP.textContent = config.footer;
    footer.appendChild(footerP);
    content.appendChild(footer);
  }

  function createDivider(text) {
    var div = document.createElement('div');
    div.className = 'mode-divider';
    var span = document.createElement('span');
    span.textContent = text;
    div.appendChild(span);
    return div;
  }

  function createSection(section, sectionLinks) {
    var el = document.createElement('div');
    el.className = 'section';

    // Section header
    var header = document.createElement('div');
    header.className = 'section-header';

    var icon = document.createElement('span');
    icon.className = 'section-icon';
    icon.textContent = section.icon;
    header.appendChild(icon);

    var h2 = document.createElement('h2');
    h2.textContent = section.name;
    header.appendChild(h2);

    el.appendChild(header);

    // Card grid
    var grid = document.createElement('div');
    grid.className = 'card-grid';

    sectionLinks.forEach(function (link) {
      grid.appendChild(createCard(link));
    });

    el.appendChild(grid);
    return el;
  }

  function createCard(link) {
    var a = document.createElement('a');
    a.className = 'card';
    a.href = link.url;

    // Apply flags
    if (link.flags && link.flags.indexOf('placeholder') !== -1) {
      a.className += ' placeholder';
    }

    // Card top row: icon + name
    var top = document.createElement('div');
    top.className = 'card-top';

    var icon = document.createElement('span');
    icon.className = 'card-icon';
    icon.textContent = link.icon;
    top.appendChild(icon);

    var name = document.createElement('span');
    name.className = 'card-name';
    name.textContent = link.name;
    top.appendChild(name);

    a.appendChild(top);

    // Description
    var desc = document.createElement('div');
    desc.className = 'card-desc';
    desc.textContent = link.desc;
    a.appendChild(desc);

    return a;
  }
})();
```

Key notes for the implementer:
- Uses `var` and `.forEach` with function expressions — no ES6+ syntax, ensuring Kindle browser compatibility
- Uses `document.createElement` throughout — no `innerHTML` for user-facing content
- `Promise.all` is supported by the Kindle Paperwhite 11th gen browser (Chromium-based)
- The IIFE prevents any global variable leakage

- [ ] **Step 2: Verify no syntax errors**

Run: `node --check app.js`
Expected: No output (no syntax errors)

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add app.js — fetches JSON data and renders the page"
```

---

### Task 5: Rewrite `index.html` as Minimal Shell

**Files:**
- Rewrite: `index.html`

- [ ] **Step 1: Replace index.html with the minimal shell**

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
    <div class="device-badge">loading\u2026</div>
  </div>
  <div id="content">
    <div class="loading">Loading links\u2026</div>
  </div>
  <script src="app.js"></script>
</body>
</html>
```

This is ~20 lines. The header text matches `config.json` defaults and serves as a fallback that prevents layout shift while `app.js` loads and fetches data.

- [ ] **Step 2: Verify the shell is valid HTML**

Run: `python3 -c "from html.parser import HTMLParser; HTMLParser().feed(open('index.html').read()); print('valid')"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: rewrite index.html as minimal shell — all content now data-driven"
```

---

### Task 6: Manual Verification

**Files:**
- Read: all files created above

- [ ] **Step 1: Verify file structure**

Run: `find . -not -path './.git/*' -not -path './.superpowers/*' -not -path './docs/*' -type f | sort`

Expected:
```
./app.js
./data/config.json
./data/links.json
./index.html
./styles.css
```

- [ ] **Step 2: Verify link count matches original**

Run: `python3 -c "import json; d=json.load(open('data/links.json')); total=sum(len(v) for v in d.values()); print(f'{total} links across {len(d)} sections')"`
Expected: `38 links across 8 sections`

- [ ] **Step 3: Verify section count matches config**

Run: `python3 -c "import json; c=json.load(open('data/config.json')); print(f'{len(c[\"sections\"])} sections'); print('kindle:', sum(1 for s in c['sections'] if s['kindleVisible'])); print('non-kindle:', sum(1 for s in c['sections'] if not s['kindleVisible']))"`
Expected:
```
8 sections
kindle: 3
non-kindle: 5
```

- [ ] **Step 4: Serve locally and visually verify**

Run: `python3 -m http.server 8000`

Then open `http://localhost:8000` in a browser. Verify:
- Header shows "Kindle Launchpad" with subtitle and "full mode" badge
- All 8 sections render with correct names and icons
- "Desktop & Mobile Only" divider appears between Tools and Send to Kindle
- All 38 link cards show with correct icons, names, descriptions, and URLs
- Calibre Server card has dashed border (placeholder style)
- Footer shows at the bottom

Stop the server with Ctrl+C when done.

- [ ] **Step 5: Verify no regressions in styles**

While the local server is running, check:
- Card grid is 2 columns on wide screens, 1 column below 400px
- Cards have the correct background, border, and shadow
- Fonts load correctly (Literata for body, JetBrains Mono for badges and placeholder descriptions)
- `:active` state on cards shows the tan background (#e8e3da)

- [ ] **Step 6: Final commit if any fixes were needed**

If any corrections were made during verification:
```bash
git add -A
git commit -m "fix: address issues found during manual verification"
```
