import type { Licencia } from "./Licencia";
import type { Vehiculo } from "./Vehiculo";

export interface Infractor {
  idInfrac: number;
  nombre: string;
  apellido?: string | null;
  dni: string;
  domicilio: string;
  lugar?: string | null;
  propietario?: boolean;
  vehiculos: Vehiculo[]
  licencias:  Licencia[]
}
