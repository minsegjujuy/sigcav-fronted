export interface Licencia {
  id?: number; // Opcional porque al crearla aún no tiene ID
  numero: string;
  clase: string;
  autoridadExpedicion?: string;
  fechaExpedicion?: string; // Formato YYYY-MM-DD
  fechaVencimiento: string; // Formato YYYY-MM-DD
}