import { useMemo, useRef, useState } from "react";
import MapaJujuyHechosViales from "./MapaJujuyHechosViales";
import type { UbicacionPunto } from "../../models/UbicacionPunto";
import {
  listarHechosVialesAlcoholizados,
  listarHechosVialesMetricas,
  listarHechosVialesPorDia,
  listarHechosVialesPorTipoRodado,
  listarHechosVialesPorTurnos,
  listarHechosVialesUbicaciones,
  obtenerCantidadHechosVialesPorUnidadRegional,
  obtenerCantidadYPorcentajePorDepartamento,
  obtenerHechosVialesPorDepartamentoYTipoVia,
  obtenerCantidadYPorcentajePorRangoEdad,
  obtenerIndicadorUsoCascoMotocicletaVictimaFatal,
  obtenerIndicadorUsoSeguridadVehiculosNoMotoNiBicicletaVictimaFatal,
  obtenerPorcentajeGeneroPorFechas,
} from "../../services/HechoVialService";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LeyendaMapa from "./TablaLeyendaHechosViales";
import TablaMetricasSiniestros from "../modules/TablaMetricasHechosViales";
import type { MetricasSiniestralidad } from "../../models/Metricas";
import type { PorcentajeAlcoholizados } from "../../models/PorcentajeAlcoholizados";
import MetricaAlcohol from "../modules/MetricaAlcohol";
import { type TurnoData } from "../../models/TurnoData";
import GraficoTurnos from "../modules/GraficoTurnos";
import type { DiasCantidad } from "../../models/DiasCantidad";
import BarChart from "../../pages/ReportePorGrupoYPuesto";
import { RankingVehiculos } from "../modules/RankingVehiculos";
import { generarPDF } from "../../utilities/GenerarPdf";
import type { GeneroPorcentajeDto } from "../../models/GeneroPorcentajeDto";
import type { RangoEdadPorcentajeDto } from "../../models/RangoEdadPorcentajeDto";
import type { DepartamentoPorcentajeDto } from "../../models/DepartamentoPorcentajeDto";
import type { DepartamentoTipoViaDto } from "../../models/DepartamentoTipoViaDto";
import type { IndicadorPorcentajeDto } from "../../models/IndicadorPorcentajeDto";
import type { UnidadRegionalCantidadDto } from "../../models/UnidadRegionalCantidadDto";
import { TablaGenerica, type TablaColumna } from "../modules/TablaGenerica";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const hashHue = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
};

const hsla = (h: number, s: number, l: number, a: number) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

const formatPercent = (value: unknown) => {
  if (value === null || value === undefined) return "0%";
  if (typeof value === "number") return `${Number.isFinite(value) ? value : 0}%`;
  const trimmed = String(value).trim();
  if (!trimmed) return "0%";
  return trimmed.endsWith("%") ? trimmed : `${trimmed}%`;
};

