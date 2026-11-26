
import axios from "axios";

export const api = axios.create({
  baseURL: "https://bibliotecaactiva-api.aaron-navarro.workers.dev/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && !config.url?.startsWith("/auth/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const url = error.config?.url ?? "";
    const esAuth = url.startsWith("/auth/");

    if (error.response?.status === 401 && !esAuth) {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);
