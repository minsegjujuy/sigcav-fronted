import type { Localidad } from "./Localidad";

export interface Departamento{
    idDep: number;
    nombre: string;
    localidades: Localidad[]
}