import axios from "axios";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { Ley } from "../models/Ley";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getLeyes = async (): Promise<Ley[]> => {
  const response = await axios.get<Ley[]>(`${baseURL}/ley`, getAuthHeader());
  return response.data;
};