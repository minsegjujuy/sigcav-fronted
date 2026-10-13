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
  idLey: number;
  enabled: boolean;
}

export interface ArticuloRequest {
  idArt: number | null;
  nro: string;
  detalle: string;
  velocidad: boolean;
  alcoholemia: boolean;
  idLey: number;
  enabled: boolean;
  unidadesFijas: number;
  importe: number;
}