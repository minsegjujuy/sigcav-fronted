import type { Ley } from "./Ley";

export interface Articulo {
  idArt: number;
  nro: string;
  detalle: string;
  ley: Ley | number;
}