import { useSelector } from "react-redux";
import type { RootState } from "../redux/store/Store";
import { useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { logout } from "../redux/slice/AuthSlice";
import { isTokenExpired } from "../utilities/jwt";
import type { JSX } from "react";

type RequireAuthProps = {
  children: JSX.Element;
  allowedRoles?: string[] | string;
};

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const token = auth?.token ?? null;
  const userRole = auth?.rol ?? null;

  if (!token) {
    // no autenticado -> al login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // token expirado -> limpiar redux/localStorage y al login
  if (isTokenExpired(token)) {
    dispatch(logout());
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // control por rol (si se pasa allowedRoles)
  if (allowedRoles) {
    const rolesArr = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!userRole || !rolesArr.includes(userRole)) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  // todo OK
  return children;
};