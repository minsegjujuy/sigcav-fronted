import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { SnackbarUtilities } from "../utilities/SnackbarUtilities";
import { getValidationError } from "./GetValidationErrors";
import { refresh } from "../services/AuthService";
import { clearAccessToken, getAccessToken, setAccessToken } from "../utilities/tokenStore";

/*export const api = axios.create({
  headers: { "Content-Type": "application/json" },
});

// register interceptors on this instance
api.interceptors.request.use((config) => {
  console.log("[api.request] ", config.method, config.url);
  config.headers = config.headers ?? {};
  // const token = getToken("token"); // si hace falta
  // if (token) (config.headers as any).Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ErrorResponse>) => {
    console.log("[api.response] error", error?.response?.status, error?.config?.url);
    if (error.response) {
      const status = error.response.status;
      if (status === 400 || status === 409) {
        SnackbarUtilities.error((error.response.data as any)?.message ?? "interceptado");
      } else {
        SnackbarUtilities.error(getValidationError(status));
      }
    } else {
      SnackbarUtilities.error("Error de conexión con el servidor");
    }
    return Promise.reject(error);
  }
);

export default api;*/

export const api = axios.create({
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await refresh();
        const newAccessToken = response.jwt;

        setAccessToken(newAccessToken);

        originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      const status = error.response.status;

      if (status === 400 || status === 409) {
        SnackbarUtilities.error(error.response.data?.message ?? "interceptado");
      } else {
        SnackbarUtilities.error(getValidationError(status));
      }
    } else {
      SnackbarUtilities.error("Error de conexión con el servidor");
    }

    return Promise.reject(error);
  }
);

export default api;
