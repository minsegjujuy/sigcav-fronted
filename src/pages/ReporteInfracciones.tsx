import React, { useEffect, useMemo, useState } from "react";
import type { RangoDeFechas } from "./ReportePorDia";
import type { ArticuloCantidad } from "../models/ArticuloCantidad";
import { obtenerActasPorArticulo } from "../services/ActaService";
import { Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";

const BAR_GREEN_BG = "rgba(34, 197, 94, 0.50)";
const BAR_GREEN_BORDER = "rgba(34, 197, 94, 1)";

const ReporteInfracciones: React.FC<RangoDeFechas> = ({ fechaInicio, fechaFin }) => {
  const [actasCantidad, setActasCantidad] = useState<ArticuloCantidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const top5 = useMemo(
    () =>
      [...actasCantidad]
        .sort((a, b) => b.cantActas - a.cantActas)
        .slice(0, 5),
    [actasCantidad]
  );

  const textoTop = useMemo(() => top5.map((a) => `${a.articulo}`).join(" / "), [top5]);

  useEffect(() => {
    if (!fechaInicio || !fechaFin) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await obtenerActasPorArticulo(fechaInicio, fechaFin);
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
  }, [fechaInicio, fechaFin]);

  const labels = useMemo(() => actasCantidad.map((d) => d.articulo), [actasCantidad]);
  const values = useMemo(() => actasCantidad.map((d) => d.cantActas), [actasCantidad]);

  const data: ChartData<"bar", number[], string> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Actas",
          data: values,
          backgroundColor: BAR_GREEN_BG,
          borderColor: BAR_GREEN_BORDER,
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
        duration: 1000,
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
        title: { display: true, text: "Infracciones más recurrentes" },
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

  return (
    <div style={{ width: "90%", margin: "1rem auto" }}>
      {loading && <p>Cargando actas...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && actasCantidad.length === 0 && <p>No hay actas para el rango seleccionado.</p>}

      {!loading && !error && actasCantidad.length > 0 && (
        <>
          <Typography variant="h6">Infracciones más recurrentes</Typography>
          <div style={{ height: 320, width: "100%", maxWidth: "100%", overflow: "hidden" }}>
            <Bar data={data} options={options} />
          </div>
          <p>
            NOTA: Del análisis de la tabla se concluye que durante el periodo del {fechaInicio} al {fechaFin}, los articulados que se realizaron con mayor
            frecuencia son {textoTop}.
          </p>
        </>
      )}
    </div>
  );
};

export default ReporteInfracciones;
