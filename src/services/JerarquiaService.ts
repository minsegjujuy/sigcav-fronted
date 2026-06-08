import { getAuthHeader } from "../utilities/getAuthHeader";
import type { Jerarquia } from "../models/Jerarquia";
import api from "../interceptors/axios.interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getJerarquias = async (): Promise<Jerarquia[]> => {
  const response = await api.get<Jerarquia[]>(`${baseURL}/jerarquia/`, getAuthHeader());
  return response.data;
};