const MapaJujuySource = () => {
  const [puntos, setPuntos] = useState<UbicacionPunto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metricas, setMetricas] = useState<MetricasSiniestralidad>();
  const [porcentajeAlcoholizados, setPorcentajeAlcoholizados] = useState<PorcentajeAlcoholizados>();
  const [turnos, setTurnos] = useState<TurnoData[]>();
  const [dias, setDias] = useState<DiasCantidad[]>();
  const [rodados, setRodados] = useState<DiasCantidad[]>();

  const [generos, setGeneros] = useState<GeneroPorcentajeDto[]>([]);
  const [rangosEdad, setRangosEdad] = useState<RangoEdadPorcentajeDto[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoPorcentajeDto[]>([]);
  const [departamentoTipoVia, setDepartamentoTipoVia] = useState<DepartamentoTipoViaDto[]>([]);
  const [indicadorCasco, setIndicadorCasco] = useState<IndicadorPorcentajeDto[]>([]);
  const [indicadorSeguridad, setIndicadorSeguridad] = useState<IndicadorPorcentajeDto[]>([]);
  const [unidadesRegionales, setUnidadesRegionales] = useState<UnidadRegionalCantidadDto[]>([]);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const reporteRef = useRef<HTMLDivElement>(null);

  const handleDescargarPDF = async () => {
    await generarPDF(reporteRef, { fechaInicio, fechaFin });
  };

  const labelsCantidad = useMemo(() => (dias ?? []).map((d) => d.dia), [dias]);
  const seriesCantidadPorDia = useMemo(
    () => [
      {
        label: "Cantidad por día",
        data: (dias ?? []).map((d) => d.cantidad),
      },
    ],
    [dias]
  );

  const generoChartData: ChartData<"doughnut", number[], string> = useMemo(() => {
    const labels = generos.map((g) => g.genero);
    const values = generos.map((g) => g.porcentaje);
    const baseHue = hashHue("genero-hechos-viales");
    const backgroundColor = labels.map((_, i) => hsla((baseHue + i * 52) % 360, 78, i % 2 === 0 ? 48 : 42, 0.75));
    const borderColor = backgroundColor.map((c) => c.replace(", 0.75)", ", 0.98)"));

    return {
      labels,
      datasets: [
        {
          label: "Porcentaje",
          data: values,
          backgroundColor,
          borderColor,
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  }, [generos]);

  const generoChartOptions: ChartOptions<"doughnut"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      animation: { duration: 900, easing: "easeOutQuart" },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 10,
            padding: 10,
            font: { size: 11 },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label ?? "";
              const percent = Number(context.parsed ?? 0).toFixed(1);
              const found = generos.find((g) => g.genero === label);
              const cantidad = found?.cantidad ?? 0;
              return `${label}: ${percent}% (${cantidad})`;
            },
          },
        },
      },
    }),
    [generos]
  );

  const labelsRangoEdad = useMemo(() => rangosEdad.map((r) => r.rangoEdad), [rangosEdad]);
  const seriesRangoEdad = useMemo(
    () => [
      {
        label: "Cantidad",
        data: rangosEdad.map((r) => r.cantidad),
        yAxisID: "y" as const,
      },
      {
        label: "Porcentaje",
        data: rangosEdad.map((r) => Number(r.porcentaje.toFixed(1))),
        yAxisID: "y1" as const,
      },
    ],
    [rangosEdad]
  );

  const columnsDepartamento = useMemo<TablaColumna<DepartamentoPorcentajeDto>[]>(
    () => [
      { header: "Departamento", render: (r) => r.departamento },
      { header: "Cantidad", align: "right", width: 110, render: (r) => r.cantidad },
      {
        header: "Porcentaje",
        align: "right",
        width: 120,
        render: (r) => `${Number(r.porcentaje).toFixed(1)}%`,
      },
    ],
    []
  );

  
  const columnsDepartamentoTipoVia = useMemo<TablaColumna<DepartamentoTipoViaDto>[]>(
    () => [
      { header: "Departamento", render: (r) => r.departamento },
      { header: "Ruta Nac.", align: "right", width: 110, render: (r) => r.rutaNacional },
      { header: "Ruta Prov.", align: "right", width: 120, render: (r) => r.rutaProvincial },
      { header: "Calle", align: "right", width: 90, render: (r) => r.calle },
      { header: "Avenida", align: "right", width: 110, render: (r) => r.avenida },
      { header: "Otro", align: "right", width: 90, render: (r) => r.otro },
      { header: "Total", align: "right", width: 90, render: (r) => r.total },
    ],
    []
  );
  const columnsIndicador = useMemo<TablaColumna<IndicadorPorcentajeDto>[]>(
    () => [
      { header: "Categoría", render: (r) => r.categoria },
      { header: "Valor", render: (r) => r.valor },
      { header: "Cantidad", align: "right", width: 110, render: (r) => r.cantidad },
      {
        header: "Porcentaje",
        align: "right",
        width: 120,
        render: (r) => formatPercent(r.porcentaje),
      },
    ],
    []
  );

  const columnsUnidadRegional = useMemo<TablaColumna<UnidadRegionalCantidadDto>[]>(
    () => [
      { header: "Unidad regional", render: (r) => r.unidadRegional },
      { header: "Cantidad", align: "right", width: 110, render: (r) => r.cantidad },
    ],
    []
  );

  const fetchData = async () => {
    if (!fechaInicio || !fechaFin) {
      setError("Debe seleccionar ambas fechas para realizar la consulta.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fInicio = fechaInicio.length === 16 ? `${fechaInicio}:00` : fechaInicio;
      const fFin = fechaFin.length === 16 ? `${fechaFin}:00` : fechaFin;

      const [
        ubicacionesRes,
        metricasRes,
        alcoholRes,
        turnosRes,
        diasRes,
        rodadosRes,
        generosRes,
        rangosRes,
        departamentosRes,
        deptoTipoViaRes,
        cascoRes,
        seguridadRes,
        unidadesRes,
      ] = await Promise.all([
        listarHechosVialesUbicaciones({
          fechaInicio: fInicio,
          fechaFin: fFin,
          soloLesionados: false,
        }),
        listarHechosVialesMetricas({ fechaInicio: fInicio, fechaFin: fFin }),
        listarHechosVialesAlcoholizados({ fechaInicio: fInicio, fechaFin: fFin }),
        listarHechosVialesPorTurnos({ fechaInicio: fInicio, fechaFin: fFin }),
        listarHechosVialesPorDia({ fechaInicio: fInicio, fechaFin: fFin }),
        listarHechosVialesPorTipoRodado({ fechaInicio: fInicio, fechaFin: fFin }),
        obtenerPorcentajeGeneroPorFechas({ fechaInicio: fInicio, fechaFin: fFin }),
        obtenerCantidadYPorcentajePorRangoEdad({ fechaInicio: fInicio, fechaFin: fFin }),
        obtenerCantidadYPorcentajePorDepartamento({ fechaInicio: fInicio, fechaFin: fFin }),
                obtenerHechosVialesPorDepartamentoYTipoVia({ fechaInicio: fInicio, fechaFin: fFin }),
        obtenerIndicadorUsoCascoMotocicletaVictimaFatal({ fechaInicio: fInicio, fechaFin: fFin }),
        obtenerIndicadorUsoSeguridadVehiculosNoMotoNiBicicletaVictimaFatal({ fechaInicio: fInicio, fechaFin: fFin }),
        obtenerCantidadHechosVialesPorUnidadRegional({ fechaInicio: fInicio, fechaFin: fFin }),
      ]);

      setPuntos(ubicacionesRes);
      setMetricas(metricasRes);
      setPorcentajeAlcoholizados(alcoholRes);
      setTurnos(turnosRes);
      setDias(diasRes);
      setRodados(rodadosRes);
      setGeneros(generosRes ?? []);
      setRangosEdad(rangosRes ?? []);
      setDepartamentos(departamentosRes ?? []);
      setDepartamentoTipoVia(deptoTipoViaRes ?? []);
      setIndicadorCasco(cascoRes ?? []);
      setIndicadorSeguridad(seguridadRes ?? []);
      setUnidadesRegionales(unidadesRes ?? []);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor. Verifique su conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
        Mapa de Siniestralidad Vial - Jujuy
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            label="Fecha y Hora Inicio"
            type="datetime-local"
            fullWidth
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Fecha y Hora Fin"
            type="datetime-local"
            fullWidth
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            onClick={fetchData}
            disabled={loading}
            sx={{ minWidth: "200px", height: "56px" }}
          >
            {loading ? "Cargando..." : "Consultar"}
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <LeyendaMapa />
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" color="secondary" startIcon={<PictureAsPdfIcon />} onClick={handleDescargarPDF}>
          Exportar Reporte PDF
        </Button>
      </Box>

      <div ref={reporteRef} style={{ padding: "20px", backgroundColor: "#fff" }}>
        <Paper elevation={4} sx={{ borderRadius: 2, overflow: "hidden", height: "500px" }}>
          <MapaJujuyHechosViales puntos={puntos} />
        </Paper>

        <Typography variant="caption" sx={{ mt: 1, display: "block", color: "text.secondary" }}>
          Puntos cargados actualmente: **{puntos.length}**
        </Typography>
        <Divider />

        {fechaInicio && fechaFin && (
          <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 }, backgroundColor: "#fdfdfd" }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, letterSpacing: 0.5 }}>
              Panel de Control de Siniestralidad
            </Typography>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <TablaMetricasSiniestros metricas={metricas!} />
              </Grid>

              <Grid size={{ xs: 12, lg: 8 }}>
                <RankingVehiculos datos={rodados!} />
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <MetricaAlcohol
                  porcentajeAlcoholizados={porcentajeAlcoholizados?.porcentajeAlcoholizados ?? 0}
                  totalAlcoholizados={porcentajeAlcoholizados?.totalAlcoholizados ?? 0}
                />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 0, overflow: "hidden" }}>
                  <GraficoTurnos datos={turnos!} />
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 0, overflow: "hidden" }}>
                  <BarChart series={seriesCantidadPorDia} labels={labelsCantidad} titulo="Distribución Semanal" height={320} />
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 0, overflow: "hidden" }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Distribución por género (%)
                  </Typography>
                  <Box
                    sx={{
                      height: { xs: 240, sm: 280, md: 320 },
                      width: "100%",
                      maxWidth: { xs: 360, sm: 420, md: 520 },
                      mx: "auto",
                    }}
                  >
                    <Doughnut data={generoChartData} options={generoChartOptions} />
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 0, overflow: "hidden" }}>
                  <BarChart series={seriesRangoEdad} labels={labelsRangoEdad} titulo="Rango de edad (cantidad y %)" height={320} />
                </Paper>
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <TablaGenerica
                  titulo="📍 Cantidad y porcentaje por departamento"
                  rows={departamentos}
                  columns={columnsDepartamento}
                  emptyText="Sin datos para el rango seleccionado"
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
                <TablaGenerica
                  titulo="🛣️ Hechos viales por departamento y tipo de vía"
                  rows={departamentoTipoVia}
                  columns={columnsDepartamentoTipoVia}
                  emptyText="Sin datos para el rango seleccionado"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <TablaGenerica
                  titulo="⛑️ Uso de casco (motocicleta) - víctima fatal"
                  rows={indicadorCasco}
                  columns={columnsIndicador}
                  emptyText="Sin datos para el rango seleccionado"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <TablaGenerica
                  titulo="🛡️ Uso de seguridad (no moto ni bicicleta) - víctima fatal"
                  rows={indicadorSeguridad}
                  columns={columnsIndicador}
                  emptyText="Sin datos para el rango seleccionado"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <TablaGenerica
                  titulo="🏢 Cantidad de hechos viales por unidad regional"
                  rows={unidadesRegionales}
                  columns={columnsUnidadRegional}
                  emptyText="Sin datos para el rango seleccionado"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </div>
    </Box>
  );
};

export default MapaJujuySource;




