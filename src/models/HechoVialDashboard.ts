import type { UbicacionPunto } from "../models/UbicacionPunto";
import type { MetricasSiniestralidad } from "../models/Metricas";
import type { PorcentajeAlcoholizados } from "../models/PorcentajeAlcoholizados";
import type { TurnoData } from "../models/TurnoData";
import type { DiasCantidad } from "../models/DiasCantidad";
import type { GeneroPorcentajeDto } from "../models/GeneroPorcentajeDto";
import type { RangoEdadPorcentajeDto } from "../models/RangoEdadPorcentajeDto";
import type { DepartamentoPorcentajeDto } from "../models/DepartamentoPorcentajeDto";
import type { IndicadorPorcentajeDto } from "../models/IndicadorPorcentajeDto";
import type { UnidadRegionalCantidadDto } from "../models/UnidadRegionalCantidadDto";
import type { DepartamentoTipoViaDto } from "../models/DepartamentoTipoViaDto";

export interface HechoVialDashboard {
  porcentajeAlcoholizados: PorcentajeAlcoholizados;
  puntos: UbicacionPunto[];
  turnos: TurnoData[];
  dias: DiasCantidad[];
  tipoRodado: DiasCantidad[];
  metricas: MetricasSiniestralidad;
  generos: GeneroPorcentajeDto[];
  rangoEdad: RangoEdadPorcentajeDto[];
  porcentajedepartamentos: DepartamentoPorcentajeDto[];
  usoCasco: IndicadorPorcentajeDto[];
  usoCinturon: IndicadorPorcentajeDto[];
  unidadRegional: UnidadRegionalCantidadDto[];
  departamentoYTipoVia: DepartamentoTipoViaDto[];
}