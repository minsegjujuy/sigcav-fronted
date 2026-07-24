export interface ActaSalienteDetalleRequest {
    id?: number;
    nroActa: string;
    fechaActa: Date | string; // LocalDateTime en Java
    articulado: string;
    tipo: string;
    actaId?: number; // Opcional, por si vinculas a una existente
}
