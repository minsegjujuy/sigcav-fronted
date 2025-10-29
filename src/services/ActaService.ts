import axios from "axios";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { ActaRequest } from "../models/ActaRequest";
import type { ActaResumenDto } from "../models/ActaResumenDto";
import api from "../interceptors/axios.interceptors";
import type { PageResponse } from "../models/PageResponse";
import buildUrl from "../utilities/BuildUrl";
import type { DiasCantidad } from "../models/DiasCantidad";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const crearActa = async (acta: ActaRequest): Promise<ActaRequest> => {
  const response = await api.post<ActaRequest>(
    `${baseURL}/acta/nueva`,
    acta,
    getAuthHeader()
  );
  return response.data;
};

export const getResumenActas = async (params:Record<string, any>): Promise<PageResponse<ActaResumenDto>> => {
  const newUrl = buildUrl(`${baseURL}/acta/private`, params);
  const response = await axios.get<PageResponse<ActaResumenDto>>(newUrl, getAuthHeader());
  return response.data;
};

export const getResumenActasPersonal = async (params:Record<string, any>): Promise<PageResponse<ActaResumenDto>> => {
  const newUrl = buildUrl(`${baseURL}/acta/private/user`, params);
  const response = await axios.get<PageResponse<ActaResumenDto>>(newUrl, getAuthHeader());
  return response.data;
};

export const obtenerActasPorDia = async (fi: string, ff: string): Promise<DiasCantidad[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/user`, params);
  const response = await axios.get<DiasCantidad[]>(newUrl, getAuthHeader());
  return response.data;
}