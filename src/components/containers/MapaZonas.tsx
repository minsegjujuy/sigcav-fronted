import {
  FeatureGroup,
  MapContainer,
  TileLayer,
  GeoJSON,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import jujuyGeoJson from "../../assets/geo/JUJUY.json";

export default function MapaZonas() {
  function onCreated(e: any) {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();

    console.log("🧱 Polígono creado:", geojson);
  }

  return (
    <MapContainer
      center={[-24.2, -65.3]}
      zoom={7}
      style={{ height: 400, width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🟦 LÍMITE DE LA PROVINCIA DE JUJUY */}
      <GeoJSON
        data={jujuyGeoJson as any}
        style={{
          color: "#1e40af",     // azul
          weight: 2,
          fillColor: "#60a5fa",
          fillOpacity: 0.1,
        }}
      />

      {/* ✏️ ZONA DE DIBUJO */}
      <FeatureGroup>
        <EditControl
          position="topright"
          draw={{
            rectangle: false,
            circle: false,
            polyline: false,
            marker: false,
            circlemarker: false,
          }}
          onCreated={onCreated}
        />
      </FeatureGroup>
    </MapContainer>
  );
}

