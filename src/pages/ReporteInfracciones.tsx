import { useEffect, useState } from "react";
import type { RangoDeFechas } from "./ReportePorDia";
import type { ArticuloCantidad } from "../models/ArticuloCantidad";
import { obtenerActasPorArticulo } from "../services/ActaService";
import { Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";

const ReporteInfracciones: React.FC<RangoDeFechas> = ({ fechaInicio, fechaFin }) => {
  const [actasCantidad, setActasCantidad] = useState<ArticuloCantidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (fi: string, ff: string) => {
    try {
      setLoading(true);
      setError(null);
      // Si tu API espera null en vez de "", deberías adaptarlo.
      const res = await obtenerActasPorArticulo(fi, ff); // se asume que retorna DiasCantidad[]
      setActasCantidad(res);
    } catch (err: any) {
      console.error("Error al obtener actas:", err);
      setError(err?.message ?? "Error desconocido");
      setActasCantidad([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo ejecutar si ambas fechas están presentes
    if (!fechaInicio || !fechaFin) {
      return;
    }
    fetchData(fechaInicio, fechaFin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin]);

  // Preparar datos del gráfico basados en actasCantidad
  const labels = actasCantidad.map((d) => d.articulo);
  const values = actasCantidad.map((d) => d.cantActas);

  const data = {
    labels,
    datasets: [
      {
        label: "Actas",
        data: values,
        borderColor: "rgba(245, 40, 145, 0.8)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Actas por día" },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
      <div style={{ width: "90%", margin: "1rem auto" }}>
        {loading && <p>Cargando actas...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {!loading && !error && actasCantidad.length === 0 && (
          <p>No hay actas para el rango seleccionado.</p>
        )}

        {!loading && !error && actasCantidad.length > 0 && (
          <>
          <Typography variant="h6">Infracciones mas recurrentes</Typography>
          <Bar data={data} options={options} />
          </>
        )}
      </div>
  );
};

export default ReporteInfracciones;