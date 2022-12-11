import { getConfiguration } from "./configuration";

export async function search(text, options) {
  const configuration = getConfiguration();
  const q = encodeURIComponent(text);
  const limit = options.limit || 100;

  return fetch(
    `${configuration.baseUrl}/v1/entries?search=${q}&limit=${limit}`,
    {
      headers: {
        "X-Auth-Token": `${configuration.token}`,
      },
    }
  ).then((response) => {
    if (response.status === 200) {
      return response.json().then((body) => body.entries);
    }
    return Promise.reject(`Error searching bookmarks: ${response.statusText}`);
  });
}

export async function testConnection(configuration) {
  return fetch(`${configuration.baseUrl}/v1/entries?limit=1`, {
    headers: {
      "X-Auth-Token": `${configuration.token}`,
    },
  })
    .then((response) =>
      response.status === 200 ? response.json() : Promise.reject(response)
    )
    .then((body) => !!body.entries)
    .catch(() => false);
}

export async function getEntryUrl(configuration, id) {
  const response = await fetch(`${configuration.baseUrl}/v1/entries/${id}`, {
    headers: {
      "X-Auth-Token": `${configuration.token}`,
    },
  });
  if (response.status !== 200) {
    Promise.reject(response);
    throw new Error("Failed to fetch URL");
  }
  const body = await response.json();
  const { status } = body;
  const url = `${configuration.baseUrl}/${status}/entry/${id}`;
  return url;
}
