import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import type { RootState } from "../redux/store/Store";
import type { AuthenticationRequest } from "../models/AuthenticationRequest";
import { login, refresh, verify } from "../services/AuthService";
import { loginAction, logout, setAuthInitialized } from "../redux/slice/AuthSlice";
import type { AuthenticationResponse, TwoFactorVerifyRequest } from "../models/AuthenticationResponse";
import { clearAccessToken, setAccessToken } from "../utilities/tokenStore";

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  // LOGIN
  const loginUser = useCallback(async (data: AuthenticationRequest) : Promise<AuthenticationResponse>  => {
    const res = await login(data);
    if (res.jwt) {
      setAccessToken(res.jwt);
      dispatch(loginAction(res.jwt));
    }

    return res;
  }, [dispatch]);

  // VERIFY 2FA
  const verify2FA = useCallback(async (data: TwoFactorVerifyRequest) => {
    const res = await verify(data);

    if (res.jwt) {
      setAccessToken(res.jwt);
      dispatch(loginAction(res.jwt));
    }

    return res;
  }, [dispatch]);

  // REHIDRATAR SESIÓN (clave)
  const initAuth = useCallback(async () => {
    try {
      const res = await refresh();

      if (res.jwt) {
        setAccessToken(res.jwt);
        dispatch(loginAction(res.jwt));
      }

    } catch {
      clearAccessToken();
      dispatch(logout());
    } finally {
      dispatch(setAuthInitialized(true));
    }
  }, [dispatch]);

  // LOGOUT
  /*const logout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch {
      // incluso si falla, limpiamos todo
    }

    clearAccessToken();
    dispatch(logoutAction());
  };*/

  return {
    ...auth,
    loginUser,
    verify2FA,
    //logout,
    initAuth
  };
};
