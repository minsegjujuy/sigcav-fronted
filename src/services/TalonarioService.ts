import axios from "axios";
import type { Talonario } from "../models/Talonario";
import type { PageResponse } from "../models/PageResponse";
import type { TalonarioRequest } from "../models/TalonarioRequest";
import { getAuthHeader } from "../utilities/getAuthHeader";
import api from "../interceptors/axios.interceptors";
import buildUrl from "../utilities/BuildUrl";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const TalonarioService = {
  crearTalonario: async (data: TalonarioRequest): Promise<Talonario> => {
    const response = await api.post<Talonario>(`${API_URL}/talonarios/nuevo`, data, getAuthHeader());
    return response.data;
  },

  obtenerTalonarios: async (params: Record<string, any>): Promise<PageResponse<Talonario>> => {
    const newUrl = buildUrl(`${API_URL}/talonarios/`, params)
    const response = await axios.get<PageResponse<Talonario>>(newUrl, getAuthHeader());

    return response.data;
  },

  eliminarTalonario: async (idTal: Number) => {
    const response = await api.delete(`${API_URL}/talonarios/${idTal}`, getAuthHeader());
    return response.data;
  }
};