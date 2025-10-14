import axios from "axios";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { ActaRequest } from "../models/ActaRequest";
import type { ActaResumenDto } from "../models/ActaResumenDto";
import api from "../interceptors/axios.interceptors";
import type { PageResponse } from "../models/PageResponse";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const crearActa = async (acta: ActaRequest): Promise<ActaRequest> => {
  const response = await api.post<ActaRequest>(
    `${baseURL}/acta/nueva`,
    acta,
    getAuthHeader()
  );
  return response.data;
};

export const getResumenActas = async (page?:number, grupo?:number): Promise<PageResponse<ActaResumenDto>> => {
  const response = await axios.get<PageResponse<ActaResumenDto>>
  (`${baseURL}/acta/private?page=${page}&grupo=${grupo}`, getAuthHeader());
  return response.data;
};