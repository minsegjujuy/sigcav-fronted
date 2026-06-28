import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import jujuyGeoJson from "../../assets/geo/JUJUY.json";
import type { UbicacionPunto } from '../../models/UbicacionPunto';

interface MapaJujuyProps {
  puntos: UbicacionPunto[];
}

export default function MapaJujuyHechosViales({ puntos }: MapaJujuyProps) {
  // Centro aproximado de Jujuy para cuando no hay puntos
  const defaultCenter: [number, number] = [-23.5, -65.5];

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        // Si hay puntos, centramos en el primero; si no, en el centro de la provincia
        center={puntos.length > 0 ? [puntos[0].lat, puntos[0].lng] : defaultCenter}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          crossOrigin={true}
        />

        {/* Capa de la provincia de Jujuy */}
        <GeoJSON
          data={jujuyGeoJson as any}
          style={{ color: "#4A90E2", weight: 2, fillOpacity: 0.05, dashArray: '5, 5' }}
        />

        {/* Renderizado de múltiples puntos desde las props */}
        {puntos.map((punto, index) => (
          <CircleMarker
            key={`${index}-${punto.lat}`}
            center={[punto.lat, punto.lng]}
            pathOptions={{
              fillColor: punto.color,
              color: punto.color, // Color del borde
              weight: 2,
              fillOpacity: 0.7,
            }}
            radius={8}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>Fallecidos: {punto.victimaFatal}</strong><br />
                <span style={{ fontSize: '0.85em', color: '#666' }}>
                  SINTESIS: {punto.sintesis}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.85em', color: '#666' }}>
                  CONDUCTORES HERIDOS: {punto.heridosProtagonistas}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.85em', color: '#666' }}>
                  ACOMPAÑANTES HERIDOS: {punto.heridosAcompanantes}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.85em', color: '#666' }}>
                  PEATONES HERIDOS: {punto.heridosPeatones}
                </span>
              </div>
            </Popup> 
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}