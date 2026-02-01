import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box 
} from '@mui/material';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CarCrashIcon from '@mui/icons-material/CarCrash';
import type { MetricasSiniestralidad } from '../../models/Metricas';

interface Props {
  metricas: MetricasSiniestralidad | null;
}

const TablaMetricasSiniestros: React.FC<Props> = ({ metricas }) => {
  
  // Si no hay datos, mostramos un estado vacío o cargando
  if (!metricas) return <Typography>No hay datos disponibles para el periodo.</Typography>;

  const rows = [
    { 
      id: 1, 
      label: 'Fallecidos', 
      cantidad: metricas.cantidadFallecidos, 
      color: '#d32f2f', 
      icon: <MoodBadIcon sx={{ color: '#d32f2f' }} /> 
    },
    { 
      id: 2, 
      label: 'Lesionados', 
      cantidad: metricas.cantidadLesionados, 
      color: '#ed6c02', 
      icon: <LocalHospitalIcon sx={{ color: '#ed6c02' }} /> 
    },
    { 
      id: 3, 
      label: 'Daños Materiales', 
      cantidad: metricas.cantidadDanosMateriales, 
      color: '#fbc02d', 
      icon: <CarCrashIcon sx={{ color: '#fbc02d' }} /> 
    },
  ];

  return (
    <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, maxWidth: 600, mt: 2 }}>
      <Box sx={{ p: 2, backgroundColor: '#1976d2' }}>
        <Typography variant="h6" color="white" sx={{ fontWeight: 'bold' }}>
          Resumen de Siniestralidad
        </Typography>
      </Box>
      <Table aria-label="tabla de metricas">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Registrado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow 
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#fafafa' } }}
            >
              <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {row.icon}
                  <Typography sx={{ fontWeight: 500 }}>{row.label}</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: row.color }}>
                  {row.cantidad.toLocaleString()}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
          {/* Fila de Total Acumulado */}
          <TableRow sx={{ backgroundColor: '#eeeeee' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Total Impactos en el Periodo</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              {(metricas.cantidadFallecidos + metricas.cantidadLesionados + metricas.cantidadDanosMateriales).toLocaleString()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TablaMetricasSiniestros;