import type { Protagonista } from "./HechoVialForm";
import type { UbicacionDto } from "./UbicacionDto";

export interface HechoVialListDto {
  id: number;
  fecha: string;
  ruta: string;
  dependencia: string;
  victimaFatal: string;
  danosMateriales: string;
  zona: string;
  tipoVia: string;
  tipoViaOtro?: string;
  involucrados: string[];
  configuracionVia: string;
  estadoCalzada: string;
  materialCalzada: string;
  estadoFisicoCalzada: string;
  estadoAmbiental: string;
  luzArtificial: string;
  semaforo: string;
  tipoSiniestro: string;
  tipoColision?: string;
  posiblesCausas: string[];
  sintesis: string;
  ubicacionReq: UbicacionDto;
  protagonistas: Protagonista[];
  puesto: string;
}