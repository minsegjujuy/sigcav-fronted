import type { Ley } from "./Ley";

export interface Articulo {
  idArt: number;
  nro: string;
  detalle: string;
  ley: Ley | number;
}

export interface ArticuloList {
  idArt: number;
  nro: string;
  detalle: string;

  velocidad: boolean;
  alcoholemia: boolean;

  unidadesFijas: number;
  importe: number;
}

export interface ArticuloRequest {
  idArt: number;

  velocidad: boolean;
  alcoholemia: boolean;

  unidadesFijas: number;
  importe: number;
}