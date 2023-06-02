export class MinifluxApi {
  constructor(configuration) {
    this.configuration = configuration
  }

  async search(text, options) {
    const { baseUrl } = this.configuration
    const q = encodeURIComponent(text)
    const limit = options.limit

    const url = `${baseUrl}/v1/entries?search=${q}${
      limit ? `&limit=${limit}` : ''
    }`

    const response = await this.fetchWithHeaders(url)

    if (response.status === 200) {
      const data = await response.json()
      return data.entries
    }

    throw new Error(`Error searching bookmarks: ${response.statusText}`)
  }

  async testConnection() {
    const { baseUrl } = this.configuration
    const url = `${baseUrl}/v1/entries?limit=1`

    const response = await this.fetchWithHeaders(url)

    if (response.status === 200) {
      const data = await response.json()
      return !!data.entries
    }

    return false
  }

  async getMinifluxUrl(id) {
    const { baseUrl } = this.configuration
    const url = `${baseUrl}/v1/entries/${id}`

    const response = await this.fetchWithHeaders(url)

    if (response.status !== 200) {
      throw new Error('Failed to fetch URL')
    }

    const { status } = await response.json()
    return `${baseUrl}/${status === 'read' ? 'history' : status}/entry/${id}`
  }

  async fetchWithHeaders(url ) {
    const { token } = this.configuration
     const headers = {
       'X-Auth-Token': token,
     }
    return fetch(url, { headers })
  }
}
