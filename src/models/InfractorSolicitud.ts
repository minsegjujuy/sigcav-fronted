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
  idLic?: number;
  clase?: string;
  numero?: string;
  autoridadExpedicion?: string;
  fechaExpedicion?: string;
  fechaVencimiento?: string;
  propietario: boolean;
}