export interface ActaResumenDto {
  nro: string;
  grupo: string;
  fecha: string; // LocalDateTime → string en JSON
  motivo: string;
  retencion: string;
  nombre: string;
  apellidor: string;
  marcaVehiculo: string;
  modeloVehiculo: string;
  año: number;
  dominio: string;
}
