import React, { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ArcElement,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import type { DiasCantidad } from "../models/DiasCantidad";
import { Typography } from "@mui/material";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, Title);

export interface RangoDeFechas {
  fechaInicio: string;
  fechaFin: string;
}

const BAR_BLUE_BG = "rgba(37, 99, 235, 0.50)";
const BAR_BLUE_BORDER = "rgba(37, 99, 235, 1)";

interface ReportePorDiaProps{
  actasCantidad: DiasCantidad[];
}


const ReportePorDia: React.FC<ReportePorDiaProps> = ({ actasCantidad }) => {
  //const [actasCantidad, setActasCantidad] = useState<DiasCantidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const top2 = useMemo(
    () =>
      [...actasCantidad]
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 2),
    [actasCantidad]
  );

  /*useEffect(() => {
    if (!fechaInicio || !fechaFin) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await obtenerActasPorDia(fechaInicio, fechaFin);
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

  const labels = useMemo(() => actasCantidad.map((d) => d.dia), [actasCantidad]);
  const values = useMemo(() => actasCantidad.map((d) => d.cantidad), [actasCantidad]);

  const data: ChartData<"bar", number[], string> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Actas",
          data: values,
          backgroundColor: BAR_BLUE_BG,
          borderColor: BAR_BLUE_BORDER,
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    }),
    [labels, values]
  );

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: {
        duration: 500,
        easing: "easeOutQuart",
      },
      animations: {
        y: {
          from: (ctx) => {
            if (ctx.type !== "data") return undefined;
            const yScale = ctx.chart.scales.y;
            return yScale.getPixelForValue(0);
          },
        },
      },
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Actas por día" },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: {
          ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: "rgba(148, 163, 184, 0.25)" },
        },
      },
    }),
    []
  );

  const textoTop2 = useMemo(() => top2.map((a) => `${a.dia}`).join(" y "), [top2]);

  return (
    <div style={{ width: "90%", margin: "1rem auto" }}>
      {loading && <p>Cargando actas...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && actasCantidad.length === 0 && <p>No hay actas para el rango seleccionado.</p>}

      {!loading && !error && actasCantidad.length > 0 && (
        <>
          <Typography variant="h6">Resumen semanal de actas realizadas</Typography>
          <div style={{ height: 320, width: "100%", maxWidth: "100%", overflow: "hidden" }}>
            <Bar data={data} options={options} />
          </div>
          <p>
            NOTA: El análisis de la tabla permite concluir que, el labrado de actas se
            realizó con mayor frecuencia los días {textoTop2}.
          </p>
        </>
      )}
    </div>
  );
};

export default ReportePorDia;
