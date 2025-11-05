import axios from "axios";
import type { Infractor } from "../models/Infractor";
import { getAuthHeader } from "../utilities/getAuthHeader";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/infractor`;

export const findByDni = async (dni: string): Promise<Infractor> => {
  const response = await axios.get<Infractor>(`${baseURL}/${dni}`, getAuthHeader());
  return response.data;
}