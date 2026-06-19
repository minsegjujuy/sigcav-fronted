import type { Articulo } from "../models/Articulo";
import { getAuthHeader } from "../utilities/getAuthHeader";
import api from "../interceptors/axios.interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getArticulosByLey = async (leyId: number): Promise<Articulo[]> => {
  const response = await api.get<Articulo[]>(`${baseURL}/articulo/ley/${leyId}`, getAuthHeader());
  return response.data;
};

export const getArticulos = async (): Promise<Articulo[]> => {
  const response = await api.get<Articulo[]>(`${baseURL}/articulo/`, getAuthHeader());
  return response.data;
};