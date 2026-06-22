import type { Acompanante, HechoVialForm, Involucrado, Protagonista } from "../models/HechoVialForm";
import type { HechoVialListDto } from "../models/HechoVialListDto";
import type { UbicacionRequest } from "../models/UbicacionRequest";

type AnyRecord = Record<string, unknown>;

const parseInvolucrado = (input: string): Involucrado => {
  const raw = String(input ?? "").trim();
  if (!raw) return { tipo: "", cantidad: 1 };

  const match = raw.match(/^\s*(\d+)\s+(.+?)\s*$/);
  if (!match) return { tipo: raw, cantidad: 1 };

  const cantidad = Number(match[1]);
  const tipoRaw = match[2].trim();

  return {
    tipo: tipoRaw,
    cantidad: Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1,
  };
};

const normalizeLicenciaEstado = (
  value: unknown
): Protagonista["licenciaEstado"] | "" => {
  const raw = String(value ?? "").trim().toUpperCase();
  if (!raw) return "";

  if (raw === "NO POSEE" || raw === "NO_POSEE" || raw === "NOPOSEE") return "NO_POSEE";
  if (raw === "VIGENTE") return "VIGENTE";
  if (raw === "VENCIDA") return "VENCIDA";
  if (raw === "SD" || raw === "S/D") return "SD";

  return raw as Protagonista["licenciaEstado"];
};

const toBool = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
};

const str = (value: unknown, fallback = ""): string => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const numOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toIdOrName = (value: unknown): { id?: number; name?: string } => {
  if (typeof value === "number" && Number.isFinite(value)) return { id: value };

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return {};

    // Si viene un id como string ("123"), lo parseamos.
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      return Number.isFinite(n) ? { id: n } : {};
    }

    // Caso común: vienen nombres ("UNIDAD REGIONAL 1", "SAN SALVADOR DE JUJUY")
    return { name: trimmed };
  }

  return {};
};

const mapAcompanante = (a: Acompanante | AnyRecord): Acompanante => {
  const raw = a as AnyRecord;

  return {
    id: raw["id"] as number | undefined,
    nombre: str(raw["nombre"]),
    genero: str(raw["genero"]),
    nacionalidad: str(raw["nacionalidad"]),
    provincia: str(raw["provincia"]),
    tipo: (raw["tipo"] ?? raw["tipoDocumento"] ?? raw["tipo_documento"] ?? "DNI") as Acompanante["tipo"],
    numeroDocumento: str(raw["numeroDocumento"]),
    fechaNacimiento: str(raw["fechaNacimiento"]),
    edad: str(raw["edad"]),
    usoCinturonCasco: toBool(raw["usoCinturonCasco"]),
    dispositivoRetencion: toBool(raw["dispositivoRetencion"]),
    trasladado: str(raw["trasladado"]),
    estadoSalud: str(raw["estadoSalud"]),
  };
};

const mapProtagonista = (p: Protagonista | AnyRecord): Protagonista => {
  const raw = p as AnyRecord;

  return {
    id: raw["id"] as number | undefined,
    tipoRodado: str(raw["tipoRodado"]),
    dominio: str(raw["dominio"]),
    marca: str(raw["marca"]),
    modelo: str(raw["modelo"]),
    color: str(raw["color"]),
    asegurado: toBool(raw["asegurado"]),
    rto: toBool(raw["rto"]),
    cedula: toBool(raw["cedula"]),
    airbagActivado: toBool(raw["airbagActivado"]),
    usoSeguridad: toBool(raw["usoSeguridad"]),

    conductorNombre: str(raw["conductorNombre"]),
    conductorGenero: str(raw["conductorGenero"]),
    conductorDni: str(raw["conductorDni"]),
    conductorNacionalidad: str(raw["conductorNacionalidad"]),
    conductorEdad: str(raw["conductorEdad"]),
    conductorFechaNacimiento: str(
      raw["conductorFechaNacimiento"] ?? raw["fechaNacimiento"] ?? raw["fecha_nacimiento"]
    ),

    licenciaNro: str(raw["licenciaNro"]),
    licenciaTipo: str(raw["licenciaTipo"]),
    municipio: str(raw["municipio"]),
    licenciaClase: str(
      raw["licenciaClase"] ?? raw["tipoLiciencia"] ?? raw["tipoLicencia"] ?? raw["tipo_licencia"]
    ),
    licenciaEstado: (normalizeLicenciaEstado(
      raw["licenciaEstado"] ?? raw["estadoLicencia"] ?? raw["estado_licencia"]
    ) || "SD") as Protagonista["licenciaEstado"],

    esFuerzaSeguridad: toBool(raw["esFuerzaSeguridad"]),
    situacion: str(raw["situacion"]),
    jerarquia: raw["jerarquia"] as string | undefined,
    legajo: raw["legajo"] as string | undefined,

    trasladoConductor: str(raw["trasladoConductor"]),
    graduacionAlcoholica: numOrNull(raw["graduacionAlcoholica"]),
    estadoSalud: str(raw["estadoSalud"]),
    actaRef: str(raw["actaRef"]),
    actaRetencionRef: str(raw["actaRetencionRef"]),
    articuladoRef: Array.isArray(raw["articuladoRef"]) ? (raw["articuladoRef"] as number[]) : [],

    acompanantes: Array.isArray(raw["acompanantes"]) ? (raw["acompanantes"] as AnyRecord[]).map(mapAcompanante) : [],
  };
};

const buildUbicacionReq = (dto: HechoVialListDto): UbicacionRequest => {
  const ur = toIdOrName(dto.ubicacionReq?.unidadRegional);
  const loc = toIdOrName(dto.ubicacionReq?.localidad);

  return {
    lat: dto.ubicacionReq.lat,
    lng: dto.ubicacionReq.lng,
    departamento: dto.ubicacionReq.departamento,
    unidadRegional: ur.id,
    unidadRegionalNombre: ur.name,
    localidad: loc.id,
    localidadNombre: loc.name,
    descripcion: str(dto.ubicacionReq.descripcion),
  };
};

export function mapHechoVialListDtoToForm(dto: HechoVialListDto): HechoVialForm {
  const fechaISO = dto.fecha ?? "";
  const [fecha, horaCompleta] = fechaISO.split("T");

  return {
    id: dto.id,

    destacamento: dto.destacamento,
    grupo: dto.grupo,
    fecha: fecha ?? "",
    hora: horaCompleta ? horaCompleta.substring(0, 5) : "",
    comisaria: dto.comisaria,

    ubicacionReq: buildUbicacionReq(dto),

    victimaFatal: dto.victimaFatal as "SI" | "NO",
    danosMateriales: dto.danosMateriales as "SI" | "NO",

    zona: dto.zona,
    tipoVia: dto.tipoVia,
    tipoViaOtro: dto.tipoViaOtro,

    involucrados: (dto.involucrados ?? []).map(parseInvolucrado),

    configuracionVia: dto.configuracionVia,
    estadoCalzada: dto.estadoCalzada,
    materialCalzada: dto.materialCalzada,
    estadoFisicoCalzada: dto.estadoFisicoCalzada,
    estadoAmbiental: dto.estadoAmbiental,
    luzArtificial: dto.luzArtificial,
    semaforo: dto.semaforo,

    tipoSiniestro: dto.tipoSiniestro,
    tipoColision: dto.tipoColision,

    posiblesCausas: dto.posiblesCausas ?? [],
    sintesis: dto.sintesis ?? "",

    protagonistas: (dto.protagonistas ?? []).map(mapProtagonista),
    unidades: dto.unidades ?? [],
  };
}
