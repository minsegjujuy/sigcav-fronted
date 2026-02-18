import axios from "axios";
import type { ActaSalienteDto } from "../models/ActaSalienteDto";
import type { PageResponse } from "../models/PageResponse";
import buildUrl from "../utilities/BuildUrl";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { EstadoActaSaliente } from "../components/containers/CambiarEstadoButton";
import api from "../interceptors/axios.interceptors";
import type { ActaSalienteRequest } from "../pages/FormActaSaliente";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const crearActaSaliente = async (acta: ActaSalienteRequest): Promise<ActaSalienteDto> => {
  const response = await api.post<ActaSalienteDto>(
    `${baseURL}/actas-salientes`,
    acta,
    getAuthHeader()
  );
  return response.data;
};

export const actualizarActaSaliente = async (acta: ActaSalienteRequest): Promise<ActaSalienteDto> => {
  const response = await api.put<ActaSalienteDto>(
    `${baseURL}/actas-salientes`,
    acta,
    getAuthHeader()
  );
  return response.data;
};

export const obtenerActasSalientes = async (params:Record<string, any>): Promise<PageResponse<ActaSalienteDto>> => {
  const newUrl = buildUrl(`${baseURL}/actas-salientes`, params);
  const response = await axios.get<PageResponse<ActaSalienteDto>>(newUrl, getAuthHeader());
  return response.data;
};

export const cambiarEstado = async (
  estado: EstadoActaSaliente,
  motivo: string,
  id: number
): Promise<ActaSalienteDto> => {
  const response = await api.patch<ActaSalienteDto>(
    `${baseURL}/actas-salientes/${id}/estado`,
    null,
    {
      params: { estado, motivo },
      ...getAuthHeader(),
    }
  );

  return response.data;
};
