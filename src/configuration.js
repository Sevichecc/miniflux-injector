import { getStorage } from "./browser";

const CONFIG_KEY = "mf_ext_config";

export const getConfiguration = async () => {
  return new Promise((resolve) => {
    getStorage().get(CONFIG_KEY, (data) => {
      const config = JSON.parse(data[CONFIG_KEY] || '{}');
      resolve(config);
    });
  });
};

export const saveConfiguration = async (config) => {
  const configJson = JSON.stringify(config);
  await getStorage().set({ [CONFIG_KEY]: configJson });
};

export const isConfigurationComplete = async () => {
  const { baseUrl, token } = await getConfiguration();
  return !!baseUrl && !!token;
};
