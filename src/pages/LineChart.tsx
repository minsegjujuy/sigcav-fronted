// LineChart.tsx
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

// Registrar componentes
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  labels: string[];
  series: { label: string; data: number[] }[];
  height?: number;
};

const LineChart: React.FC<Props> = ({ labels, series, height = 300 }) => {
  const data: ChartData<"line"> = useMemo(() => ({
    labels,
    datasets: series.map((s, idx) => ({
      label: s.label,
      data: s.data,
      borderWidth: 2,
      fill: false,
      borderColor: `hsl(${idx * 60}, 70%, 50%)`,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.3
    }))
  }), [labels, series]);

  const options: ChartOptions<"line"> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Gráfico de Líneas" }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }), []);

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;

