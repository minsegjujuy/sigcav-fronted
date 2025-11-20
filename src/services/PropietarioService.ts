import axios from "axios";
import type { Propietario } from "../models/Propietario";
import { getAuthHeader } from "../utilities/getAuthHeader";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const PropietarioService = {
  async obtenerPorDni(dni: string): Promise<Propietario> {
    const response = await axios.get<Propietario>(`${baseURL}/propietario/${dni}`, getAuthHeader());
    return response.data;
  }
};