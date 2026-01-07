import * as turf from '@turf/turf';

export function findDepartamento(
  lat: number,
  lng: number,
  departamentosGeoJson: any
) {
  // IMPORTANTE: Turf siempre espera [Longitud, Latitud]
  // Asegúrate de que 'lng' sea el valor cercano a -65 y 'lat' a -23
  const point = turf.point([lng, lat]);

  for (const feature of departamentosGeoJson.features) {
    // Turf maneja automáticamente Polygons y MultiPolygons
    const inside = turf.booleanPointInPolygon(point, feature);

    if (inside) {
      // Cambiado de .nombre a .departamento según tu JSON
      return feature.properties.departamento; 
    }
  }

  return null;
}