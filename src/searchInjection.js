function isChrome() {
  return typeof chrome !== 'undefined';
}

function getBrowser() {
  return isChrome() ? chrome : browser;
}

/* Sanitise input to prevent unwanted injection of html or even javascript 
  through miniflux search results, e.g. in the bookmark title or description 
*/
function escapeHTML(str) {
  let p = document.createElement('p');
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
}

const browser = getBrowser();

let port = browser.runtime.connect({ name: 'port-from-cs' });
let searchEngine;
if (document.location.hostname.match(/duckduckgo/)) {
  searchEngine = 'duckduckgo';
} else if (document.location.hostname.match(/google/)) {
  searchEngine = 'google';
} else if (document.location.hostname.match(/search.brave.com/)) {
  searchEngine = 'brave';
}

// When background script answers with results, construct html for the result box
port.onMessage.addListener(function (m) {
  const parser = new DOMParser();
  let theme, themeClass;
  let htmlString = '';
  let html;

  // In case we don't get results, but a message from the background script,
  // display it. This is the case before proper configuration
  if ('message' in m) {
    htmlString = `
    <div id="bookmark-list-container" class="${searchEngine}">
      <div id="navbar">
        <span id="mf-logo">  
           <img src=${browser.runtime.getURL('icons/logo_full.svg')}
           alt="miniflux injector"/>
        </span>
        <a id="mf-options" class="openOptions">
          <img class="ld-settings" src=${browser.runtime.getURL(
            'icons/cog.svg'
          )} />
        </a>
      </div>
      <div id="error-message">
        ${m.message}
      </div>
    </div>
    `;

    // Convert the above string into a DOM document
    html = parser.parseFromString(htmlString, 'text/html');
  }
  // If there is no message and there are actual results display them
  else if (m.results.length > 0) {
    // If the theme for a search engine is not set to auto, we need to add
    // specific CSS classes
    // Get the theme configuration
    switch (searchEngine) {
      case 'duckduckgo':
        theme = m.config.themeDuckduckgo;
        break;
      case 'google':
        theme = m.config.themeGoogle;
        break;
      case 'brave':
        theme = m.config.themeBrave;
        break;
    }
    if (theme == 'auto') {
      themeClass = ''; // automatic theme detection
    } else {
      themeClass = theme; // "dark" for dark theme, "light" for light theme
    }

    // URL of the configured miniflux instance (including search term)
    let minifluxUrl =
      m.config.baseUrl +
      (searchTerm.length > 0 ? `/search?q=${searchTerm}` : '/');

    htmlString += `
    <div id="bookmark-list-container" class="${searchEngine} ${themeClass}">
      <div id="navbar">
        <span id="mf-logo">  
          <img src=${browser.runtime.getURL(
            searchEngine === 'google'
              ? 'icons/logo_full_google.svg'
              : 'icons/logo_full.svg'
          )} alt="miniflux injector"/>
        </span>
        <div id="mf-results_amount">
          Found <span>${m.results.length}</span> ${
      m.results.length == 1 ? 'result' : 'results'
    }.
        </div>
        <a id="mf-options" class="openOptions">
          <img class="ld-settings" src=${browser.runtime.getURL(
            'icons/cog.svg'
          )} />
        </a>
      </div>
    `;

    htmlString += `<ul id="bookmark-list">`;

    m.results.forEach((entry) => {
      htmlString += `
        <li>
          <div class="title">
            <a
              href="${entry.url}"
              target=${m.config.openNewTab ? '_blank' : '_self'}
              rel="noopener"
              id="mf-title"
              >${escapeHTML(entry.title)}</a
            >
          </div>
          <div class="description ${themeClass}">
             ${escapeHTML(entry.author)}
          </div>
        </li>`;
    });
    htmlString += `
        </ul>
        <div id="more-links"> 
          <a href="${minifluxUrl}">More</a>
        </div>
      </div>
        `;
  } else {
    console.error('miniflux injector: no message and no search results');
    return;
  }

  let sidebar; // DOM document for the sidebar

  // querySelectors for finding the sidebar in the search engine websites
  if (searchEngine == 'duckduckgo') {
    sidebar = document.querySelector('.sidebar-modules');
  } else if (searchEngine == 'google') {
    sidebar = document.querySelector('#rhs');
    if (sidebar == null) {
      // google completely omits the sidebar container if there is no content.
      // we need to add it manually before injection
      let sidebarContainerString = `
        <div id="rhs" class="TQc1id hSOk2e rhstc4"></div>`;

      // construct DOM document from string
      let sidebarContainer = parser.parseFromString(
        sidebarContainerString,
        'text/html'
      );
      let container = document.querySelector('#rcnt'); // get main search result container
      container.appendChild(sidebarContainer.body.querySelector('div'));
      sidebar = document.querySelector('#rhs'); // get the added sidebar container
    }
  } else if (searchEngine == 'brave') {
    sidebar = document.querySelector('#side-right');
  }

  // Convert the html string into a DOM document
  html = parser.parseFromString(htmlString, 'text/html');
  // The actual injection
  sidebar.prepend(html.body.querySelector('div'));

  // Event listeners for opening the extension options. These can only be opened
  // by the background script, so we need to send a message to it
  document.querySelectorAll('.openOptions').forEach((el) => {
    el.addEventListener('click', () => {
      port.postMessage({ action: 'openOptions' });
    });
  });
});

// Start the search by sending a message to background.js with the search term
let queryString = location.search;
let urlParams = new URLSearchParams(queryString);
let searchTerm = urlParams.get('q');

port.postMessage({ searchTerm: searchTerm });
