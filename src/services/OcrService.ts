import axios from 'axios';
import type { VehiculoSolicitud } from '../models/VehiculoSolicitud';
import { getAuthHeader } from '../utilities/getAuthHeader';
import type { Propietario } from '../models/Propietario';
import type { InfractorSolicitud } from '../models/InfractorSolicitud';

export type OcrDocumentType =
  | 'cedulaFrente'
  | 'cedulaDorso'
  | 'dniFrente'
  | 'dniDorso'
  | 'licNacFrente'
  | 'licNacDorso';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const endpointByType: Record<OcrDocumentType, string> = {
  cedulaFrente: '/ocr/procesar-cedula-frente',
  cedulaDorso: '/ocr/procesar-cedula-dorso',
  dniFrente: '/ocr/procesar-dni-frente',
  dniDorso: '/ocr/procesar-dni-dorso',
  licNacFrente: '/ocr/procesar-frente-lic-nac',
  licNacDorso: '/ocr/procesar-lic-nac-dorso',
};

const postOcrFile = async <T,>(endpoint: string, file: File): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<T>(`${baseURL}${endpoint}`, formData, {
    ...getAuthHeader(),
  });

  return response.data;
};

export const OcrService = {
  async procesarCedulaFrente(file: File): Promise<VehiculoSolicitud> {
    return postOcrFile<VehiculoSolicitud>(endpointByType.cedulaFrente, file);
  },

  async procesarCedulaDorso(file: File): Promise<Propietario> {
    return postOcrFile<Propietario>(endpointByType.cedulaDorso, file);
  },

  async procesarDniFrente(file: File): Promise<unknown> {
    return postOcrFile<unknown>(endpointByType.dniFrente, file);
  },

  async procesarDniDorso(file: File): Promise<unknown> {
    return postOcrFile<unknown>(endpointByType.dniDorso, file);
  },

  async procesarLicNacFrente(file: File): Promise<InfractorSolicitud> {
    return postOcrFile<InfractorSolicitud>(endpointByType.licNacFrente, file);
  },

  async procesarLicNacDorso(file: File): Promise<unknown> {
    return postOcrFile<unknown>(endpointByType.licNacDorso, file);
  },
};

