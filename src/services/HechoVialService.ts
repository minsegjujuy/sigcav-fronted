import axios from "axios";
import type { HechoVialListDto } from "../models/HechoVialListDto";
import type { PageResponse } from "../models/PageResponse";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { HechoVialForm } from "../models/HechoVialForm";
import api from "../interceptors/axios.interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const listarHechosViales = async (params: {
  page: number;
  size: number;
  fechaInicio?: string;
  fechaFin?: string;
}) => {
  const { data } = await axios.get<PageResponse<HechoVialListDto>>(
    `${baseURL}/hechos-viales`,
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
