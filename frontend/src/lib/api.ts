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

  let finalUrl = url;
  if (typeof url === 'string') {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      finalUrl = url.replace(/http:\/\/(127\.0\.0\.1|localhost):8000/, apiUrl);
    }
  } else if (url instanceof URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      finalUrl = new URL(url.toString().replace(/http:\/\/(127\.0\.0\.1|localhost):8000/, apiUrl));
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  
  try {
    const res = await fetch(finalUrl, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
