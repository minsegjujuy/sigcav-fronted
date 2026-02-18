export interface Juzgado {
    id?: number;      // El '?' indica que es opcional (útil al crear nuevos sin ID)
    nombre: string;
    direccion: string;
}