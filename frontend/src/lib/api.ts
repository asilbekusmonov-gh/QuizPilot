export async function apiFetch(url: string | URL | Request, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // If body is FormData, don't set Content-Type explicitly as browser needs to set it with boundary
  if (!(options.body instanceof FormData)) {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
  } else {
    // Ensure we don't accidentally set application/json for FormData
    headers.delete("Content-Type");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
