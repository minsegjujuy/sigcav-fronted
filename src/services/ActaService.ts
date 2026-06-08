import { getAuthHeader } from "../utilities/getAuthHeader";
import type { ActaRequest } from "../models/ActaRequest";
import type { ActaResumenDto } from "../models/ActaResumenDto";
import api from "../interceptors/axios.interceptors";
import type { PageResponse } from "../models/PageResponse";
import buildUrl from "../utilities/BuildUrl";
import type { DiasCantidad } from "../models/DiasCantidad";
import type { ArticuloCantidad } from "../models/ArticuloCantidad";
import type { ActaGrupo } from "../models/ActaGrupo";
import type { GrupoInforme } from "../models/GrupoInforme";
import type { TipoInformeList } from "../models/TipoInformeList";
import type { ReporteActas } from "../models/Reporte";

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

export const obtenerActasPorDia = async (fi: string, ff: string): Promise<DiasCantidad[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/dias`, params);
  const response = await api.get<DiasCantidad[]>(newUrl, getAuthHeader());
  return response.data;
}

export const descargarPdfActa = async (nro: string): Promise<Blob> => {
  const response = await api.get(`${baseURL}/acta/${nro}/pdf`, {
    responseType: "blob",
    ...getAuthHeader()
  });

  return response.data;
};

export const obtenerPorcentajeDeActasPorDia = async (fi: string, ff: string): Promise<DiasCantidad[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/dias-porcentaje`, params);
  const response = await api.get<DiasCantidad[]>(newUrl, getAuthHeader());
  return response.data;
}

export const obtenerActasPorArticulo = async (fi: string, ff: string): Promise<ArticuloCantidad[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/articulo`, params);
  const response = await api.get<ArticuloCantidad[]>(newUrl, getAuthHeader());
  return response.data;
}

export const obtenerActasPorGrupo = async (fi: string, ff: string): Promise<ActaGrupo[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/por-grupo`, params);
  const response = await api.get<ActaGrupo[]>(newUrl, getAuthHeader());
  return response.data;
}

export const obtenerActasPorGrupoPorPuesto = async (fi: string, ff: string): Promise<GrupoInforme[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/grupos-por-puesto`, params);
  const response = await api.get<GrupoInforme[]>(newUrl, getAuthHeader());
  return response.data;
}

export const obtenerTipoDeActasPorPuesto = async (fi: string, ff: string): Promise<TipoInformeList[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/tipos-por-puesto`, params);
  const response = await api.get<TipoInformeList[]>(newUrl, getAuthHeader());
  return response.data;
}

export const obtenerActasPorNacionalidad = async (fi: string, ff: string): Promise<ReporteActas[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/cantidad-nacionalidad`, params);
  const response = await api.get<ReporteActas[]>(newUrl, getAuthHeader());
  return response.data;
}

export const obtenerActasPorMotivo = async (fi: string, ff: string): Promise<ReporteActas[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/cantidad-motivo`, params);
  const response = await api.get<ReporteActas[]>(newUrl, getAuthHeader());
  return response.data;
}

export const obtenerActasPorProvincia = async (fi: string, ff: string): Promise<ReporteActas[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/cantidad-provincia`, params);
  const response = await api.get<ReporteActas[]>(newUrl, getAuthHeader());
  return response.data;
}

export const obtenerActasPorJerarquia = async (fi: string, ff: string): Promise<ReporteActas[]> => {
  const params = {
    fechaInicio:fi,
    fechaFin:ff
  }
  const newUrl = buildUrl(`${baseURL}/acta/private/cantidad-jerarquia`, params);
  const response = await api.get<ReporteActas[]>(newUrl, getAuthHeader());
  return response.data;
}