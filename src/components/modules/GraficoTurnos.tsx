import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography, Box } from '@mui/material';
import type { TurnoData } from '../../models/TurnoData';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  datos: TurnoData[];
}

const GraficoTurnos: React.FC<Props> = ({ datos }) => {
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Ocultamos la leyenda porque los colores ya indican los turnos
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  // Mapeo de colores por nombre de turno
  const colores: Record<string, string> = {
    'MADRUGADA': '#3f51b5', // Indigo
    'MAÑANA': '#4caf50',    // Verde
    'TARDE': '#ff9800',     // Naranja
    'NOCHE': '#212121',     // Gris oscuro/Negro
  };

  const data = {
    labels: datos?.map(d => d.turno),
    datasets: [
      {
        label: 'Siniestros',
        data: datos?.map(d => d.cantidad),
        backgroundColor: datos?.map(d => colores[d.turno] || '#9e9e9e'),
        borderRadius: 5,
      },
    ],
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.secondary' }}>
        Siniestros por Turno Horario
      </Typography>
      <Box sx={{ height: 300 }}>
        <Bar options={options} data={data} />
      </Box>
    </Paper>
  );
};

export default GraficoTurnos;