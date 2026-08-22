import { API_BASE } from "../config";

export async function callApi(
  userId: string,
  message: string,
  fetchImpl: typeof fetch = fetch,
): Promise<unknown | null> {
  const url = new URL(`${API_BASE}/callapi`);
  url.searchParams.append("userId", userId);
  url.searchParams.append("message", message);

  try {
    const response = await fetchImpl(url);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}
