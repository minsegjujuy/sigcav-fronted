import type { ArticuloDto } from "./ArticuloDto";

export interface ActaResumenDto {
  idActa: number;
  nro: string;
  idGrupo: number;
  fecha: string; // se usa string porque LocalDateTime se serializa como ISO 8601 en JSON
  motivo: string;
  retencion: string;
  nombre: string;
  dominio: string;
  articulos: ArticuloDto[];
}
