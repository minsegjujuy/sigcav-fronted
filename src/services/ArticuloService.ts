import type { Articulo, ArticuloList, ArticuloRequest } from "../models/Articulo";
import { getAuthHeader } from "../utilities/getAuthHeader";
import api from "../interceptors/axios.interceptors";
import type { PageResponse } from "../models/PageResponse";

const baseURL = import.meta.env.VITE_API_BASE_URL;

interface ListarArticulosParams {
  page: number;
  size: number;
  sort?: string[];
  nro?: string;
}

export const getArticulosByLey = async (leyId: number): Promise<Articulo[]> => {
  const response = await api.get<Articulo[]>(`${baseURL}/articulo/ley/${leyId}`, getAuthHeader());
  return response.data;
};

export const listarArticulos = async ({
  page,
  size,
  sort,
  nro,
}: ListarArticulosParams): Promise<PageResponse<ArticuloList>> => {
  const { data } = await api.get<PageResponse<ArticuloList>>(`${baseURL}/articulo/private/`, {
    params: {
      page,
      size,
      sort,
      nro: nro || undefined,
    },
    paramsSerializer: {
      indexes: null,
    },
  });

  return data;
};

export const modificarArticulos = async (
  articulos: ArticuloRequest[]
): Promise<ArticuloRequest[]> => {
  const { data } = await api.put<ArticuloRequest[]>(
    `${baseURL}/articulo/private/`,
    articulos
  );

  return data;
};

export const getArticulos = async (): Promise<Articulo[]> => {
  const response = await api.get<Articulo[]>(`${baseURL}/articulo/`, getAuthHeader());
  return response.data;
};