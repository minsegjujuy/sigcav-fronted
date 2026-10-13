import type { Propietario } from "./Propietario";

export interface VehiculoSolicitud {
  idVeh?:number | undefined | null;
  marca?: string | undefined | null;
  modelo?: string | undefined | null;
  dominio: string;
  motor?: string | undefined | null;
  cuadro?: string | undefined | null;
  tipoRodado?: string;
  propietario?: Propietario | null;
  infractorPropietario?: boolean;
  idTipoVehiculo?: number;
  idMarca? : number;
  idModelo? : number

}
