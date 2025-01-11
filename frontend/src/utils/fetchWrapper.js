export const BACKENDPORT = process.env.NODE_ENV === "development" ? "8000" : window.location.port;
export const BACKENDURL = `https://${window.location.hostname}:${BACKENDPORT}`;

class FetchWrapper {
  constructor() {
    this.baseUrl = `https://${window.location.hostname}:${BACKENDPORT}/`;
  }

  async get(url) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "GET",
      credentials: "include",
    });
    return response;
  }

  async post(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response;
  }

  async put(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response;
  }

  async putFormData(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PUT",
      credentials: "include",
      body: data,
    });
    return response;
  }

  async delete(url) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "DELETE",
      credentials: "include",
    });
    return response;
  }
}

export default FetchWrapper;
