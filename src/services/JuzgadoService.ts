import axios from "axios";
import type { Juzgado } from "../models/Juzgado";
import { getAuthHeader } from "../utilities/getAuthHeader";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const obtenerJuzgados = async (): Promise<Juzgado[]> => {
  const response = await axios.get<Juzgado[]>(`${baseURL}/juzgados`, getAuthHeader());
  return response.data;
}