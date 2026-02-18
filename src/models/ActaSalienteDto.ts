export interface ActaSalienteDto {
  id: number;
  lugar: string;
  legajo: string;
  fecha: string;
  recibo: string;
  dictamen: string;
  nroActa: string;
  fechaActa: string;
  nombreInfractor: string;
  dni: string;
  tipo: string;
  articulado: string;
  retencion: boolean;
  descargo: boolean;
  cantidadFojas: number;
  juzgado: string;
}