import type { Licencia } from "./Licencia";
import type { Vehiculo } from "./Vehiculo";

export interface Infractor {
  idInfrac: number | null;
  nombre: string;
  apellido?: string | null;
  dni: string;
  domicilio: string | null;
  fechaNacimiento?: string | null;
  lugar?: string | null;
  vehiculos: Vehiculo[]
  licencias: Licencia[] | null;
  idPais?: number | null;
  localidad: string | null,
  idLocalidad?: number | null;
  idProvincia?: number | null;
  provincia: string | null,
  idDepartamento?: number | null;
  departamento?: string | null;
  nacionalidad: string | null,
  sexo?: string | null;
}
