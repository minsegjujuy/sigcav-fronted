// BarChartExample.tsx
import React, { useState } from "react";
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
import type { ParamsDate } from "../models/ParamsDate";

// Registramos los componentes que usaremos
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const ReportePorDia: React.FC = () => {
    const [actasCantidad, setActasCantidad] = useState<DiasCantidad[]>([]);
    const [params, setParams] = useState<ParamsDate>({
        fechaInicio:'',
        fechaFin:''
    })

    const fetchData = async () => {
        const res = await obtenerActasPorDia(params.fechaInicio, params.fechaFin);
        setActasCantidad(res);
    }
  // Datos que se grafican
  const data = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
    datasets: [
      {
        label: "Ventas (en miles)",
        data: [12, 19, 8, 15, 10],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: "rgba(0,0,0,0.2)",
        borderWidth: 1,
      },
    ],
  };

  // Configuración del gráfico
  const options = {
    responsive: true, // se adapta al tamaño del contenedor
    plugins: {
      legend: {
        position: "top" as const, // posición del título del dataset
      },
      title: {
        display: true,
        text: "Ventas por Mes",
      },
    },
    scales: {
      y: {
        beginAtZero: true, // eje Y comienza en 0
      },
    },
  };

  return (
    <div style={{ width: "80%", margin: "0 auto" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ReportePorDia;