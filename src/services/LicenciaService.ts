import api from "../interceptors/axios.interceptors";
import type { LicenciaRequest } from "../models/LicenciaRequest";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const obtenerLicenciasPorNumero= async (nro: string): Promise<LicenciaRequest[]> => {
  const response = await api.get<LicenciaRequest[]>(`${baseURL}/licencias/${nro}`);
  return response.data;
};