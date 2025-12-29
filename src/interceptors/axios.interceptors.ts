import axios, { AxiosError } from "axios";
import type { ErrorResponse } from "../models/ErrorResponse";
import { SnackbarUtilities } from "../utilities/SnackbarUtilities";
import { getValidationError } from "./GetValidationErrors";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
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

export default api;