import { getAuthHeader } from "../utilities/getAuthHeader";
import type { Ley } from "../models/Ley";
import api from "../interceptors/axios.interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getLeyes = async (): Promise<Ley[]> => {
  const response = await api.get<Ley[]>(`${baseURL}/ley`, getAuthHeader());
  return response.data;
};