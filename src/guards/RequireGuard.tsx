import { useSelector } from "react-redux";
import type { RootState } from "../redux/store/Store";
import { useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { logout } from "../redux/slice/AuthSlice";
import { isTokenExpired } from "../utilities/jwt";

type RequireAuthProps = {
  allowedRoles?: string[] | string;
};

export const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const token = auth?.token ?? null;
  const userRole = auth?.rol ?? null;

  // 1. Verificación de Autenticación
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Verificación de Expiración
  if (isTokenExpired(token)) {
    dispatch(logout());
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. Control de Roles
  if (allowedRoles) {
    const rolesArr = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!userRole || !rolesArr.includes(userRole)) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  // 4. TODO OK: Renderiza las rutas hijas
  return <Outlet />;
};