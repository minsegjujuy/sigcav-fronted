import type { InfractorSolicitud } from "./InfractorSolicitud";
import type { VehiculoSolicitud } from "./VehiculoSolicitud";

export interface ActaRequest {
  idActa?: number;
  idGrupo: number;
  idTipo: number;
  idUser?: number;
  idPuesto?: number;
  motivo: string;
  nro: string;
  articulos: number[];
  infractor: InfractorSolicitud;
  vehiculo: VehiculoSolicitud;
  adjunta: string,
  retencion: string
}