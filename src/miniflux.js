export class MinifluxApi {
  constructor(configuration) {
    this.configuration = configuration;
  }

  async search(text, options) {
    const configuration = this.configuration;
    const q = encodeURIComponent(text);
    const limit = options.limit;

    return fetch(
      limit
        ? `${configuration.baseUrl}/v1/entries?search=${q}&limit=${limit}`
        : `${configuration.baseUrl}/v1/entries?search=${q}`,
      {
        headers: {
          'X-Auth-Token': `${configuration.token}`,
        },
      }
    ).then(async (response) => {
      if (response.status === 200) {
        return response.json().then((data) => data.entries);
      }
      return Promise.reject(
        `Error searching bookmarks: ${response.statusText}`
      );
    });
  }

  async testConnection() {
    const configuration = this.configuration;
    return fetch(`${configuration.baseUrl}/v1/entries?limit=1`, {
      headers: {
        'X-Auth-Token': `${configuration.token}`,
      },
    })
      .then((response) =>
        response.status === 200 ? response.json() : Promise.reject(response)
      )
      .then((data) => !!data.entries)
      .catch(() => false);
  }

  async getMinifluxUrl(id) {
    const configuration = this.configuration;
    // const response = await fetch(`${configuration.baseUrl}/v1/entries/${id}`, {
    //   headers: {
    //     'X-Auth-Token': `${configuration.token}`,
    //   },
    // });

    // if (response.status !== 200) {
    //   Promise.reject(response);
    //   throw new Error('Failed to fetch URL');
    // }
    // const { status } = await response.json();
    // const url = `${configuration.baseUrl}/${
    //   status === 'read' ? 'history' : status
    // }/entry/${id}`;
    // return url;
    return fetch(`${configuration.baseUrl}/v1/entries/${id}`, {
      headers: {
        'X-Auth-Token': `${configuration.token}`,
      },
    })
      .then((response) =>
        response === 200 ? response.json() : Promise.reject(response)
      )
      .then(({ status }) => {
        return (url = `${configuration.baseUrl}/${
          status === 'read' ? 'history' : status
        }/entry/${id}`);
      })
      .catch((err) => console.err(err));
  }
}
