import { getBrowser, openOptions } from "./browser";
import { getConfiguration, isConfigurationComplete } from "./configuration";

import { MinifluxApi } from "./miniflux";

const browser = getBrowser();
let api = null;
let configuration = null;
let hasCompleteConfiguration = false;

// Omnibox
browser.omnibox.onInputStarted.addListener(async () => {
  configuration = await getConfiguration();
  hasCompleteConfiguration = await isConfigurationComplete();
  const description = hasCompleteConfiguration
    ? "Search bookmarks in Miniflux"
    : "⚠️ Please configure the Miniflux-injector extension first";

  browser.omnibox.setDefaultSuggestion({ description });

  api = hasCompleteConfiguration ? new MinifluxApi(configuration) : null;
  
});

browser.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (!api) return;
  
  let config = await getConfiguration();

  api
    .search(text, { limit: config.resultNum })
    .then(async (entries) => {
      const entrySuggestions = await Promise.all(
        entries.map(async (entry) => ({
          content: config.toMiniflux
            ? await api.getMinifluxUrl(entry.id)
            : entry.url,
          description: entry.title,
        }))
      );
      await suggest(entrySuggestions);
    })
    .catch((error) => {
      console.error(error);
    });
});

browser.omnibox.onInputEntered.addListener((content, disposition) => {
  if (!hasCompleteConfiguration || !content) {
    return;
  }

  const isUrl = /^http(s)?:\/\//.test(content);
  const url = isUrl
    ? content
    : `${configuration.baseUrl}/search?q=${encodeURIComponent(content)}`;

  switch (disposition) {
    case "currentTab":
      browser.tabs.update({ url });
      break;
    case "newForegroundTab":
      browser.tabs.create({ url });
      break;
    case "newBackgroundTab":
      browser.tabs.create({ url, active: false });
      break;
  }
});

// Connection to search injection content script
let portFromCS;

function connected(p) {
  portFromCS = p;

  // When the content script sends the search term, search on miniflux and
  // return results
  portFromCS.onMessage.addListener(async function (m) {
    if (m.action == "openOptions") {
      // Open the add on options if the user clicks on the options link in the
      // injected box
      openOptions();
    } else if (!(await isConfigurationComplete())) {
      portFromCS.postMessage({
        message:
          "Connection to your Miniflux instance is not configured yet! " +
          "Please configure the extension in the <a class='openOptions'>options</a>.",
      });
    } else {
      let config = await getConfiguration();
      api = new MinifluxApi(config);
      // Configuration is complete, execute a search on miniflux
      api
        .search(m.searchTerm, { limit: config.resultNum })
        .then(async (entries) => {
          const entrySuggestions = await Promise.all(
            entries.map(async (entry) => ({
              url: config.toMiniflux
                ? await api.getMinifluxUrl(entry.id)
                : entry.url,
              title: entry.title || entry.url,
              author: entry.feed.title,
              id: entry.id,
            }))
          );
          await portFromCS.postMessage({
            results: entrySuggestions,
            config: config,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
}
browser.runtime.onConnect.addListener(connected);
