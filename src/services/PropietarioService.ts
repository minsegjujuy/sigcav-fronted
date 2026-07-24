import type { Propietario } from "../models/Propietario";
import { getAuthHeader } from "../utilities/getAuthHeader";
import api from "../interceptors/axios.interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const PropietarioService = {
  async obtenerPorDni(dni: string): Promise<Propietario> {
    const response = await api.get<Propietario>(`${baseURL}/propietario/${dni}`, getAuthHeader());
    return response.data;
  }
};