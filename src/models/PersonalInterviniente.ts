export interface PersonalInterviniente {
  id?:number;
  nombre: string;
  jerarquia: string;
  observacion?: string;
}

export interface UnidadInterviniente {
  id?:number;
  unidad: string;
  personal: PersonalInterviniente[];
}