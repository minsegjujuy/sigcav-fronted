import type { InfractorSolicitud } from "./InfractorSolicitud";
import type { VehiculoSolicitud } from "./VehiculoSolicitud";

export interface ActaRequest {
  idGrupo: number;
  idTipo: number;
  idUser: number;
  motivo: string;
  nro: string;
  idPuesto: number;
  articulos: number[];
  infractor: InfractorSolicitud;
  vehiculo: VehiculoSolicitud;
}