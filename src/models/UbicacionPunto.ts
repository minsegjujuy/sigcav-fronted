// Definimos la interfaz para los puntos que recibe el componente
export interface UbicacionPunto {
  lat: number;
  lng: number;
  danosMateriales: string;
  victimaFatal: string;
  sintesis: string;
  heridosProtagonistas: number;
  heridosAcompanantes: number;
  color: string; // El color viene definido desde la prop
}