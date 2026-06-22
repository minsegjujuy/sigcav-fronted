import { getAuthHeader } from "../utilities/getAuthHeader";
import type { ActaRequest } from "../models/ActaRequest";
import type { ActaResumenDto } from "../models/ActaResumenDto";
import api from "../interceptors/axios.interceptors";
import type { PageResponse } from "../models/PageResponse";
import buildUrl from "../utilities/BuildUrl";
import type { DiasCantidad } from "../models/DiasCantidad";
import type { DashboardActas } from "../models/ActasDashboard";
const baseURL = import.meta.env.VITE_API_BASE_URL;

export const crearActa = async (acta: ActaRequest): Promise<ActaRequest> => {
  const response = await api.post<ActaRequest>(
    `${baseURL}/acta/nueva`,
    acta,
    getAuthHeader()
  );
  return response.data;
};

export const actualizarActa = async (acta: ActaRequest): Promise<ActaRequest> => {
  const response = await api.put<ActaRequest>(
    `${baseURL}/acta/`,
    acta,
    getAuthHeader()
  );
  return response.data;
};

export const getResumenActas = async (params:Record<string, any>): Promise<PageResponse<ActaResumenDto>> => {
  const newUrl = buildUrl(`${baseURL}/acta/private`, params);
  const response = await api.get<PageResponse<ActaResumenDto>>(newUrl, getAuthHeader());
  return response.data;
};

export const getResumenActasPdf = async (params: Record<string, any>) => {
  // Aseguramos que la URL se construya con tus parámetros (filtros y sort)
  const newUrl = buildUrl(`${baseURL}/acta/private/exportacion-pdf`, params);

  const response = await api({
    url: newUrl,
    method: 'GET',
    ...getAuthHeader(), // Expandimos los headers de autenticación
    responseType: 'blob', // 👈 INDISPENSABLE para archivos PDF
  });

  return response.data; // Esto devolverá un objeto Blob
};

export const getResumenActasPersonal = async (params:Record<string, any>): Promise<PageResponse<ActaResumenDto>> => {
  const newUrl = buildUrl(`${baseURL}/acta/private/user`, params);
  const response = await api.get<PageResponse<ActaResumenDto>>(newUrl, getAuthHeader());
  return response.data;
};

export const obtenerActasDashboard = async (fi: string, ff: string): Promise<DashboardActas> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/dashboard`, params);
  const response = await api.get<DashboardActas>(newUrl, getAuthHeader());
  return response.data;
}

export const descargarPdfActa = async (nro: string): Promise<Blob> => {
  const response = await api.get(`${baseURL}/acta/${nro}/pdf`, {
    responseType: "blob",
    ...getAuthHeader()
  });

  return response.data;
};








