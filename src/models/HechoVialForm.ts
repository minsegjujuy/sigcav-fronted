import type { UbicacionRequest } from "./UbicacionRequest";

export interface HechoVialForm {
  destacamento: number;
  fecha: string;
  hora: string;
  ruta: string;
  dependencia: string;
  ubicacionReq: UbicacionRequest;
  victimaFatal: string; // "SI" | "NO"
  danosMateriales: string;
  zona: string;
  tipoVia: string;
  tipoViaOtro?: string;
  involucrados: Involucrado[];
  configuracionVia: string;
  estadoCalzada: string;
  materialCalzada: string;
  estadoFisicoCalzada: string;
  estadoAmbiental: string;
  luzArtificial: string;
  semaforo: string;
  tipoSiniestro: string;
  tipoColision?: string;
  posiblesCausas: string[];
  sintesis: string;
  protagonistas: Protagonista[];
}

export interface Involucrado {
  tipo: string;
  cantidad: number;
  especificarOtro?: string;
}

export interface Acompanante {
  id?:number;
  nombre: string;
  genero: string;
  nacionalidad: string;
  provincia: string;
  tipo: 'DNI' | 'LC' | 'LE' | 'CI';
  numeroDocumento: string;
  fechaNacimiento: string;
  edad: string;
  usoCinturonCasco: boolean;
  dispositivoRetencion: boolean;
  trasladado: string;
  estadoSalud: string;
}

export interface Protagonista {
  id?:number;
  tipoRodado: string;
  dominio: string;
  marca: string;
  modelo: string;
  color: string;
  asegurado: boolean;
  rto: boolean;
  cedula: boolean;
  airbagActivado: boolean;
  usoSeguridad: boolean;
  // Datos del Conductor
  conductorNombre: string;
  conductorGenero: string;
  conductorDni: string;
  conductorNacionalidad: string;
  conductorEdad: string;
  conductorFechaNacimiento: string;
  licenciaNro: string;
  licenciaClase: string;
  licenciaEstado: 'VIGENTE' | 'VENCIDA' | 'NO POSEE' | 'SD';
  // Personal de Seguridad (Opcional)
  esFuerzaSeguridad: boolean;
  jerarquia?: string;
  legajo?: string;
  // Salud y Alcohol
  trasladoConductor: string;
  graduacionAlcoholica: string;
  actaRef: string;
  articuladoRef: string;
  // Lista anidada
  acompanantes: Acompanante[];
}