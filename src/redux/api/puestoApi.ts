import type { Articulo } from '../../models/Articulo';
import type { Grupo } from '../../models/Grupo';
import type { Juzgado } from '../../models/Juzgado';
import type { Ley } from '../../models/Ley';
import type { Puesto } from '../../models/Puesto';
import type { Tipo } from '../../models/Tipo';
import type { Jerarquia, Role } from '../../models/User';
import { baseApi } from './baseApi';

export const brandApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPuestos: builder.query<Puesto[], void>({
            query: () => '/puesto',
            keepUnusedDataFor: 1800,
            providesTags: ['Puestos']
        }),
        getjuzgados: builder.query<Juzgado[], void>({
            query: () => '/juzgados/actas',
            keepUnusedDataFor: 1800,
            providesTags: ['Juzgados']
        }),
        getGrupos: builder.query<Grupo[], void>({
            query: () => '/grupo',
            keepUnusedDataFor: Infinity,
            providesTags: ['Grupos']
        }),
        getTipos: builder.query<Tipo[], void>({
            query: () => '/tipo-actas',
            keepUnusedDataFor: 1800,
            providesTags: ['TiposActa']
        }),
        getLeyes: builder.query<Ley[], void>({
            query: () => '/ley',
            keepUnusedDataFor: 1800,
            providesTags: ['Leyes']
        }),
        getArticulos: builder.query<Articulo[], void>({
            query: () => '/articulo/',
            keepUnusedDataFor: 1800,
            providesTags: ['Articulos']
        }),
        getJerarquias: builder.query<Jerarquia[], void>({
            query: () => '/jerarquia/',
            keepUnusedDataFor: 1800,
            providesTags: ['Jerarquias']
        }),
        getRoles: builder.query<Role[], void>({
            query: () => '/role/',
            keepUnusedDataFor: 1800,
            providesTags: ['Roles']
        }),
    })
});

export const {
    useGetPuestosQuery,
    useGetGruposQuery,
    useGetjuzgadosQuery,
    useGetLeyesQuery,
    useGetTiposQuery,
    useGetArticulosQuery,
    useGetJerarquiasQuery,
    useGetRolesQuery
} = brandApi;