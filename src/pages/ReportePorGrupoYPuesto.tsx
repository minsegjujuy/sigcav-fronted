import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

type SeriesItem = {
  label: string;
  data: number[];
  yAxisID?: "y" | "y1";
};

type Props = {
  labels: string[];
  series: SeriesItem[];
  height?: number;
  titulo: string;
  colors?: {
    background: string[];
    border?: string[];
  };
  paletteSeed?: number;
};

const DEFAULT_BORDER = "rgba(15, 23, 42, 0.85)";

const hashHue = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
};

const hsla = (h: number, s: number, l: number, a: number) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

const BarChart: React.FC<Props> = ({ labels, series, height = 300, titulo, colors, paletteSeed }) => {
  const baseHue = paletteSeed ?? hashHue(titulo);
  const hasY1 = useMemo(() => series.some((s) => s.yAxisID === "y1"), [series]);

  const data: ChartData<"bar"> = useMemo(
    () => ({
      labels,
      datasets: series.map((s, idx) => {
        const hue = (baseHue + idx * 47) % 360;
        const bg = colors?.background?.[idx] ?? hsla(hue, 78, 48, 0.38);
        const border = colors?.border?.[idx] ?? hsla(hue, 78, 42, 0.95);

        return {
          label: s.label,
          data: s.data,
          yAxisID: s.yAxisID ?? "y",
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: 6,
        };
      }),
    }),
    [labels, series, baseHue, colors]
  );

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: {
        duration: 900,
        easing: "easeOutQuart",
        delay: (ctx) => (ctx.type === "data" ? ctx.dataIndex * 10 + ctx.datasetIndex * 60 : 0),
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
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: (context: TooltipItem<"bar">) => {
              const datasetLabel = context.dataset.label ?? "";
              const y = typeof context.parsed.y === "number" ? context.parsed.y : Number(context.formattedValue);
              const isPercent = context.dataset.yAxisID === "y1";
              return isPercent ? `${datasetLabel}: ${y}%` : `${datasetLabel}: ${y}`;
            },
          },
        },
        datalabels: {
          display: (ctx) => {
            const labelsCount = (ctx.chart.data.labels?.length ?? 0) as number;
            return labelsCount > 0 && labelsCount <= 12;
          },
          anchor: "end",
          align: "top",
          clamp: true,
          clip: true,
          color: "#64748b",
          font: {
            weight: "bold",
            size: 11,
          },
          formatter: (value, context) => {
            const isPercent = (context.dataset as unknown as { yAxisID?: string }).yAxisID === "y1";
            return isPercent ? `${value}%` : value;
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          title: { display: true, text: "Categorías" },
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
          },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: hasY1 ? "Cantidad" : "Valores" },
          ticks: { precision: 0 },
          grid: { color: "rgba(148, 163, 184, 0.25)" },
        },
        ...(hasY1
          ? {
              y1: {
                position: "right" as const,
                beginAtZero: true,
                suggestedMax: 100,
                title: { display: true, text: "Porcentaje" },
                grid: { drawOnChartArea: false },
                ticks: {
                  callback: (value) => `${value}%`,
                },
              },
            }
          : {}),
      },
      elements: {
        bar: {
          borderSkipped: false,
        },
      },
      datasets: {
        bar: {
          borderColor: DEFAULT_BORDER,
        },
      },
    }),
    [titulo, hasY1]
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
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
