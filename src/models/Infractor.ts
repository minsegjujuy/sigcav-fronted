import type { Vehiculo } from "./Vehiculo";

export interface Infractor {
  idInfrac: number;
  nombre: string;
  apellido?: string | null;
  dni: string;
  lugar?: string | null;
  propietario?: boolean;
  vehiculos: Vehiculo[]
}
