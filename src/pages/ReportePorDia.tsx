// BarChartExample.tsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import type { DiasCantidad } from "../models/DiasCantidad";
import { obtenerActasPorDia } from "../services/ActaService";
import { Typography } from "@mui/material";

// Registramos los componentes que usaremos
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export interface RangoDeFechas {
  fechaInicio: string;
  fechaFin: string;
  //onToggle: () => void;
}

const ReportePorDia: React.FC<RangoDeFechas> = ({ fechaInicio, fechaFin }) => {
  const [actasCantidad, setActasCantidad] = useState<DiasCantidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (fi: string, ff: string) => {
    try {
      setLoading(true);
      setError(null);
      // Si tu API espera null en vez de "", deberías adaptarlo.
      const res = await obtenerActasPorDia(fi, ff); // se asume que retorna DiasCantidad[]
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
  const labels = actasCantidad.map((d) => d.dia);
  const values = actasCantidad.map((d) => d.cantidad);

  const data = {
    labels,
    datasets: [
      {
        label: "Actas",
        data: values,
        borderColor: "rgba(0,0,0,0.2)",
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
          <Typography variant="h6">Resumen semanal de actas realizadas</Typography>
          <Bar data={data} options={options} />
          </>
        )}
      </div>
  );
};

export default ReportePorDia;