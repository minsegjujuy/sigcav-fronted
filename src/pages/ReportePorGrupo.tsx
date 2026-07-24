import { useMemo, useState } from "react";
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Pie } from "react-chartjs-2";
import type { ActaGrupo } from "../models/ActaGrupo";
import type { ChartData, ChartOptions } from "chart.js";

const hashHue = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
};

const hsla = (h: number, s: number, l: number, a: number) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

interface ReportePorGrupoProps{
  actasCantidad: ActaGrupo[];
}

const ReportePorGrupo: React.FC<ReportePorGrupoProps> = ({actasCantidad}) => {
  //const [actasCantidad, setActasCantidad] = useState<ActaGrupo[]>([]);
  const [loading, ] = useState(false);
  const [error, ] = useState<string | null>(null);
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  /*useEffect(() => {
    if (!fechaInicio || !fechaFin) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await obtenerActasPorGrupo(fechaInicio, fechaFin);
        if (cancelled) return;
        setActasCantidad(res ?? []);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error("Error al obtener actas:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setActasCantidad([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [fechaInicio, fechaFin]);*/

  const labels = useMemo(() => actasCantidad.map((d) => `Grupo ${d.grupo}`), [actasCantidad]);
  const values = useMemo(() => actasCantidad.map((d) => d.cantidad), [actasCantidad]);

  const { backgroundColor, borderColor } = useMemo(() => {
    const baseHue = hashHue("torta-grupo");
    const bg = labels.map((_, i) => hsla((baseHue + i * 38) % 360, 78, i % 2 === 0 ? 50 : 44, 0.72));
    const br = bg.map((c) => c.replace(", 0.72)", ", 0.98)"));
    return { backgroundColor: bg, borderColor: br };
  }, [labels]);

  const data: ChartData<"pie", number[], string> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Actas",
          data: values,
          backgroundColor,
          borderColor,
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    }),
    [labels, values, backgroundColor, borderColor]
  );

  const options: ChartOptions<"pie"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: "easeOutQuart" },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 10,
            padding: 10,
            font: { size: isSmUp ? 12 : 11 },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label ?? "";
              const value = Number(context.parsed ?? 0);
              const total = values.reduce((s, v) => s + v, 0);
              const percent = total ? ((value / total) * 100).toFixed(1) : "0";
              return `${label}: ${value} actas (${percent}%)`;
            },
          },
        },
      },
    }),
    [values, isSmUp]
  );

  return (
    <Box sx={{ width: "100%", textAlign: "center" }}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ py: 2 }}>
          Error: {error}
        </Typography>
      )}

      {!loading && !error && actasCantidad.length === 0 && (
        <Typography sx={{ py: 2 }}>No hay actas para el rango seleccionado.</Typography>
      )}

      {!loading && !error && actasCantidad.length > 0 && (
        <Box sx={{ maxWidth: 620, margin: "0 auto" }}>
          <Typography variant="h6" gutterBottom>
            Total de actas realizadas en las diferentes guardias
          </Typography>
          <Box
            sx={{
              height: { xs: 220, sm: 260, md: 300 },
              width: "100%",
              maxWidth: { xs: 360, sm: 420, md: 520 },
              mx: "auto",
            }}
          >
            <Pie data={data} options={options} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ReportePorGrupo;


