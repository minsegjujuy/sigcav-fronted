import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  useMapEvents,
} from "react-leaflet";
import { useState } from "react";
import jujuyGeoJson from "../../assets/geo/JUJUY.json";
import { findDepartamento } from "./findDepartamento";
import departamentosGeoJson from "../../assets/geo/DEPARTAMENTOS-JUJUY.json";
import type { UbicacionRequest } from "../../models/UbicacionRequest";

export interface PointWithDepartamento {
  lat: number;
  lng: number;
  departamento: string;
}


function ClickHandler({
  onValidClick,
}: {
  onValidClick: (data: PointWithDepartamento) => void;
}) {
  useMapEvents({
    click(e) {
      const departamento = findDepartamento(
        e.latlng.lat,
        e.latlng.lng,
        departamentosGeoJson
      );

      if (!departamento) return;

      onValidClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        departamento,
      });
    },
  });

  return null;
}


export default function MapaJujuy({onSelect,}: {onSelect: (point: UbicacionRequest) => void;}) {
  const [point, setPoint] = useState<UbicacionRequest | null>(null);

  return (
    <>
      <MapContainer
        center={[-24.2, -65.3]}
        zoom={7}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Límite real de Jujuy */}
        <GeoJSON
          data={jujuyGeoJson as any}
          style={{
            color: "blue",
            weight: 2,
            fillOpacity: 0.1,
          }}
        />

        <ClickHandler
            onValidClick={(p) => {
            setPoint(p);     // marcador visual
            onSelect(p);     // envío al formulario
            }}
        />

        {point && <Marker position={point} />}
      </MapContainer>

      <div style={{ marginTop: 10 }}>
        {point ? (
          <>
            <strong>Coordenadas válidas:</strong>
            <div>Lat: {point.lat.toFixed(6)}</div>
            <div>Lng: {point.lng.toFixed(6)}</div>
            <div>
            <strong>Departamento:</strong> {point.departamento}
            </div>
          </>
        ) : (
          <em>Seleccioná un punto dentro de Jujuy</em>
        )}
      </div>
    </>
  );
}

