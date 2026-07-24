import type { ActaDetalleDto } from "./ActaDetalleDto";

export interface ActaSalienteDto {
    id: number;
    lugar: string;
    legajo: string;
    fecha: string; // Se recomienda string si manejas formato ISO (YYYY-MM-DD)
    recibo: string;
    dictamen: string;
    nombreInfractor: string;
    dni: string;
    retencion: boolean;
    descargo: boolean;
    cantidadFojas: number;
    expediente: string;
    licencia: boolean;
    juzgado: string;
    
    // Relación con el detalle
    actas: ActaDetalleDto[];
}