import type { CatalogoNuevoDto, ModeloDto } from "../../models/CatalogosNuevos";
import { baseApi } from "./baseApi";

const getCatalogId = (item: object, ...keys: string[]): number => {
    const record = item as Record<string, unknown>;
    const value = keys.map((key) => record[key]).find((candidate) => candidate !== null && candidate !== undefined);
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeCatalogos = (catalogos: CatalogoNuevoDto): CatalogoNuevoDto => ({
    ...catalogos,
    paises: (catalogos.paises ?? []).map((pais) => ({
        ...pais,
        idPais: getCatalogId(pais, "idPais", "id_pais"),
    })),
    provincias: (catalogos.provincias ?? []).map((provincia) => ({
        ...provincia,
        idProvincia: getCatalogId(provincia, "idProvincia", "id_provincia", "idProvinciaCatalogo", "id_provincia_catalogo"),
        idPais: getCatalogId(provincia, "idPais", "id_pais", "idPaisCatalogo", "id_pais_catalogo"),
    })),
    departamentos: (catalogos.departamentos ?? []).map((departamento) => ({
        ...departamento,
        idDepartamento: getCatalogId(departamento, "idDepartamento", "id_departamento", "idDepartamentoCatalogo", "id_departamento_catalogo"),
        idProvincia: getCatalogId(departamento, "idProvincia", "id_provincia", "idProvinciaCatalogo", "id_provincia_catalogo"),
    })),
    localidades: (catalogos.localidades ?? []).map((localidad) => ({
        ...localidad,
        idLocalidad: getCatalogId(localidad, "idLocalidad", "id_localidad", "idLocalidadCatalogo", "id_localidad_catalogo"),
        idDepartamento: getCatalogId(localidad, "idDepartamento", "id_departamento", "idDepartamentoCatalogo", "id_departamento_catalogo"),
    })),
    tiposVehiculo: (catalogos.tiposVehiculo ?? []).map((tipoVehiculo) => ({
        ...tipoVehiculo,
        idTipoVehiculo: getCatalogId(
            tipoVehiculo,
            "idTipoVehiculo",
            "id_tipovehiculo",
            "id_tipo_vehiculo",
        ),
    })),
    marcas: (catalogos.marcas ?? []).map((marca) => ({
        ...marca,
        idMarca: getCatalogId(marca, "idMarca", "id_marca"),
        idTipoVehiculo: getCatalogId(
            marca,
            "idTipoVehiculo",
            "id_tipovehiculo",
            "id_tipo_vehiculo",
        ),
    })),
    tiposDocumento: (catalogos.tiposDocumento ?? []).map((tipoDocumento) => ({
        ...tipoDocumento,
        idTipoDocumento: getCatalogId(tipoDocumento, "idTipoDocumento", "id_tipo_documento"),
    })),
    destacamentos: (catalogos.destacamentos ?? []).map((destacamento) => ({
        ...destacamento,
        idDestacamento: getCatalogId(destacamento, "idDestacamento", "id_destacamento"),
    })),
});

export const catalogoApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCatalogos: builder.query<CatalogoNuevoDto, void>({
            query: () => '/catalogos/nuevo',
            transformResponse: normalizeCatalogos,
            keepUnusedDataFor: 1800,
            providesTags: ['Catalogos']
        }),
        getModelos: builder.query<ModeloDto[], void>({
            query: () => '/catalogos/nuevo/modelos',
            transformResponse: (modelos: ModeloDto[]) =>
                (modelos ?? []).map((modelo) => ({
                    ...modelo,
                    idModelo: getCatalogId(modelo, "idModelo", "id_modelo"),
                    idMarca: getCatalogId(modelo, "idMarca", "id_marca"),
                })),
            keepUnusedDataFor: 1800,
            providesTags: ['Modelos']
        }),
    })
});

export const {
    useGetCatalogosQuery,
    useGetModelosQuery
} = catalogoApi;
