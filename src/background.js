import { getBrowser, openOptions } from "./browser";
import { getConfiguration, isConfigurationComplete } from "./configuration";

import { search } from "./linkding";

const browser = getBrowser();

// Connection to search injection content script
let portFromCS;

function connected(p) {
  portFromCS = p;

  // When the content script sends the search term, search on linkding and
  // return results
  portFromCS.onMessage.addListener(function (m) {
    if (m.action == "openOptions") {
      // Open the add on options if the user clicks on the options link in the
      // injected box
      openOptions();
    } else if (isConfigurationComplete() == false) {
      portFromCS.postMessage({
        message:
          "Connection to your linkding instance is not configured yet! " +
          "Please configure the extension in the <a class='openOptions'>options</a>.",
      });
    } else {
      let config = getConfiguration();
      // Configuration is complete, execute a search on linkding
      search(m.searchTerm, { limit: config.resultNum })
        .then((entries) => {
          const feedSuggestions = entries.map((feed) => ({
            url: feed.url,
            title: feed.title || feed.url,
            author: feed.feed.title,
            date: feed.published_at,
          }));
          portFromCS.postMessage({
            results: feedSuggestions,
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
