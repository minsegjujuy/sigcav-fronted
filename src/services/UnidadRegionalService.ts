import type { UnidadRegional } from "../models/UnidadRegional";
import { getAuthHeader } from "../utilities/getAuthHeader";
import api from "../interceptors/axios.interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const obtenerUnidadesRegionalesPorDepartamento = async (departamento: string): Promise<UnidadRegional[]> => {
  const newUrl = `${baseURL}/unidad-regional/por-departamento/${departamento}`;
  const response = await api.get<UnidadRegional[]>(newUrl, getAuthHeader());
  return response.data;
};