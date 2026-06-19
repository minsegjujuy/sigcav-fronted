import type { RegistroActaSaliente } from "../pages/RegistrosActaSaliente";
import { getAuthHeader } from "../utilities/getAuthHeader";
import api from "../interceptors/axios.interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const obtenerRegistrosActaSaliente = async (id:number): Promise<RegistroActaSaliente[]> => {
  const response = await api.get<RegistroActaSaliente[]>(`${baseURL}/registros-actas/acta/${id}`, getAuthHeader());
  return response.data;
}