import type { Licencia } from "./Licencia";
import type { Vehiculo } from "./Vehiculo";

export interface Infractor {
  idInfrac: number;
  nombre: string;
  apellido?: string | null;
  dni: string;
  domicilio: string;
  fechaNacimiento?: string | null;
  lugar?: string | null;
  vehiculos: Vehiculo[]
  licencias:  Licencia[]
  localidad: string,
  provincia: string,
  nacionalidad: string,
}
