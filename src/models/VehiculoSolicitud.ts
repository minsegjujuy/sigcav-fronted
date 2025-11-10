import type { Propietario } from "./Propietario";

export interface VehiculoSolicitud {
  idVeh?:number;
  marca?: string;
  modelo?: string;
  año?: number;
  dominio: string;
  motor?: string;
  cuadro?: string;
  propietario?: Propietario | null;
}