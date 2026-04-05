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
