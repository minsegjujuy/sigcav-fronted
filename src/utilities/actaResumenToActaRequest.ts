import type { ActaRequest } from "../models/ActaRequest";
import type { ActaResumenDto } from "../models/ActaResumenDto";

export const actaResumenToActaRequest = (
  acta: ActaResumenDto,
): ActaRequest => {
  return {
    idActa: acta.idActa,
    idGrupo: acta.idGrupo,
    idTipo: acta.idTipo,
    motivo: acta.motivo,
    nro: acta.nro,
    articulos: acta.articulos.map(a => a.idArt),
    infractor: acta.infractor,
    vehiculo: acta.vehiculo,
    adjunta: acta.adjunta,
    retencion: acta.retencion,
    ubicacionRequest: {departamento: acta.ubicacionResponse.departamento, lat: acta.ubicacionResponse.lat, 
      lng: acta.ubicacionResponse.lng}
  };
};
