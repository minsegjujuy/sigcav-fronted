import { useMemo, useRef, useState, useTransition } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fade,
  Grow,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ReportePorDia from "./ReportePorDia";
import type { ParamsDate } from "../models/ParamsDate";
import ReporteInfracciones from "./ReporteInfracciones";
import ReportePorGrupo from "./ReportePorGrupo";
import BarChart from "./ReportePorGrupoYPuesto";
import type { GrupoInforme } from "../models/GrupoInforme";
import type { TipoInformeList } from "../models/TipoInformeList";
import type { DiasCantidad } from "../models/DiasCantidad";
import LineChart from "./LineChart";
import type { ReporteActas } from "../models/Reporte";
import { generarPDF } from "../utilities/GenerarPdf";
import type { ActaGrupo } from "../models/ActaGrupo";
import type { ArticuloCantidad } from "../models/ArticuloCantidad";
import { obtenerActasDashboard } from "../services/ActaService";

const Reporte: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState<Dayjs | null>(dayjs().startOf("day"));
  const [fechaFin, setFechaFin] = useState<Dayjs | null>(dayjs().startOf("day"));
  const [params, setParams] = useState<ParamsDate | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const [grupoInforme, setGrupoInforme] = useState<GrupoInforme[]>([]);
  const [tipoInforme, setTipoInforme] = useState<TipoInformeList[]>([]);
  const [porcentajeDiasInforme, setPorcentajeDiasInforme] = useState<DiasCantidad[]>([]);
  const [nacionalidad, setNacionalidad] = useState<ReporteActas[]>([]);
  const [jerarquia, setJerarquia] = useState<ReporteActas[]>([]);
  const [motivo, setMotivo] = useState<ReporteActas[]>([]);
  const [provincia, setProvincia] = useState<ReporteActas[]>([]);
  const [actasCantidadDias, setActasCantidadDias] = useState<DiasCantidad[]>([]);
  const [actasCantidadGrupo, setActasCantidadGrupo] = useState<ActaGrupo[]>([]);
  const [actasCantidadArticulo, setActasCantidadArticulo] = useState<ArticuloCantidad[]>([]);

  const contentRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const chartHeight = isMdUp ? 380 : isSmUp ? 320 : 240;

  const handleFilter = async () => {
    setFilterError(null);

    if (!fechaInicio || !fechaFin) {
      setFilterError("Seleccioná una fecha de inicio y una fecha de fin.");
      return;
    }

    if (fechaFin.isBefore(fechaInicio)) {
      setFilterError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    const fi = fechaInicio.format("YYYY-MM-DDTHH:mm:ssZ");
    const ff = fechaFin.format("YYYY-MM-DDTHH:mm:ssZ");

    setIsLoadingReport(true);
    try {
       const {
        grupos,
        articulos,
        dias,
        porcentajeDias,
        jerarquia,
        provincia,
        motivo,
        nacionalidad,
        cantidadGrupo,
        tipo,
      } = await obtenerActasDashboard(fi,ff);
      setGrupoInforme(grupos ?? []);
      setTipoInforme(tipo ?? []);
      setPorcentajeDiasInforme(porcentajeDias ?? []);
      setNacionalidad(nacionalidad ?? []);
      setJerarquia(jerarquia ?? []);
      setMotivo(motivo ?? []);
      setProvincia(provincia ?? []);
      setActasCantidadDias(dias ?? []);
      setActasCantidadGrupo(cantidadGrupo ?? []);
      setActasCantidadArticulo(articulos ?? []);
      setParams({ fechaInicio: fi, fechaFin: ff });
    } catch (error) {
      console.error("Error al cargar el informe:", error);
      setFilterError("No se pudo cargar el informe. Probá nuevamente.");
    } finally {
      setIsLoadingReport(false);
    }
  };

  // grupos
  const labelsGrupoInformes = grupoInforme.map((item) => item.puesto);
  const gruposIds = grupoInforme[0]?.grupos.map((g) => g.idGrupo) ?? [];
  const seriesGruposPorPuesto = gruposIds.map((id) => ({
    label: `Grupo ${id}`,
    data: grupoInforme.map((p) => {
      const item = p.grupos.find((g) => g.idGrupo === id);
      return item ? item.totalActas : 0;
    }),
  }));

  // tipo acta
  const labelsTipoInformes = tipoInforme.map((item) => item.puesto);
  const tiposIds = tipoInforme[0]?.grupos.map((g) => g.tipo) ?? [];
  const seriesTiposPorPuesto = tiposIds.map((tipo) => ({
    label: `Tipo de acta ${tipo}`,
    data: tipoInforme.map((p) => {
      const item = p.grupos.find((g) => g.tipo === tipo);
      return item ? item.totalActas : 0;
    }),
  }));

  // porcentaje de actas por día
  const labelsPorcentajes = porcentajeDiasInforme.map((d) => d.dia);
  const seriesPorcentajes = [
    {
      label: "Porcentaje por día",
      data: porcentajeDiasInforme.map((d) => d.cantidad),
    },
  ];

  // actas por jerarquía
  const labelsJerarquia = jerarquia.map((d) => d.titulo);
  const seriesJerarquia = [
    {
      label: "Jerarquía",
      data: jerarquia.map((j) => j.totalActas),
    },
  ];

  // actas por observación
  const labelsObservacion = motivo.map((m) => m.titulo);
  const seriesObservacion = [
    {
      label: "Observación",
      data: motivo.map((m) => m.totalActas),
    },
  ];

  // actas por provincia
  const labelsProvincia = provincia.map((p) => p.titulo);
  const seriesProvincia = [
    {
      label: "Provincia",
      data: provincia.map((p) => p.totalActas),
    },
  ];

  // actas por nacionalidad
  const labelsNacionalidad = nacionalidad.map((p) => p.titulo);
  const seriesNacionalidad = [
    {
      label: "Nacionalidad",
      data: nacionalidad.map((p) => p.totalActas),
    },
  ];

  const handleGenerarPdf = (p: ParamsDate) => {
    startTransition(() => {
      generarPDF(contentRef, p);
    });
  };

  const cardSx = useMemo(
    () => ({
      p: { xs: 2, md: 2.5 },
      borderRadius: 2,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      transition: "transform 180ms ease, box-shadow 180ms ease",
      minWidth: 0,
      overflow: "hidden",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
      },
    }),
    [theme.palette.divider]
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "360px 1fr" },
        gap: 2,
        alignItems: "start",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2,
          position: { lg: "sticky" },
          top: { lg: 16 },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Seleccionar rango de fechas</Typography>

            <DatePicker
              label="Fecha inicio"
              format="DD-MM-YYYY HH:mm:ss"
              value={fechaInicio}
              onChange={(newValue) => setFechaInicio(newValue ? newValue.startOf("day") : null)}
              slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
            />

            <DatePicker
              label="Fecha fin"
              format="DD-MM-YYYY HH:mm:ss"
              value={fechaFin}
              onChange={(newValue) => setFechaFin(newValue ? newValue.startOf("day") : null)}
              slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
            />

            <Button
              variant="contained"
              onClick={handleFilter}
              disabled={isLoadingReport}
              sx={{ py: 1.1, borderRadius: 2, textTransform: "none" }}
            >
              {isLoadingReport ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress color="inherit" size={18} />
                  Cargando informe...
                </Box>
              ) : (
                "Ver informe"
              )}
            </Button>

            {filterError && <Alert severity="warning">{filterError}</Alert>}

            <Fade in={Boolean(params)} timeout={300} unmountOnExit>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="outlined"
                  onClick={() => params && handleGenerarPdf(params)}
                  disabled={isPending || !params}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    justifyContent: "space-between",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    Generar PDF
                    {isPending && (
                      <CircularProgress color="primary" size={18} thickness={5} />
                    )}
                  </Box>
                </Button>
                <Typography variant="caption" color="text.secondary">
                  El PDF se genera con los gráficos y tablas visibles.
                </Typography>
              </Box>
            </Fade>
          </Box>
        </LocalizationProvider>
      </Paper>

      <Box sx={{ minWidth: 0 }}>
        {params ? (
          <Fade in timeout={450}>
            <Box ref={contentRef} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Grow in timeout={420}>
                <Paper sx={cardSx}>
                  <ReportePorDia actasCantidad={actasCantidadDias} />
                </Paper>
              </Grow>

              <Grow in timeout={540}>
                <Paper sx={cardSx}>
                  <ReporteInfracciones
                    actasCantidad={actasCantidadArticulo}
                  />
                </Paper>
              </Grow>

              <Grow in timeout={660}>
                <Paper sx={cardSx}>
                  <ReportePorGrupo actasCantidad={actasCantidadGrupo} />
                </Paper>
              </Grow>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                  minWidth: 0,
                }}
              >
                <Grow in timeout={780}>
                  <Paper sx={{ ...cardSx, gridColumn: { md: "1 / -1" } }}>
                    <BarChart
                      titulo="PORCENTAJE DE ACTAS REALIZADAS EN LAS DIFERENTES GUARDIAS"
                      labels={labelsGrupoInformes}
                      series={seriesGruposPorPuesto}
                      height={chartHeight}
                      colors={{
                        background: [
                          "rgba(2, 132, 199, 0.42)",
                          "rgba(16, 185, 129, 0.42)",
                          "rgba(245, 158, 11, 0.42)",
                          "rgba(139, 92, 246, 0.42)",
                        ],
                        border: [
                          "rgba(2, 132, 199, 1)",
                          "rgba(16, 185, 129, 1)",
                          "rgba(245, 158, 11, 1)",
                          "rgba(139, 92, 246, 1)",
                        ],
                      }}
                    />
                  </Paper>
                </Grow>

                <Grow in timeout={900}>
                  <Paper sx={{ ...cardSx, gridColumn: { md: "1 / -1" } }}>
                    <BarChart
                      titulo="CANTIDAD DE ACTAS SERIE B/PDA"
                      labels={labelsTipoInformes}
                      series={seriesTiposPorPuesto}
                      height={chartHeight}
                      colors={{
                        background: [
                          "rgba(244, 63, 94, 0.35)",
                          "rgba(59, 130, 246, 0.35)",
                          "rgba(34, 197, 94, 0.35)",
                          "rgba(234, 179, 8, 0.35)",
                        ],
                        border: [
                          "rgba(244, 63, 94, 1)",
                          "rgba(59, 130, 246, 1)",
                          "rgba(34, 197, 94, 1)",
                          "rgba(234, 179, 8, 1)",
                        ],
                      }}
                    />
                  </Paper>
                </Grow>

                <Grow in timeout={1020}>
                  <Paper sx={cardSx}>
                    <LineChart
                      titulo="PORCENTAJE DE ACTAS POR DÍA"
                      labels={labelsPorcentajes}
                      series={seriesPorcentajes}
                      height={chartHeight}
                      colors={[
                        "rgba(14, 165, 233, 1)",
                        "rgba(99, 102, 241, 1)",
                        "rgba(34, 197, 94, 1)",
                      ]}
                    />
                  </Paper>
                </Grow>

                <Grow in timeout={1140}>
                  <Paper sx={cardSx}>
                    <BarChart
                      titulo="CANTIDAD DE ACTAS REALIZADAS POR JERARQUÍA"
                      labels={labelsJerarquia}
                      series={seriesJerarquia}
                      height={chartHeight}
                      colors={{
                        background: [
                          "rgba(168, 85, 247, 0.35)",
                          "rgba(236, 72, 153, 0.35)",
                          "rgba(245, 158, 11, 0.35)",
                        ],
                        border: [
                          "rgba(168, 85, 247, 1)",
                          "rgba(236, 72, 153, 1)",
                          "rgba(245, 158, 11, 1)",
                        ],
                      }}
                    />
                  </Paper>
                </Grow>

                <Grow in timeout={1260}>
                  <Paper sx={cardSx}>
                    <BarChart
                      titulo="RESUMEN DE ACTAS POR CATEGORÍA DE EVENTO"
                      labels={labelsObservacion}
                      series={seriesObservacion}
                      height={chartHeight}
                      colors={{
                        background: [
                          "rgba(6, 182, 212, 0.35)",
                          "rgba(37, 99, 235, 0.35)",
                          "rgba(148, 163, 184, 0.35)",
                        ],
                        border: [
                          "rgba(6, 182, 212, 1)",
                          "rgba(37, 99, 235, 1)",
                          "rgba(148, 163, 184, 1)",
                        ],
                      }}
                    />
                  </Paper>
                </Grow>

                <Grow in timeout={1380}>
                  <Paper sx={cardSx}>
                    <BarChart
                      titulo="CLASIFICACIÓN DE INFRACTORES POR PROVINCIA"
                      labels={labelsProvincia}
                      series={seriesProvincia}
                      height={chartHeight}
                      colors={{
                        background: [
                          "rgba(16, 185, 129, 0.35)",
                          "rgba(20, 184, 166, 0.35)",
                          "rgba(94, 234, 212, 0.35)",
                        ],
                        border: [
                          "rgba(16, 185, 129, 1)",
                          "rgba(20, 184, 166, 1)",
                          "rgba(94, 234, 212, 1)",
                        ],
                      }}
                    />
                  </Paper>
                </Grow>

                <Grow in timeout={1500}>
                  <Paper sx={cardSx}>
                    <BarChart
                      titulo="CLASIFICACIÓN DE INFRACTORES POR NACIONALIDAD"
                      labels={labelsNacionalidad}
                      series={seriesNacionalidad}
                      height={chartHeight}
                      colors={{
                        background: [
                          "rgba(245, 158, 11, 0.35)",
                          "rgba(249, 115, 22, 0.35)",
                          "rgba(239, 68, 68, 0.35)",
                        ],
                        border: [
                          "rgba(245, 158, 11, 1)",
                          "rgba(249, 115, 22, 1)",
                          "rgba(239, 68, 68, 1)",
                        ],
                      }}
                    />
                  </Paper>
                </Grow>
              </Box>
            </Box>
          </Fade>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography color="text.secondary">
              No se ha seleccionado ningún rango de fechas.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Reporte;
