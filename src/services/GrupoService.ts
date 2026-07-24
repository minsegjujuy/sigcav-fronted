import api from "../interceptors/axios.interceptors";
import type { Grupo } from "../models/Grupo";
import { getAuthHeader } from "../utilities/getAuthHeader";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getGrupos = async (): Promise<Grupo[]> => {
  const response = await api.get<Grupo[]>(`${baseURL}/grupo`, getAuthHeader());
  return response.data;
};