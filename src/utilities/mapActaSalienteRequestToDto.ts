import type { ActaSalienteDto } from "../models/ActaSalienteDto";
import type { ActaSalienteRequest } from "../pages/FormActaSaliente";

export const mapActaSalienteDtoToRequest = (
  dto: ActaSalienteDto,
  juzgadoId: number
): ActaSalienteRequest => {
  return {
    id: dto.id,
    lugar: dto.lugar,
    fecha: dto.fecha,
    recibo: dto.recibo,
    dictamen: dto.dictamen,
    nombreInfractor: dto.nombreInfractor,
    dni: dto.dni,
    retencion: dto.retencion,
    descargo: dto.descargo,
    cantidadFojas: dto.cantidadFojas,
    actas: dto.actas,
    expediente: dto.expediente,
    juzgado: juzgadoId,
  };
};
