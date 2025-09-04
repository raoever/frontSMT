import axios, { AxiosInstance } from "axios";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useRef } from "react";

export function useApi(): AxiosInstance {
  const { token, logout } = useAuth();

  // cria a instância UMA vez (não depende do token)
  const api = useMemo(() => {
    return axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });
  }, []);

  // ids dos interceptors para ejetar no cleanup
  const reqId = useRef<number | null>(null);
  const resId = useRef<number | null>(null);

  useEffect(() => {
    // request: injeta JWT atual
    reqId.current = api.interceptors.request.use((config) => {
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      } else if (config.headers && "Authorization" in config.headers) {
        delete (config.headers as any).Authorization;
      }
      return config;
    });

    // response: trata 401
    resId.current = api.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error?.response?.status === 401) {
          logout();
          window.location.href = "/";
        }
        return Promise.reject(error);
      }
    );

    // remove interceptors ao desmontar ou ao trocar o token
    return () => {
      if (reqId.current !== null) api.interceptors.request.eject(reqId.current);
      if (resId.current !== null)
        api.interceptors.response.eject(resId.current);
    };
  }, [api, token, logout]);

  return api;
}
