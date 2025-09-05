import { api } from "../lib/apiClient";

export async function pingHealth() {
  const { data } = await api.get("/health", {
    headers: { "Cache-Control": "no-cache" },
  });
  return data;
}
