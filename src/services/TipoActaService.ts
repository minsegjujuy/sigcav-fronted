import api from "../interceptors/axios.interceptors";
import type { Tipo } from "../models/Tipo";
import { getAuthHeader } from "../utilities/getAuthHeader";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getAllTipoActas = async (): Promise<Tipo[]> => {
  const response = await api.get<Tipo[]>(`${baseURL}/tipo-actas`, getAuthHeader());
  return response.data;
};