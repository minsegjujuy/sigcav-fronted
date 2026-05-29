import type { SvgIconComponent } from "@mui/icons-material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddDocumentIcon from "@mui/icons-material/NoteAdd";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CarCrashIcon from "@mui/icons-material/CarCrash";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Box, Card, CardActionArea, CardContent, Container, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store/Store";

interface DashboardItem {
  id: number;
  value: string;
  icon: SvgIconComponent;
  color: string;
  path: string;
}

const data: DashboardItem[] = [
  { id: 1, value: "Mis Actas", icon: AssignmentIcon, color: "#1976d2", path: "/dashboard/mis-actas" },
  { id: 2, value: "Nueva acta", icon: AddDocumentIcon, color: "#2e7d32", path: "/dashboard/nueva-acta" },
  { id: 3, value: "Informes", icon: AssessmentIcon, color: "#ed6c02", path: "/dashboard/informes" },
  //{ id: 5, value: "Talonarios", icon: MenuBookIcon, color: "#9c27b0", path: "/dashboard/talonarios" },
  { id: 6, value: "Hechos viales", icon: CarCrashIcon, color: "#9c27b0", path: "/dashboard/hechos-viales" },
  { id: 7, value: "Ubicaciones", icon: LocationOnIcon, color: "#e04646", path: "/dashboard/hechos-viales/mapa" },
  { id: 8, value: "Actas salientes", icon: ForwardToInboxIcon, color: "#85810e", path: "/dashboard/actas-salientes" },
  { id: 8, value: "Activar 2fa", icon: QrCodeScannerIcon, color: "#0ca2a2", path: "/dashboard/2fa-qr" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { name, rol } = useSelector((state: RootState) => state.auth);

  return (
    <Container
      sx={{
        py: 4,
        "@keyframes dashboardIconPulse": {
          "0%": { transform: "scale(1)", filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" },
          "50%": { transform: "scale(1.10)", filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.20))" },
          "100%": { transform: "scale(1)", filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" },
        },
      }}
    >
      <Typography variant="h4" sx={{ mb: 0.75, fontWeight: 800 }}>
        Bienvenido {name}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, opacity: 0.85 }}>
        Rol: {rol}
      </Typography>

      <Grid container spacing={3}>
        {data.map((item, idx) => {
          const Icon = item.icon;
          const delay = (idx % 4) * 140;

          return (
            // IMPORTANTE: En v7 NO se usa la prop 'item'.
            // Se usa 'size' con un objeto para la responsividad.
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                  "&:hover .dashboard-item-icon": {
                    animationDuration: "950ms",
                  },
                  "@media (prefers-reduced-motion: reduce)": {
                    "& .dashboard-item-icon": { animation: "none" },
                    "&:hover .dashboard-item-icon": { animation: "none" },
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(item.path)} sx={{ height: "100%", p: 1 }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        p: 2,
                        borderRadius: "20px",
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        mb: 2,
                      }}
                    >
                      <Icon
                        className="dashboard-item-icon"
                        fontSize="large"
                        sx={{
                          animation: "dashboardIconPulse 1750ms ease-in-out infinite",
                          animationDelay: `${delay}ms`,
                          transformOrigin: "50% 50%",
                          willChange: "transform, filter",
                        }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {item.value}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Dashboard;
