import type { FirmaDTO } from "./FirmaDTO";
import type { InfractorSolicitud } from "./InfractorSolicitud";
import type { UbicacionRequest } from "./UbicacionRequest";
import type { VehiculoSolicitud } from "./VehiculoSolicitud";
import type { TestigoRequest } from "./FirmaDTO";

export interface ActaRequest {
  idActa?: number;
  idGrupo: number;
  idTipo: number;
  idUser?: number;
  idPuesto?: number;
  fecha: string;
  motivo: string;
  nro: string;
  articulos: number[];
  infractor: InfractorSolicitud;
  vehiculo: VehiculoSolicitud;
  adjunta: string,
  retencion: string,
  ubicacionRequest: UbicacionRequest,
  firma?: FirmaDTO,
  testigos?: TestigoRequest[],
  juzgado: number,
  graduacionAlcoholica: number,
  infractorFugado: boolean,
  retencionVehiculo: boolean,
}
