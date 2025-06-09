import type { Propietario } from "./Propietario";

export interface VehiculoSolicitud {
  marca: string;
  modelo: string;
  año: number;
  dominio: string;
  motor: string;
  cuadro: string;
  propietario: Propietario;
}