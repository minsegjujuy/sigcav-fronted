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
  const response = await api.get<PageResponse<ActaSalienteDto>>(newUrl, getAuthHeader());
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

export const descargarExcelActas = async (recibo: string): Promise<void> => {
  const response = await api.get(
    `${baseURL}/actas-salientes/exportar?recibo=${recibo}`,
    {
      responseType: "blob",
      headers: {
        ...getAuthHeader().headers,
      },
    }
  );

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  // 🔥 Sanitizar caracteres inválidos
  const reciboSeguro = recibo.replace(/[\\/:*?"<>|]/g, "_");

  const link = document.createElement("a");
  link.href = url;
  link.download = `actas_recibo_${reciboSeguro}.xlsx`;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};


