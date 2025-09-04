import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
if (!baseURL) {
  console.error("VITE_API_BASE_URL não definido. Configure seu frontend/.env.");
}

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  if (authToken) {
    (config.headers as any).Authorization = `Bearer ${authToken}`;
  } else if ("Authorization" in (config.headers as any)) {
    delete (config.headers as any).Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
