import type { HechoVialListDto } from "../models/HechoVialListDto";
import type { PageResponse } from "../models/PageResponse";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { HechoVialForm } from "../models/HechoVialForm";
import api from "../interceptors/axios.interceptors";
import type { HechoVialDashboard } from "../models/HechoVialDashboard";


const baseURL = import.meta.env.VITE_API_BASE_URL;

export const listarHechosViales = async (params: {
  page: number;
  size: number;
  fechaInicio?: string;
  fechaFin?: string;
  grupoId?:string;
  danosMateriales?:string,
  victimaFatal?:string,
  soloLesionados?:boolean
}) => {
  const { data } = await api.get<PageResponse<HechoVialListDto>>(
    `${baseURL}/hechos-viales`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const descargarHechosVialesExcel = async (params: {
  fechaInicio?: string;
  fechaFin?: string;
  grupoId?: string;
  danosMateriales?: string;
  victimaFatal?: string;
  soloLesionados?: boolean;
}) => {
  const { data } = await api.get(
    `${baseURL}/hechos-viales/exportacion-excel`,
    {
      params,
      responseType: "blob",
      ...getAuthHeader(),
    }
  );

  const url = window.URL.createObjectURL(new Blob([data]));

  const link = document.createElement("a");
  link.href = url;
  link.download = "hechos_viales.xlsx";

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

export const dashboardHechosViales= async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await api.get<HechoVialDashboard>(
    `${baseURL}/hechos-viales/dashboard`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const guardarhechoVial = async (hv: HechoVialForm) => {
  const { data } = await api.post<PageResponse<HechoVialListDto>>(
    `${baseURL}/hechos-viales`, hv, getAuthHeader()
  );
  return data;
};

export const deleteHechoVial = async (id: number): Promise<void> => {
    await api.patch(`${baseURL}/hechos-viales/${id}/status`, null, getAuthHeader()
    );
};
