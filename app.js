/*
 * Kev's Kindle — app.js
 * Fetches config + link data from JSON, renders the page.
 * Avoids ES6+ syntax (no arrow functions, let/const, template literals)
 * for Kindle browser compatibility. Relies on Promise and fetch being available.
 *
 * Sections:
 *   - Device Detection
 *   - Data Fetching
 *   - Render Pipeline (render, createNav, createDivider, createSection, createCard)
 *
 * Potential improvements (not implemented):
 *   - localStorage caching: implemented — stale-while-revalidate renders
 *     from cache instantly, then refreshes in background.
 *   - Service worker: full offline support for the page and its data files.
 *   - Config-driven theme: move CSS custom properties into config.json
 *     so users can customize colors without editing CSS.
 *   - Search/filter: client-side filtering across all cards.
 *   - Drag-and-drop reorder: let users rearrange sections/cards,
 *     persist order to localStorage.
 */

(function () {

  // ── DEVICE DETECTION ──

  var ua = navigator.userAgent || '';
  // KFTT/KFOT/KFJW/KFSA are Kindle Fire hardware model codes
  var isKindle = /Kindle|Silk|KFTT|KFOT|KFJW|KFSA/i.test(ua);

  // ── DATA FETCHING ──
  // Stale-while-revalidate: render from cache instantly, refresh in background.
  // This eliminates the blank-page wait on Kindle's slow WiFi.

  var CACHE_KEY = 'kevs-kindle-data';

  // Try to render from cache immediately
  var cached = null;
  try {
    cached = JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch (e) { /* corrupt cache — ignore, will fetch fresh */ }

  if (cached && cached.config && cached.links) {
    render(cached.config, cached.links, isKindle);
  }

  // Fetch fresh data in background regardless
  Promise.all([
    fetch('data/config.json').then(function (response) { if (!response.ok) throw new Error(response.status); return response.json(); }),
    fetch('data/links.json').then(function (response) { if (!response.ok) throw new Error(response.status); return response.json(); })
  ])
    .then(function (results) {
      var config = results[0];
      var links = results[1];
      var fresh = JSON.stringify({ config: config, links: links });

      // Only re-render if data actually changed
      if (fresh !== localStorage.getItem(CACHE_KEY)) {
        try { localStorage.setItem(CACHE_KEY, fresh); } catch (e) { /* storage full — skip */ }
        render(config, links, isKindle);
      }
    })
    .catch(function () {
      // Only show error if we didn't already render from cache
      if (!cached) {
        var content = document.getElementById('content');
        content.innerHTML = '';
        var msg = document.createElement('div');
        msg.className = 'error';
        msg.textContent = "Couldn't load links. Try refreshing.";
        content.appendChild(msg);
      }
    });

  // ── RENDER PIPELINE ──

  function render(config, links, isKindle) {
    // Update page title and header from config
    document.title = config.title;
    document.querySelector('.header h1').textContent = config.title;
    document.querySelector('.header .subtitle').textContent = config.subtitle;
    document.querySelector('.header .device-badge').textContent =
      isKindle ? config.badges.kindle : config.badges.full;

    var content = document.getElementById('content');
    content.innerHTML = '';

    // Build the section nav — inline links for jumping between sections
    content.appendChild(createNav(config.sections, isKindle));

    var dividerInserted = false;

    config.sections.forEach(function (section) {
      // On Kindle, skip sections not meant for e-ink
      if (isKindle && !section.kindleVisible) return;

      // Relies on config.sections being ordered: kindle-visible first, desktop-only after
      // Insert the mode divider before the first non-kindle section
      if (!section.kindleVisible && !dividerInserted) {
        content.appendChild(createDivider(config.modeDivider));
        dividerInserted = true;
      }

      content.appendChild(
        createSection(section, links[section.key] || [], config.siteLabels || {})
      );
    });
  }

  // Build inline nav with anchor links to each visible section
  function createNav(sections, isKindle) {
    var nav = document.createElement('nav');
    nav.className = 'section-nav';

    sections.forEach(function (section) {
      // Only include sections visible in current mode
      if (isKindle && !section.kindleVisible) return;

      var navLink = document.createElement('a');
      navLink.href = '#section-' + section.key;
      navLink.textContent = section.name;
      nav.appendChild(navLink);
    });

    return nav;
  }

  function createDivider(text) {
    var div = document.createElement('div');
    div.className = 'mode-divider';
    var span = document.createElement('span');
    span.textContent = text;
    div.appendChild(span);
    return div;
  }

  function createSection(section, sectionLinks, siteLabels) {
    var sectionEl = document.createElement('div');
    sectionEl.className = 'section';
    // Anchor target for section nav
    sectionEl.id = 'section-' + section.key;

    // Section header with tagline
    var header = document.createElement('div');
    header.className = 'section-header';

    var icon = document.createElement('span');
    icon.className = 'section-icon';
    icon.textContent = section.icon;
    header.appendChild(icon);

    var h2 = document.createElement('h2');
    // Name followed by em-dash and tagline
    h2.textContent = section.name + ' \u2014 ';
    var tagline = document.createElement('span');
    tagline.className = 'section-tagline';
    tagline.textContent = section.tagline;
    h2.appendChild(tagline);
    header.appendChild(h2);

    sectionEl.appendChild(header);

    // Assumes all cards in a section either have site fields or none do
    // Check if cards have site fields — determines grouping behavior
    var hasSites = sectionLinks.length > 0 && sectionLinks[0].site;

    if (hasSites) {
      // Group cards by site, render a label + grid per group
      var currentSite = null;
      var currentGrid = null;

      sectionLinks.forEach(function (link) {
        // New site group — insert label and start a fresh grid
        if (link.site !== currentSite) {
          currentSite = link.site;

          // Site label (e.g. "▦ KindlePlay")
          var label = document.createElement('div');
          label.className = 'site-label';
          label.textContent = siteLabels[link.site] || link.site;
          sectionEl.appendChild(label);

          // Fresh card grid for this site group
          currentGrid = document.createElement('div');
          currentGrid.className = 'card-grid';
          sectionEl.appendChild(currentGrid);
        }

        currentGrid.appendChild(createCard(link));
      });
    } else {
      // No site grouping — single card grid (default behavior)
      var grid = document.createElement('div');
      grid.className = 'card-grid';

      sectionLinks.forEach(function (link) {
        grid.appendChild(createCard(link));
      });

      sectionEl.appendChild(grid);
    }

    return sectionEl;
  }

  function createCard(link) {
    var a = document.createElement('a');
    a.className = 'card';
    a.href = link.url;

    // Apply flags (e.g. placeholder cards get dashed border)
    // indexOf instead of .includes() — Kindle browser lacks full ES6 Array methods
    if (link.flags && link.flags.indexOf('placeholder') !== -1) {
      a.className += ' placeholder';
    }

    // Card top row: icon (if present) + name
    var top = document.createElement('div');
    top.className = 'card-top';

    // Skip icon span when icon is empty (site-grouped cards use site labels instead)
    if (link.icon) {
      var iconEl = document.createElement('span');
      iconEl.className = 'card-icon';
      iconEl.textContent = link.icon;
      top.appendChild(iconEl);
    }

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
