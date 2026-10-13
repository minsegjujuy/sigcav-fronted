import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import jujuyGeoJson from "../../assets/geo/JUJUY.json";
import { findDepartamento } from "./findDepartamento";
import type { UbicacionRequest } from "../../models/UbicacionRequest";
import customMarkerIcon from '../../assets/marcador.svg';
import L from 'leaflet';

const myIcon = L.icon({
  iconUrl: customMarkerIcon,
  iconSize: [38, 38], // tamaÃ±o del icono
  iconAnchor: [19, 38], // punto del icono que corresponderÃ¡ a la ubicaciÃ³n del marcador
  popupAnchor: [0, -38] // punto desde donde se abrirÃ¡ el popup
});

// Define el tipo para el valor inicial
interface MapaJujuyProps {
  onSelect: (point: UbicacionRequest) => void;
  initialValue?: UbicacionRequest | null; // Prop opcional
}

export interface PointWithDepartamento {
  lat: number;
  lng: number;
  departamento: string;
}

async function loadDepartamentos() {
  const res = await fetch("/geo/DEPARTAMENTOS-JUJUY.json");
  return res.json();
}

function ClickHandler({
  onValidClick,
}: {
  onValidClick: (data: PointWithDepartamento) => void;
}) {
    const [departamentos, setDepartamentos] = useState<any>(null);

    useEffect(() => {
    loadDepartamentos().then(setDepartamentos);
    }, []);

  useMapEvents({
    click(e) {
      const departamento = findDepartamento(
        e.latlng.lat,
        e.latlng.lng,
        departamentos
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


export default function MapaJujuy({ onSelect, initialValue }: MapaJujuyProps) {
  // Inicializamos el estado con el valor que viene por prop
  const [point, setPoint] = useState<UbicacionRequest | null>(initialValue || null);
  useEffect(() => {
    setPoint(initialValue || null);
  }, [initialValue?.lat, initialValue?.lng, initialValue?.departamento]);

  const Recenter = ({ value }: { value: UbicacionRequest | null }) => {
    const map = useMap();

    useEffect(() => {
      if (!value) return;
      map.setView([value.lat, value.lng], 12);
    }, [map, value?.lat, value?.lng]);

    return null;
  };

  return (
    <>
      <MapContainer
        // Si tienes un punto inicial, podrÃ­as querer centrar el mapa ahÃ­
        center={point ? [point.lat, point.lng] : [-24.2, -65.3]}
        zoom={point ? 12 : 7} 
        style={{ height: "400px", width: "100%" }}
      >
        <Recenter value={point} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          data={jujuyGeoJson as any}
          style={{ color: "blue", weight: 2, fillOpacity: 0.1 }}
        />

        <ClickHandler
          onValidClick={(p) => {
            const next: UbicacionRequest = {
              ...p,
              descripcion: "",
              unidadRegional: undefined,
              localidad: undefined,
              idProvinciaCatalogo: 0,
              idDepartamentoCatalogo: 0,
              idLocalidadCatalogo: 0,
            };
            setPoint(next);
            onSelect(next);
          }}
        />

        {/* El marcador se renderiza si hay un punto (ya sea inicial o clickeado) */}
        {point && <Marker position={[point.lat, point.lng]} icon={myIcon} />}
      </MapContainer>

      <div style={{ marginTop: 10 }}>
        {point ? (
          <>
            <strong>Ubicacion seleccionada:</strong>
            <div>Lat: {point.lat.toFixed(6)} | Lng: {point.lng.toFixed(6)}</div>
            <div><strong>Departamento:</strong> {point.departamento}</div>
          </>
        ) : (
          <em>Selecciona un punto dentro de Jujuy</em>
        )}
      </div>
    </>
  );
}


