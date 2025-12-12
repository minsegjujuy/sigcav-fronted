import axios from "axios";
import type { RegistroTalonario } from "../models/RegistroTalonario";
import { getAuthHeader } from "../utilities/getAuthHeader";
import buildUrl from "../utilities/BuildUrl";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getRegistrostalonarios= async (params : Record<string, any>): Promise<RegistroTalonario[]> => {
  const newUrl = buildUrl(`${baseURL}/registro-talonario/`, params)
  const response = await axios.get<RegistroTalonario[]>(newUrl,
     getAuthHeader());
  return response.data;
};