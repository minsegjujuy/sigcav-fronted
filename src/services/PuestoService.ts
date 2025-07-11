import axios from "axios";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { Puesto } from "../models/Puesto";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getPuestos = async (): Promise<Puesto[]> => {
  const response = await axios.get<Puesto[]>(`${baseURL}/puesto`, getAuthHeader());
  return response.data;
};