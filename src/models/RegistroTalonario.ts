import type { Talonario } from "./Talonario";

export interface RegistroTalonario {
  idReg: number;
  nro: number;
  estado: string;
  talonario: Talonario;
}