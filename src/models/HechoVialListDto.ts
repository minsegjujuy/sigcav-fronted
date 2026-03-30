import type { Protagonista } from "./HechoVialForm";
import type { UnidadInterviniente } from "./PersonalInterviniente";
import type { UbicacionDto } from "./UbicacionDto";

export interface HechoVialListDto {
  id: number;
  fecha: string;
  victimaFatal: string;
  danosMateriales: 'SI' | 'NO';
  zona: string;
  tipoVia: string;
  grupo: number;
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
  unidades: UnidadInterviniente[];
  usuario: string;
}