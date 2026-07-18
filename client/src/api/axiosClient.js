import axios from "axios";
import { clientEnv } from "../config/env.js";
import {
  clearAuthSession,
  getStoredAccessToken,
} from "../utils/authStorage.js";

export const AUTH_UNAUTHORIZED_EVENT = "it-helpdesk:auth-unauthorized";

const axiosClient = axios.create({
  baseURL: clientEnv.apiUrl,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config;
  }

  const accessToken = getStoredAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPrivateRequest = !error.config?.skipAuth;

    if (error.response?.status === 401 && isPrivateRequest) {
      clearAuthSession();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
