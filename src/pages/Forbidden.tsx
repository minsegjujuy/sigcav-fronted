import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Icono de Candado con Círculo de Fondo */}
        <Box
          sx={{
            backgroundColor: 'error.light',
            borderRadius: '50%',
            p: 3,
            mb: 4,
            display: 'inline-flex',
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 80, color: 'error.main' }} />
        </Box>

        <Typography variant="h1" component="h1" fontWeight="bold" gutterBottom>
          403
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom color="text.primary">
          Acceso Restringido
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
          Lo sentimos, no tienes los permisos necesarios para ver esta página. 
          Si crees que esto es un error, por favor contacta al administrador del sistema.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)} // Vuelve a la página anterior
          >
            Volver atrás
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/dashboard')}
          >
            Ir al Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ForbiddenPage;