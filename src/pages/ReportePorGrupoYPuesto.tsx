// BarChart.tsx
import React, { useMemo } from 'react';
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
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Props = {
  labels: string[];
  series: { label: string; data: number[] }[];
  height?: number; // opcional
};

const BarChart: React.FC<Props> = ({ labels, series, height = 300 }) => {
  // data memoizado
  const data: ChartData<'bar'> = useMemo(() => ({
    labels,
    datasets: series?.map((s, idx) => ({
      label: s.label,
      data: s.data,
      backgroundColor: idx % 2 === 0 ? 'rgba(75,192,192,0.5)' : 'rgba(153,102,255,0.5)',
      borderColor: idx % 2 === 0 ? 'rgba(75,192,192,1)' : 'rgba(153,102,255,1)',
      borderWidth: 1
    }))
  }), [labels, series]);

  const options: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Gráfico de Barras' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { stacked: false, title: { display: true, text: 'Categorías' } },
      y: { beginAtZero: true, title: { display: true, text: 'Valores' } }
    }
  }), []);

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
