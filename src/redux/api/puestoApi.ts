import type { Grupo } from '../../models/Grupo';
import type { Juzgado } from '../../models/Juzgado';
import type { Ley } from '../../models/Ley';
import type { Puesto } from '../../models/Puesto';
import type { Tipo } from '../../models/Tipo';
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
            keepUnusedDataFor: Infinity,
            providesTags: ['Juzgados']
        }),
        getGrupos: builder.query<Grupo[], void>({
            query: () => '/grupo',
            keepUnusedDataFor: Infinity,
            providesTags: ['Grupos']
        }),
        getTipos: builder.query<Tipo[], void>({
            query: () => '/tipo-actas',
            keepUnusedDataFor: Infinity,
            providesTags: ['TiposActa']
        }),
        getLeyes: builder.query<Ley[], void>({
            query: () => '/ley',
            keepUnusedDataFor: Infinity,
            providesTags: ['Leyes']
        }),
    })
});

export const {
    useGetPuestosQuery,
    useGetGruposQuery,
    useGetjuzgadosQuery,
    useGetLeyesQuery,
    useGetTiposQuery
} = brandApi;