![logo](/icons/logo_full.svg)

Community browser extension for the self-hosted [miniflux](https://miniflux.app/) bookmark service.

Fork from [linkding-injector](https://github.com/Fivefold/linkding-injector)

**Features**

- When searching on a search engine the search term is also sent to your Miniflux instance and results are added in a new box in the sidebar right to the search engine results.
- Supports [google](https://www.google.com/) and [duckduckgo](https://duckduckgo.com/) search engines
- Automatic light or dark theme detection
- Open search result in Miniflux
  Works with: Firefox, Chrome

## Usage

### 1. Create a Miniflux API Key

After installation the extension needs to be configured and connected to your Miniflux instance, create your API key in `http://your-miniflux-domain/keys`, then copy that API keys
![API-Key](/docs/API.png 'Miniflux-API-Keys')

### 2. Setting the extension setting

Either open the extension options in the browser extension manager or follow the link in the new Miniflux injector box on the search page of google or duckduckgo.

Then paste the API keys you copy before, and fill in the Base URL with your Miniflux server's URL

![config](/docs/config.png 'Config')
Once the extension is properly configured, miniflux search results will show in the right sidebar. If there are no search results nothing will appear.

**Screenshots**

![duckduckgo](/docs/duckduckgo.png 'Duckduckgo')
![google](/docs/google.png 'google')

## Manual installation

### Firefox

Run the build as described below and then follow the instructions [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing) to load it into Firefox.

### Chrome

Run the build as described below and then follow the instructions [here](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest) to load it into Chrome.

## Build

**Requirements**

- Latest LTS Node version (v14)
- Latest LTS NPM version (v6)
- bash (on Linux) or powershell (on Windows)
- npx (included with npm v5.2+)

Internally, we use `web-ext` to bundle a distribution package for the extension for Firefox. You do not need to install `web-ext`. Note that `web-ext` will generate a zip file which can also be used for the Chrome Web Store.

Then run the following script to generate a build (might need to make the file executable on Linux using `chmod +x build.sh`):

```bash
./build.sh # Linux
```

```powershell
./build.ps1 # Windows
```

The script does:

- Install all dependencies using NPM
- Runs rollup to transpile and minify source files, with output written to the `build` directory
- Run web-ext to package the extension for uploading to the Mozilla addon store

After the build the root directory contains the complete, unpackaged extension. Use the `manifest.json` file to load it manually into the browser.

The packaged extension can be found in the `web-ext-artifacts` folder.

## Acknowledgements

This extension reuses and adapts code from the [official miniflux extension](https://github.com/sissbruecker/miniflux-extension)
