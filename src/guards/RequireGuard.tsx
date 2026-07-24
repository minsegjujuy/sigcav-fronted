import { useSelector } from "react-redux";
import type { RootState } from "../redux/store/Store";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

type RequireAuthProps = {
  allowedRoles?: string[] | string;
};

export const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const userRole = auth?.rol ?? null;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const isInitialized = auth?.isInitialized ?? false;

  if (!isInitialized) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // 1. Verificación de Autenticación
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Control de Roles
  if (allowedRoles) {
    const rolesArr = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!userRole || !rolesArr.includes(userRole)) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  // 3. TODO OK: Renderiza las rutas hijas
  return <Outlet />;
};
