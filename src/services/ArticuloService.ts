import axios from "axios";
import type { Articulo } from "../models/Articulo";
import { getAuthHeader } from "../utilities/getAuthHeader";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getArticulosByLey = async (leyId: number): Promise<Articulo[]> => {
  const response = await axios.get<Articulo[]>(`${baseURL}/articulo/ley/${leyId}`, getAuthHeader());
  return response.data;
};