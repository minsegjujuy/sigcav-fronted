import axios from "axios";
import type { RegistroTalonario } from "../models/RegistroTalonario";
import { getAuthHeader } from "../utilities/getAuthHeader";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getRegistrostalonarios= async (idTal: number): Promise<RegistroTalonario[]> => {
  const response = await axios.get<RegistroTalonario[]>(`${baseURL}/registro-talonario/?talonario=${idTal}`,
     getAuthHeader());
  return response.data;
};