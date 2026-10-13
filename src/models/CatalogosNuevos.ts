export interface CatalogoNuevoDto {
  provincias: ProvinciaDto[];
  departamentos: DepartamentoDto[];
  localidades: LocalidadDto[];
  tiposVehiculo: TipoVehiculoDto[];
  marcas: MarcaDto[];
  modelos: ModeloDto[];
  tiposDocumento: TipoDocumentoDto[];
  paises: PaisDto[];
  destacamentos: DestacamentoDto[];
}

export interface ProvinciaDto {
  idProvincia: number;
  nombre: string;
  idPais: number;
}

export interface DepartamentoDto {
  idDepartamento: number;
  nombre: string;
  idProvincia: number;
}

export interface LocalidadDto {
  idLocalidad: number;
  nombre: string;
  idDepartamento: number;
}

export interface TipoVehiculoDto {
  idTipoVehiculo: number;
  nombre: string;
}

export interface MarcaDto {
  idMarca: number;
  nombre: string;
  idTipoVehiculo: number;
}

export interface ModeloDto {
  idModelo: number;
  nombre: string;
  idMarca: number;
}

export interface TipoDocumentoDto {
  idTipoDocumento: number;
  nombre: string;
}

export interface PaisDto {
  idPais: number;
  nombre: string;
}

export interface DestacamentoDto {
  idDestacamento: number;
  nombre: string;
}