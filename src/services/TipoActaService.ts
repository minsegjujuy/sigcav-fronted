import axios from "axios";
import type { Tipo } from "../models/Tipo";
import { getAuthHeader } from "../utilities/getAuthHeader";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getAllTipoActas = async (): Promise<Tipo[]> => {
  const response = await axios.get<Tipo[]>(`${baseURL}/tipo-actas`, getAuthHeader());
  return response.data;
};