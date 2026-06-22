import type { ActaGrupo } from "./ActaGrupo";
import type { ArticuloCantidad } from "./ArticuloCantidad";
import type { DiasCantidad } from "./DiasCantidad";
import type { GrupoInforme } from "./GrupoInforme";
import type { TipoInformeList } from "./TipoInformeList";
import type { ReporteActas } from "./Reporte";

export interface DashboardActas {
  grupos: GrupoInforme[];
  articulos: ArticuloCantidad[];
  dias: DiasCantidad[];
  porcentajeDias: DiasCantidad[];
  jerarquia: ReporteActas[];
  provincia: ReporteActas[];
  motivo: ReporteActas[];
  nacionalidad: ReporteActas[];
  cantidadGrupo: ActaGrupo[];
  tipo: TipoInformeList[];
}