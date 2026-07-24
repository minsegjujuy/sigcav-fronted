import type { Puesto } from "./Puesto";

export interface Talonario {
  idTal: number;
  nroInicial: number;
  fechaCreacion: string; // LocalDateTime se representa como string ISO en JSON
  cantidadCompletadas: number;
  cantidadTotal: number;
  puesto: Puesto;
}