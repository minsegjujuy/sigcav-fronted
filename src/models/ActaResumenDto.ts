import type { ArticuloDto } from "./ArticuloDto";
import type { InfractorSolicitud } from "./InfractorSolicitud";
import type { UbicacionRsponse } from "./UbicacionResponse";
import type { VehiculoSolicitud } from "./VehiculoSolicitud";

export interface ActaResumenDto {
  idActa: number;
  nro: string;
  idGrupo: number;
  idPuesto?: number;
  fecha: string; // se usa string porque LocalDateTime se serializa como ISO 8601 en JSON
  motivo: string;
  idTipo: number;
  retencion: string;
  infractor: InfractorSolicitud;
  vehiculo: VehiculoSolicitud;
  articulos: ArticuloDto[];
  legajo: string;
  nombre: string;
  adjunta: string;
  ubicacionResponse: UbicacionRsponse;
  juzgado: number,
  retencionVehiculo: boolean;
  infractorFugado: boolean;
}
