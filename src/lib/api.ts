const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const TOKEN_STORAGE_KEY = "school_auth_token";

export async function api<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || "API request failed");
  }

  return response.json();
}
