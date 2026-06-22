import type { Juzgado } from "../models/Juzgado";
import { getAuthHeader } from "../utilities/getAuthHeader";
import api from "../interceptors/axios.interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const obtenerJuzgados = async (): Promise<Juzgado[]> => {
  const response = await api.get<Juzgado[]>(`${baseURL}/juzgados`, getAuthHeader());
  return response.data;
}

export const obtenerJuzgadosParaActa = async (): Promise<Juzgado[]> => {
  const response = await api.get<Juzgado[]>(`${baseURL}/juzgados/actas`, getAuthHeader());
  return response.data;
}