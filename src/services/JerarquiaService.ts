import axios from "axios";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { Jerarquia } from "../models/Jerarquia";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getJerarquias = async (): Promise<Jerarquia[]> => {
  const response = await axios.get<Jerarquia[]>(`${baseURL}/jerarquia/`, getAuthHeader());
  return response.data;
};