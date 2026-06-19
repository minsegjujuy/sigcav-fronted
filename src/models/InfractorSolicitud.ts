import type { LicenciaRequest } from "./LicenciaRequest";

export interface InfractorSolicitud {
  idInfrac: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  nacionalidad: string;
  domicilio: string;
  fechaNacimiento?: string;
  localidad?: string;
  provincia: string;
  //licencia
  licencia: LicenciaRequest;
  propietario: boolean;
}