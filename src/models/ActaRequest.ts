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
  observaciones: string,
  ubicacionRequest: UbicacionRequest,
  firma?: FirmaDTO,
  testigos?: TestigoRequest[],
  juzgado: number,
  graduacionAlcoholica: number,
  infractorFugado: boolean,
  seNiegaAFirmar: boolean,
  retencionLicencia: boolean;
  identificacion: string,
  alcoholimetro: AlcoholimetroRequest
}

export interface AlcoholimetroRequest{
  idImpresora: number,
  idAlcoholimetro: number,
}

export interface AlcoholimetroDto {
  idAlcoholimetro: number;
  numeroSerieAlcoholimetro: string;
  idImpresora: number | null;
  numeroSerieImpresora: string | null;
}