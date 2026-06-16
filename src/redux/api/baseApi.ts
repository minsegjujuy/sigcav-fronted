import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAccessToken } from '../../utilities/tokenStore';

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: headers => {
        const token = getAccessToken();

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
        }
    }),

    tagTypes: [
        'Puestos',
        'Grupos',
        'TiposActa',
        'Juzgados',
        'Leyes'
    ],

    endpoints: () => ({})
});