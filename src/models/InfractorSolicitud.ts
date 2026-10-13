import type { LicenciaRequest } from "./LicenciaRequest";

export interface InfractorSolicitud {
  idInfrac: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  idPais?: number;
  nacionalidad: string;
  domicilio: string;
  fechaNacimiento?: string;
  localidad?: string;
  idLocalidad? : number;
  idProvincia?: number;
  provincia: string;
  idDepartamento?: number;
  departamento?: string
  //licencia
  licencia: LicenciaRequest | null;
  propietario: boolean;
}
