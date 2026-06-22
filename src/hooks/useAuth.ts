import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import type { RootState } from "../redux/store/Store";
import type { AuthenticationRequest } from "../models/AuthenticationRequest";
import { login, logout as logoutRequest, refresh, verify } from "../services/AuthService";
import { loginAction, logout as logoutAction, setAuthInitialized } from "../redux/slice/AuthSlice";
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
      dispatch(logoutAction());
    } finally {
      dispatch(setAuthInitialized(true));
    }
  }, [dispatch]);

  const logoutUser = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // si el backend ya invalidó la cookie, seguimos limpiando localmente
      console.log("cookie ivalida")
    }

    sessionStorage.removeItem("sv_2fa_challenge_id");
    sessionStorage.removeItem("sv_2fa_message");
    sessionStorage.removeItem("sv_2fa_resend_until");
    clearAccessToken();
    dispatch(logoutAction());
    dispatch(setAuthInitialized(true));
  }, [dispatch]);

  return {
    ...auth,
    loginUser,
    verify2FA,
    logoutUser,
    initAuth,
  };
};
