import { getAuthHeader } from "../utilities/getAuthHeader";
import type { Puesto } from "../models/Puesto";
import api from "../interceptors/axios.interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getPuestos = async (): Promise<Puesto[]> => {
  const response = await api.get<Puesto[]>(`${baseURL}/puesto`, getAuthHeader());
  return response.data;
};