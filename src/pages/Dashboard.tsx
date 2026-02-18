import { Box, Card, CardActionArea, CardContent, Container, Grid, Typography } from "@mui/material"
import { useSelector } from "react-redux";
import type {  RootState } from "../redux/store/Store";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from '@mui/icons-material/Assignment'; // Mis Actas
import AddDocumentIcon from '@mui/icons-material/NoteAdd';    // Nueva Acta
import AssessmentIcon from '@mui/icons-material/Assessment';  // Informes
import MenuBookIcon from '@mui/icons-material/MenuBook';      // Talonarios
import CarCrashIcon from '@mui/icons-material/CarCrash';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';

interface DashboardItem {
  id: number;
  value: string;
  icon: React.ReactNode;
  color: string;
  path: string; // Nueva propiedad para la ruta
}

const data: DashboardItem[] = [
  { id: 1, value: 'Mis Actas', icon: <AssignmentIcon fontSize="large" />, color: '#1976d2', path: '/dashboard/mis-actas' },
  { id: 2, value: 'Nueva acta', icon: <AddDocumentIcon fontSize="large" />, color: '#2e7d32', path: '/dashboard/nueva-acta' },
  { id: 3, value: 'Informes', icon: <AssessmentIcon fontSize="large" />, color: '#ed6c02', path: '/dashboard/informes' },
  { id: 5, value: 'Talonarios', icon: <MenuBookIcon fontSize="large" />, color: '#9c27b0', path: '/dashboard/talonarios' },
  { id: 6, value: 'Hechos viales', icon: <CarCrashIcon fontSize="large" />, color: '#3b2e3d', path: '/dashboard/hechos-viales' },
  { id: 7, value: 'Ubicaciones', icon: <LocationOnIcon fontSize="large" />, color: '#e04646', path: '/dashboard/hechos-viales/mapa' },
  { id: 8, value: 'Actas salientes', icon: <ForwardToInboxIcon fontSize="large" />, color: '#85810e', path: '/dashboard/actas-salientes' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { name, rol } = useSelector((state: RootState) => state.auth);
  

  return (
    <>
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          <Typography variant="h4">Bienvenido al panel de control {name} su rol es: {rol}</Typography>
        </Typography>
        <Grid container spacing={3}>
          {data.map((item) => (
            /* IMPORTANTE: En v7 NO se usa la prop 'item'. 
              Se usa 'size' con un objeto para la responsividad.
            */
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 6 }
                }}
              >
                {/* Al hacer clic, navegamos a la ruta definida */}
                <CardActionArea 
                  onClick={() => navigate(item.path)} 
                  sx={{ height: '100%', p: 1 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      display: 'inline-flex', p: 2, borderRadius: '20px',
                      backgroundColor: `${item.color}15`, color: item.color, mb: 2
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {item.value}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  )
}

export default Dashboard