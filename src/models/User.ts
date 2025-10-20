export interface Jerarquia {
  idJer: number;
  nombreJerarquia: string;
}

export interface Role {
  idRol: number;
  name: string;
  description?: string;
}

export interface User {
  idUser: number;
  username: string;
  email?: string | null;
  dni: string;
  nombreCompleto: string;
  password?: string | null;
  nameRaw?: string | null;
  jerarquia: Jerarquia;
  role: Role;
}