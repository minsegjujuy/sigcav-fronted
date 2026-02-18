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
    nroActa: dto.nroActa,
    fechaActa: dto.fechaActa,
    nombreInfractor: dto.nombreInfractor,
    dni: dto.dni,
    tipo: dto.tipo,
    articulado: dto.articulado,
    retencion: dto.retencion,
    descargo: dto.descargo,
    cantidadFojas: dto.cantidadFojas,
    juzgado: juzgadoId, // 👈 necesario porque el DTO trae nombre, no id
  };
};
