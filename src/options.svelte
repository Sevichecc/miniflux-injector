<script>
  import { getConfiguration, saveConfiguration } from "./configuration";
  import { testConnection } from "./miniflux";

  let baseUrl;
  let token;
  let resultNum;
  let openNewTab;
  let themeDuckduckgo;
  let themeGoogle;
  let  toMiniflux;
  let isSuccess;
  let isError;

  function init() {
    const config = getConfiguration();
    baseUrl = config.baseUrl;
    token = config.token;
    resultNum = config.resultNum;
    openNewTab = config.openNewTab;
    themeDuckduckgo = config.themeDuckduckgo;
    themeGoogle = config.themeGoogle;
     toMiniflux = config. toMiniflux;
  }

  init();

  async function handleSubmit() {
    const config = {
      baseUrl,
      token,
      resultNum,
      openNewTab,
      themeDuckduckgo,
      themeGoogle,
       toMiniflux
    };

    const testResult = await testConnection(config);

    if (testResult) {
      saveConfiguration(config);
      isError = false;
      isSuccess = true;
    } else {
      isSuccess = false;
      isError = true;
    }
  }
</script>


<h6 class="col-12 mt-0 py-1 mb-2">Configuration</h6>
<div class="divider" />
<form class="form" on:submit|preventDefault={handleSubmit}>
  <div class="form-group">
    <label class="form-label" for="input-base-url">Base URL <span class="text-error">*</span></label> 
    <input
      class="form-input"
      type="text"
      id="input-base-url"
      placeholder="https://yourdomain.com"
      bind:value={baseUrl}
      required
    />
    <div class="form-input-hint">
      Your Miniflux server's URL, <strong>without</strong> / trailing slash
    </div>
  </div>
  <div class="form-group">
    <label class="form-label" for="input-token">API Keys <span class="text-error">*</span></label>
    <input
      class="form-input"
      type="password"
      id="input-token"
      placeholder="keys"
      bind:value={token}
      required
    />
    <div class="form-input-hint">
      Used to authenticate. Found on <samp>Settings/API-Keys.</samp> 
    </div>
  </div>
  <div class="form-group">
    <label class="form-label" for="input-search-num"
      >Max search results
    </label>
    <input
      class="form-input"
      type="number"
      id="input-search-num"
      placeholder="10"
      bind:value={resultNum}
    />
    <div class="form-input-hint">
       High numbers could lead to worse performance
    </div>
  </div>
  <div class="form-group">
    <label class="form-switch">
      <input type="checkbox"  id="open-new-tab" bind:checked={openNewTab}>
      <i class="form-icon float-right"></i> Open Links in a New Tab
    </label>
  </div>
  <div class="form-group">
    <label class="form-switch">
      <input type="checkbox"  id="to-miniflux" bind:checked={toMiniflux}>
      <i class="form-icon"></i> Open in Miniflux
    </label>
  </div>
  <div class="accordion">
    <input type="checkbox" id="accordion-1" name="accordion-checkbox" hidden />
    <label class="accordion-header text-small" for="accordion-1">
      <i class="icon icon-arrow-right mr-1" />
      Theme Settings
    </label>
    <div class="accordion-body">
      <div class="form-group p-relative clearfix">
        <div class="form-label float-left">Google</div>
        <label class="form-radio form-inline float-right">
          <input
            type="radio"
            id="google-light"
            bind:group={themeGoogle}
            value="light"
          />
          <i class="form-icon" />light
        </label>
        <label class="form-radio form-inline float-right">
          <input
            type="radio"
            id="google-dark"
            bind:group={themeGoogle}
            value="dark"
          />
          <i class="form-icon" />dark
        </label>
        <label class="form-radio form-inline float-right">
          <input
            type="radio"
            id="google-auto"
            bind:group={themeGoogle}
            value="auto"
          />
          <i class="form-icon" />auto
        </label>
      </div>
      <div class="form-group p-relative clearfix">
        <div class="form-label float-left">DuckDuckGo</div>
        <label class="form-radio form-inline float-right">
          <input type="radio" bind:group={themeDuckduckgo} value="light" />
          <i class="form-icon" />light
        </label>
        <label class="form-radio form-inline float-right">
          <input type="radio" bind:group={themeDuckduckgo} value="dark" />
          <i class="form-icon" />dark
        </label>
        <label class="form-radio form-inline float-right">
          <input type="radio" bind:group={themeDuckduckgo} value="auto" />
          <i class="form-icon" />auto
        </label>
      </div>
      <div class="divider" />
    </div>
  
  </div>

  <div class="button-row">
    {#if isSuccess}
      <div class="form-group has-success mr-2">
        <span class="form-input-hint"
          ><i class="icon icon-check" /> Connection successful
        </span>
      </div>
    {/if}
    {#if isError}
      <div class="form-group has-error mr-2">
        <span class="form-input-hint">
          <i class="icon icon-cross" /> Connection failed
        </span>
      </div>
    {/if}
    <button
      type="submit"
      class="btn btn-primary ml-2"
      disabled={!(baseUrl && token)}
    >
      Save
    </button>
  </div>
</form>

<style>
  .button-row {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
  }
  .button-row button {
    padding-left: 32px;
    padding-right: 32px;
  }
</style>
