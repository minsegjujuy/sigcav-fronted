import { useEffect, useState } from "react";
import type { RangoDeFechas } from "./ReportePorDia";
import { obtenerActasPorGrupo } from "../services/ActaService";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Pie } from "react-chartjs-2";
import type { ActaGrupo } from "../models/ActaGrupo";
import type { ChartData, ChartOptions } from "chart.js";


const defaultColors = [
  "rgba(245, 40, 145, 0.85)",
  "rgba(54, 162, 235, 0.85)",
  "rgba(255, 206, 86, 0.85)",
  "rgba(75, 192, 192, 0.85)",
  "rgba(153, 102, 255, 0.85)",
  "rgba(255, 99, 132, 0.85)",
  "rgba(255, 159, 64, 0.85)",
];

const ReportePorGrupo: React.FC<RangoDeFechas> = ({ fechaInicio, fechaFin }) => {
  const [actasCantidad, setActasCantidad] = useState<ActaGrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (fi: string, ff: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await obtenerActasPorGrupo(fi, ff); // debe devolver ActaGrupo[]
      setActasCantidad(res ?? []);
    } catch (err: any) {
      console.error("Error al obtener actas:", err);
      setError(err?.message ?? "Error desconocido");
      setActasCantidad([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fechaInicio || !fechaFin) return;
    fetchData(fechaInicio, fechaFin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin]);

  // Preparar datos del gráfico basados en actasCantidad
  const labels = actasCantidad.map((d) => `grupo ${d.grupo}`);
  const values = actasCantidad.map((d) => d.cantidad);

  // Generar colores según la cantidad de porciones (repite si hace falta)
  const backgroundColor = labels.map((_, i) => defaultColors[i % defaultColors.length]);
  const borderColor = backgroundColor.map((c) => c.replace("0.85", "1"));

  const data: ChartData<"pie", number[], string> = {
    labels,
    datasets: [
      {
        label: "Actas",
        data: values,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label ?? "";
            const value = context.formattedValue ?? "0";
            // calcular porcentaje
            const total = values.reduce((s, v) => s + v, 0);
            const percent = total ? ((Number(value) / total) * 100).toFixed(1) : "0";
            return `${label}: ${value} actas (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <Box sx={{ width: "90%", margin: "1rem auto", textAlign: "center" }}>

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
        <Box sx={{ maxWidth: 800, margin: "0 auto" }}>
          <Typography variant="h6" gutterBottom>
            Total de actas realizadas en las diferentes guardias
          </Typography>
          <Pie data={data} options={options} />
        </Box>
      )}
    </Box>
  );
};

export default ReportePorGrupo;