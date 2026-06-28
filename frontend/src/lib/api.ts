const API_URL = "http://localhost:8000/api/v1";
const STORAGE_KEY = "kf_session_v1";

export interface SessionData {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: string;
    avatarColor: string;
    collectionAccess: string[];
  };
  loggedInAt: string;
}

export function getAuthToken(): string | null {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || null;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // For multipart/form-data (FormData), the browser automatically sets the correct header and boundary.
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    let errorDetail = "API request failed";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  
  return response.text() as unknown as Promise<T>;
}
