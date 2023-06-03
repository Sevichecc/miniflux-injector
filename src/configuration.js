import { getStorage } from "./browser";

const CONFIG_KEY = "mf_ext_config";

export async function getConfiguration() {
  return new Promise((resolve) => {
    getStorage().get(CONFIG_KEY, (data) => {
      const config = JSON.parse(data[CONFIG_KEY] || "{}");
      console.log(config);
      resolve(config);
    });
  });
}

export async function saveConfiguration(config) {
  const configJson = JSON.stringify(config);
  await getStorage().set({ [CONFIG_KEY]: configJson });
}

export async function isConfigurationComplete() {
  const { baseUrl, token } = await getConfiguration();
  return !!baseUrl && !!token;
}
