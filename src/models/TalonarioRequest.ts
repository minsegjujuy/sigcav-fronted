import type { Puesto } from "./Puesto";

export interface TalonarioRequest {
  nroInicial: number;
  puesto: Puesto; // o Puesto, según tu backend
}