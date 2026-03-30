import type { ActaRequest } from "../models/ActaRequest";
import type { ActaResumenDto } from "../models/ActaResumenDto";

const splitApellidoNombrePorComa = (
  value: string | null | undefined,
): { apellido: string; nombre: string } | null => {
  const raw = (value ?? "").trim();
  const commaIndex = raw.indexOf(",");
  if (commaIndex === -1) return null;

  const apellido = raw.slice(0, commaIndex).trim();
  const nombre = raw.slice(commaIndex + 1).trim();
  if (!apellido && !nombre) return null;

  return { apellido, nombre };
};

const parseUnidadRegionalId = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = String(value ?? "");
  const match = text.match(/\d+/);
  if (!match) return undefined;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const actaResumenToActaRequest = (
  acta: ActaResumenDto,
): ActaRequest => {
  const infractor = { ...acta.infractor };

  const parsedFromNombre = splitApellidoNombrePorComa(infractor.nombre);
  if (parsedFromNombre) {
    infractor.apellido = parsedFromNombre.apellido || infractor.apellido;
    infractor.nombre = parsedFromNombre.nombre || infractor.nombre;
  } else {
    const parsedFromApellido = splitApellidoNombrePorComa(infractor.apellido);
    if (parsedFromApellido) {
      infractor.apellido = parsedFromApellido.apellido || infractor.apellido;
      infractor.nombre = parsedFromApellido.nombre || infractor.nombre;
    }
  }

  const unidadRegional =
    parseUnidadRegionalId(acta.ubicacionResponse?.urId) ??
    parseUnidadRegionalId(acta.ubicacionResponse?.idUr) ??
    parseUnidadRegionalId(acta.ubicacionResponse?.unidadRegional);

  return {
    idActa: acta.idActa,
    idGrupo: acta.idGrupo,
    idTipo: acta.idTipo,
    idPuesto: acta.idPuesto,
    motivo: acta.motivo,
    nro: acta.nro,
    articulos: acta.articulos.map((a) => a.idArt),
    infractor,
    vehiculo: acta.vehiculo,
    adjunta: acta.adjunta,
    retencion: acta.retencion,
    juzgado: acta.juzgado,
    graduacionAlcoholica: 0,
    infractorFugado: acta.infractorFugado,
    retencionVehiculo: acta.retencionVehiculo,
    ubicacionRequest: {
      departamento: acta.ubicacionResponse.departamento,
      lat: acta.ubicacionResponse.lat,
      lng: acta.ubicacionResponse.lng,
      unidadRegional,
      descripcion: acta.ubicacionResponse.descripcion,
      localidad: acta.ubicacionResponse.localidad
    },
    fecha: acta.fecha,
  };
};
