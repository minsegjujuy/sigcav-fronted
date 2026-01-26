export interface UbicacionRequest {
  lat: number;
  lng: number;
  departamento: string;
  unidadRegional?: number;
  localidad?: number;
}