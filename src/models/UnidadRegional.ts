import type { Departamento } from "./Departamento"

export interface UnidadRegional {
    idUr: number,
    nombre: string,
    departamentos: Departamento[],
}