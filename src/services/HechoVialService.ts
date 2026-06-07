import axios from "axios";
import type { HechoVialListDto } from "../models/HechoVialListDto";
import type { PageResponse } from "../models/PageResponse";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { HechoVialForm } from "../models/HechoVialForm";
import api from "../interceptors/axios.interceptors";
import type { UbicacionPunto } from "../models/UbicacionPunto";
import type { MetricasSiniestralidad } from "../models/Metricas";
import type { PorcentajeAlcoholizados } from "../models/PorcentajeAlcoholizados";
import type { TurnoData } from "../models/TurnoData";
import type { DiasCantidad } from "../models/DiasCantidad";
import type { GeneroPorcentajeDto } from "../models/GeneroPorcentajeDto";
import type { RangoEdadPorcentajeDto } from "../models/RangoEdadPorcentajeDto";
import type { DepartamentoPorcentajeDto } from "../models/DepartamentoPorcentajeDto";
import type { IndicadorPorcentajeDto } from "../models/IndicadorPorcentajeDto";
import type { UnidadRegionalCantidadDto } from "../models/UnidadRegionalCantidadDto";
import type { DepartamentoTipoViaDto } from "../models/DepartamentoTipoViaDto";

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

export const listarHechosVialesUbicaciones = async (params: {
  fechaInicio: string;
  fechaFin: string;
  danosMateriales?:string,
  victimaFatal?:string,
  soloLesionados?:boolean
}) => {
  const { data } = await axios.get<UbicacionPunto[]>(
    `${baseURL}/hechos-viales/ubicaciones`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const listarHechosVialesMetricas= async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<MetricasSiniestralidad>(
    `${baseURL}/hechos-viales/metricas`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const listarHechosVialesAlcoholizados= async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<PorcentajeAlcoholizados>(
    `${baseURL}/hechos-viales/alcoholizados`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const listarHechosVialesPorTurnos= async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<TurnoData[]>(
    `${baseURL}/hechos-viales/turnos`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const listarHechosVialesPorDia= async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<DiasCantidad[]>(
    `${baseURL}/hechos-viales/dias`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const listarHechosVialesPorTipoRodado= async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<DiasCantidad[]>(
    `${baseURL}/hechos-viales/tipo-rodado`,
    {params, ...getAuthHeader()}
  );
  return data;
};


export const obtenerPorcentajeGeneroPorFechas = async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<GeneroPorcentajeDto[]>(
    `${baseURL}/hechos-viales/porcentaje-genero-fechas`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const obtenerCantidadYPorcentajePorRangoEdad = async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<RangoEdadPorcentajeDto[]>(
    `${baseURL}/hechos-viales/rango-edad`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const obtenerCantidadYPorcentajePorDepartamento = async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<DepartamentoPorcentajeDto[]>(
    `${baseURL}/hechos-viales/por-departamento`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const obtenerHechosVialesPorDepartamentoYTipoVia = async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<DepartamentoTipoViaDto[]>(
    `${baseURL}/hechos-viales/por-departamento-y-tipo-via`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const obtenerIndicadorUsoCascoMotocicletaVictimaFatal = async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<IndicadorPorcentajeDto[]>(
    `${baseURL}/hechos-viales/indicador-uso-casco-motocicleta-victima-fatal`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const obtenerIndicadorUsoSeguridadVehiculosNoMotoNiBicicletaVictimaFatal = async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<IndicadorPorcentajeDto[]>(
    `${baseURL}/hechos-viales/indicador-uso-seguridad-no-moto-ni-bicicleta-victima-fatal`,
    {params, ...getAuthHeader()}
  );
  return data;
};

export const obtenerCantidadHechosVialesPorUnidadRegional = async (params: {
  fechaInicio: string;
  fechaFin: string
}) => {
  const { data } = await axios.get<UnidadRegionalCantidadDto[]>(
    `${baseURL}/hechos-viales/cantidad-por-unidad-regional`,
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
    await axios.patch(`${baseURL}/hechos-viales/${id}/status`, null, getAuthHeader()
    );
};
