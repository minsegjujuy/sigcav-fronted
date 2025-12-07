import axios from "axios";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { UserFilter } from "../models/UserFilter";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/usuario`;

export const findUsersByNombreOrDni = async (term: string): Promise<UserFilter[]> => {
  const response = await axios.get<UserFilter[]>(`${baseURL}/${term}`, getAuthHeader());
  return response.data;
};