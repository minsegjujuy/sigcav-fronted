import { getAuthHeader } from "../utilities/getAuthHeader";
import type { UserFilter } from "../models/UserFilter";
import api from "../interceptors/axios.interceptors";
import type { PageResponse } from "../models/PageResponse";
import type { Usuario } from "../models/User";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/usuario`;

export interface UsuarioListParams {
  page?: number;
  size?: number;
  sort?: string;
  username?: string;
}

export const findUsersByNombreOrDni = async (term: string): Promise<UserFilter[]> => {
  const response = await api.get<UserFilter[]>(`${baseURL}/${term}`, getAuthHeader());
  return response.data;
};

export async function listarUsuarios({
  page = 0,
  size = 10,
  sort = "username,asc",
  username = "",
}: UsuarioListParams): Promise<PageResponse<Usuario>> {
  const response = await api.get<PageResponse<Usuario>>(
    `${baseURL}/listar`,
    {
      params: {
        page,
        size,
        sort,
        username: username.trim() || undefined,
      },
    },
  );

  return response.data;
}

export async function eliminarUsuario(idUser: number): Promise<void> {
  await api.delete(`${baseURL}/eliminar/${idUser}`);
}

export async function crearUsuario(
  usuario: Usuario,
): Promise<Usuario> {
  const response = await api.post<Usuario>(
    `${baseURL}/crear`,
    usuario,
  );

  return response.data;
}

export async function modificarUsuario(
  usuario: Usuario,
): Promise<Usuario> {
  const response = await api.put<Usuario>(
    `${baseURL}/modificar`,
    usuario,
  );

  return response.data;
}