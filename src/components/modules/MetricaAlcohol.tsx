import React from 'react';
import { Box, Typography, CircularProgress, Paper, Stack } from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar'; // Icono de alcohol/copa
import type { PorcentajeAlcoholizados } from '../../models/PorcentajeAlcoholizados';

const MetricaAlcohol: React.FC<PorcentajeAlcoholizados> = ({ totalAlcoholizados, porcentajeAlcoholizados }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, maxWidth: 350 }}>
      <Stack direction="row" spacing={3} alignItems="center">
        
        {/* Círculo de Porcentaje */}
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={porcentajeAlcoholizados}
            size={80}
            thickness={5}
            sx={{ color: '#7b1fa2' }} // Color púrpura para diferenciar
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              {`${Math.round(porcentajeAlcoholizados)}%`}
            </Typography>
          </Box>
        </Box>

        {/* Datos Numéricos */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <LocalBarIcon sx={{ color: '#7b1fa2' }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              ALCOHOLIZADOS
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {totalAlcoholizados}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Conductores detectados
          </Typography>
        </Box>

      </Stack>
    </Paper>
  );
};

export default MetricaAlcohol;