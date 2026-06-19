import { getAuthHeader } from "../utilities/getAuthHeader";
import type { UserFilter } from "../models/UserFilter";
import api from "../interceptors/axios.interceptors";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/usuario`;

export const findUsersByNombreOrDni = async (term: string): Promise<UserFilter[]> => {
  const response = await api.get<UserFilter[]>(`${baseURL}/${term}`, getAuthHeader());
  return response.data;
};