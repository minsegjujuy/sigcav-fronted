export interface UbicacionRequest {
  lat: number;
  lng: number;
  departamento: string;
  unidadRegional?: number;
  localidad?: number;
  // En algunos endpoints el backend devuelve nombres (no IDs). Los guardamos aparte para
  // poder resolverlos a IDs en el formulario sin romper otros requests (p.ej. Actas).
  unidadRegionalNombre?: string;
  localidadNombre?: string;
  descripcion: string;
}
