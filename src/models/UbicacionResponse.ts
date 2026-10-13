export interface UbicacionRsponse {
  lat: number;
  lng: number;
  departamento: string;
  // Texto que mostraba el backend (por compatibilidad)
  unidadRegional: string;
  // Nuevo: id de unidad regional para seleccionar en UI
  urId?: number;
  // Compatibilidad si en algÃºn endpoint viene con otro nombre
  idUr?: number;
  localidad: number;
  descripcion: string
  idProvinciaCatalogo?: number;
  idDepartamentoCatalogo?: number;
  idLocalidadCatalogo?: number;
}
