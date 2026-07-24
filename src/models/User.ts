export interface Jerarquia {
  idJer: number;
  nombre: string;
}

export interface Role {
  id: number;
  nombre: string;
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

export interface Usuario {
  idUser?: number;
  username: string;
  email?: string;
  dni: string;
  nombreCompleto: string;
  password?: string;
  nameRaw?: string;
  jerarquia: number;
  role: number;
  registroDiario: boolean;
  enabled: boolean;
  resetVerify: boolean;
}

export const usuarioInitialState: Usuario = {
  username: "",
  email: "",
  dni: "",
  nombreCompleto: "",
  password: "",
  nameRaw: "",
  jerarquia: 0,
  role: 0,
  registroDiario: false,
  enabled: true,
  resetVerify: false
};