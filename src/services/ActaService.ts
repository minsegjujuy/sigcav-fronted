import axios, { AxiosError } from "axios";
import { getAuthHeader } from "../utilities/getAuthHeader";
import type { ActaRequest } from "../models/ActaRequest";
import type { ActaResumenDto } from "../models/ActaResumenDto";
import type { ErrorResponse } from "../models/ErrorResponse";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const crearActa = async (acta: ActaRequest): Promise<ActaRequest> => {
  try {
    const response = await axios.post<ActaRequest>(
      `${baseURL}/acta/nueva`,
      acta,
      getAuthHeader()
    );
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError<ErrorResponse>;

    if (axiosErr.response?.data) {
      const errorData = axiosErr.response.data;

      // 🔹 Si querés tirar el error completo al componente
      throw errorData;

      // 🔹 O si preferís un mensaje plano:
      // throw new Error(errorData.message);
    }

    // Caso genérico: error de red u otro
    throw new Error("No se pudo conectar con el servidor.");
  }
};

export const getResumenActas = async (): Promise<ActaResumenDto[]> => {
  const response = await axios.get<ActaResumenDto[]>(`${baseURL}/acta/private`, getAuthHeader());
  return response.data;
};