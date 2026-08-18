import type { ActaSalienteDetalleRequest } from "./ActaSalienteDetalleRequest";
import type { LicenciaRequest } from "./LicenciaRequest";
import type { UnidadInterviniente } from "./PersonalInterviniente";
import type { UbicacionRequest } from "./UbicacionRequest";

export interface HechoVialForm {
  id?: number;
  destacamento: number; //obligatorio
  grupo: number;
  fecha: string; //obligatorio
  hora: string; //obligatorio
  comisaria: string;
  ubicacionReq: UbicacionRequest; //obligatorio
  victimaFatal: string;
  danosMateriales: string;
  zona: string; //obligatorio
  tipoVia: string; //obligatorio
  tipoViaOtro?: string;
  involucrados: Involucrado[]; //obligatorio
  configuracionVia: string; //obligatorio
  estadoCalzada: string; //obligatorio
  materialCalzada: string; //obligatorio
  estadoFisicoCalzada: string; //obligatorio
  estadoFisicoCalzadaOtro?: string;
  estadoAmbiental: string; //obligatorio
  luzArtificial: string; //obligatorio
  semaforo: string; //obligatorio
  tipoSiniestro: string; //obligatorio
  tipoColision?: string;
  posiblesCausas: string[]; //obligatorio
  sintesis: string; //obligatorio
  protagonistas: Protagonista[]; //obligatorio
  unidades: UnidadInterviniente[];
  peatones: Peaton[]
  nota: string;
  deLosHechos: string;
}

export interface Peaton {
  id?: number;
  nombre: string;
  genero: string;
  nacionalidad: string;
  provincia: string;
  domicilio: string;
  localidad: string;
  tipo: 'DNI' | 'LC' | 'LE' | 'CI';
  numeroDocumento: string;
  fechaNacimiento: string;
  edad: string;
  dispositivoRetencion: boolean;
  trasladado: string;
  estadoSalud: string;
  descripcion?: string;
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
  domicilio: string;
  localidad: string;
  tipo: 'DNI' | 'LC' | 'LE' | 'CI';
  numeroDocumento: string;
  fechaNacimiento: string;
  edad: string;
  usoCinturonCasco: boolean;
  dispositivoRetencion: boolean;
  trasladado: string;
  estadoSalud: string;
  descripcion?: string;
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
  //licenciaNro: string;
  municipio: string;
  //licenciaTipo: string;
  //licenciaClase: string;
  licenciaEstado: 'VIGENTE' | 'VENCIDA' | 'NO_POSEE' | 'NO POSEE' | 'SD';
  // Personal de Seguridad (Opcional)
  esFuerzaSeguridad: boolean;
  situacion: string;
  jerarquia?: string;
  legajo?: string;
  // Salud y Alcohol
  trasladoConductor: string;
  graduacionAlcoholica: number | null; // si es null no se realizó ningun test
  estadoSalud: string;
  //actaRef: string;
  //actaRetencionRef: string;
  //articuladoRef: number[];
  // Lista anidada
  acompanantes: Acompanante[];
  licenciaRequest?: LicenciaRequest | null;
  actasNoCargadas: ActaSalienteDetalleRequest[];
  domicilio: string;
  provincia: string;
  localidad: string;
  descripcion?: string;
}
