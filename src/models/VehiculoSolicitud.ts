import type { Propietario } from "./Propietario";

export interface VehiculoSolicitud {
  idVeh?:number | undefined | null;
  marca?: string | undefined | null;
  modelo?: string | undefined | null;
  año?: number | undefined | null;
  dominio: string;
  motor?: string | undefined | null;
  cuadro?: string | undefined | null;
  propietario?: Propietario | null;
}