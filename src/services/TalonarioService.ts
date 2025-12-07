import axios from "axios";
import type { Talonario } from "../models/Talonario";
import type { PageResponse } from "../models/PageResponse";
import type { TalonarioRequest } from "../models/TalonarioRequest";
import { getAuthHeader } from "../utilities/getAuthHeader";
import api from "../interceptors/axios.interceptors";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/talonarios`;

export const TalonarioService = {
  crearTalonario: async (data: TalonarioRequest): Promise<string> => {
    const response = await api.post<string>(`${API_URL}/nuevo`, data, getAuthHeader());
    return response.data; // "Talonario creado exitosamente."
  },

  obtenerTalonarios: async (params: {
    page?: number;
    size?: number;
    sort?: string[];
    idPuesto?: number;
  }): Promise<PageResponse<Talonario>> => {
    const response = await axios.get<PageResponse<Talonario>>(`${API_URL}/`, getAuthHeader());

    return response.data;
  },
};