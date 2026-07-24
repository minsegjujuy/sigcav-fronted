import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Props = {
  labels: string[];
  series: { label: string; data: number[] }[];
  height?: number;
  titulo?: string;
  colors?: string[];
  paletteSeed?: number;
};

const hashHue = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
};

const hsla = (h: number, s: number, l: number, a: number) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

const LineChart: React.FC<Props> = ({
  labels,
  series,
  height = 300,
  titulo = "Gráfico de Líneas",
  colors,
  paletteSeed,
}) => {
  const baseHue = paletteSeed ?? hashHue(titulo);

  const data: ChartData<"line"> = useMemo(
    () => ({
      labels,
      datasets: series.map((s, idx) => {
        const hue = (baseHue + idx * 47) % 360;
        const color = colors?.length ? colors[idx % colors.length] : hsla(hue, 78, 45, 0.95);
        return {
          label: s.label,
          data: s.data,
          borderWidth: 2,
          fill: false,
          borderColor: color,
          pointBackgroundColor: color,
          pointBorderColor: "rgba(255,255,255,0.95)",
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.3,
        };
      }),
    }),
    [labels, series, colors, baseHue]
  );

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: "easeOutQuart" },
      interaction: { mode: "nearest", intersect: false },
      layout: {
        padding: { top: 8, left: 4, right: 4, bottom: 4 },
      },
      onHover: (event, elements) => {
        const native = event.native as unknown as { target?: { style?: { cursor?: string } } } | undefined;
        if (native?.target?.style) native.target.style.cursor = elements.length ? "pointer" : "default";
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            boxWidth: 10,
            padding: 12,
          },
        },
        title: { display: true, text: titulo },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
          },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(148, 163, 184, 0.25)" },
        },
      },
    }),
    [titulo]
  );

  return (
    <div
      style={{
        height,
        width: "100%",
        maxWidth: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
