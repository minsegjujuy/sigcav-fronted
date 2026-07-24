import type { Propietario } from "./Propietario";

export interface Vehiculo {
  idVeh: number;
  marca?: string | null;
  modelo?: string | null;
  año?: number | null;
  dominio?: string | null;
  motor?: string | null;
  cuadro?: string | null;
  propietario : Propietario | null
}
