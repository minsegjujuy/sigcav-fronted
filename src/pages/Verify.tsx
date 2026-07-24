import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Grow,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AppDispatch } from "../redux/store/Store";
import { useDispatch } from "react-redux";
import { loginAction } from "../redux/slice/AuthSlice";
import { verify } from "../services/AuthService";
import type { TwoFactorVerifyRequest } from "../models/AuthenticationResponse";
import { setAccessToken } from "../utilities/tokenStore";

type VerifyLocationState = {
  challengeId?: string;
  message?: string;
};

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const TWO_FACTOR_CHALLENGE_STORAGE_KEY = "sv_2fa_challenge_id";
  const TWO_FACTOR_MESSAGE_STORAGE_KEY = "sv_2fa_message";
  const TWO_FACTOR_RESEND_UNTIL_STORAGE_KEY = "sv_2fa_resend_until";
  const OTP_LENGTH = 6;
  //const RESEND_COOLDOWN_SECONDS = 60;

  const state = (location.state as VerifyLocationState | null) ?? null;

  const [challengeId, setChallengeId] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(() => Array.from({ length: OTP_LENGTH }, () => ""));
  const [isVerifying, setIsVerifying] = useState(false);
  //const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  //const [resendUntilMs, setResendUntilMs] = useState<number | null>(null);
  //const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = useMemo(() => otp.join(""), [otp]);

  const setOtpAt = (index: number, value: string) => {
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const applyTextFromIndex = (index: number, text: string) => {
    const digits = (text ?? "").replace(/\D/g, "").slice(0, OTP_LENGTH - index);
    if (!digits) return;

    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < digits.length; i += 1) {
        next[index + i] = digits[i];
      }
      return next;
    });

    const nextFocusIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    otpRefs.current[nextFocusIndex]?.focus();
  };

  const initialInfoMessage = useMemo(() => {
    return (
      state?.message ??
      (typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem(TWO_FACTOR_MESSAGE_STORAGE_KEY)
        : null) ??
      null
    );
  }, [state?.message]);

  useEffect(() => {
    const nextChallengeId =
      state?.challengeId ?? sessionStorage.getItem(TWO_FACTOR_CHALLENGE_STORAGE_KEY) ?? "";

    if (state?.challengeId) {
      sessionStorage.setItem(TWO_FACTOR_CHALLENGE_STORAGE_KEY, state.challengeId);
    }

    if (typeof state?.message === "string") {
      sessionStorage.setItem(TWO_FACTOR_MESSAGE_STORAGE_KEY, state.message);
    }

    if (!nextChallengeId) {
      navigate("/", { replace: true });
      return;
    }

    /*const storedResendUntilRaw = sessionStorage.getItem(TWO_FACTOR_RESEND_UNTIL_STORAGE_KEY);
    const storedResendUntilMs = storedResendUntilRaw ? Number(storedResendUntilRaw) : NaN;
    if (Number.isFinite(storedResendUntilMs) && storedResendUntilMs > Date.now()) {
      setResendUntilMs(storedResendUntilMs);
    } else {
      sessionStorage.removeItem(TWO_FACTOR_RESEND_UNTIL_STORAGE_KEY);
    }*/

    setChallengeId(nextChallengeId);
    setInfoMessage(initialInfoMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*useEffect(() => {
    if (!resendUntilMs) {
      setResendSecondsLeft(0);
      return;
    }

    const tick = () => {
      const diff = resendUntilMs - Date.now();
      if (diff <= 0) {
        setResendUntilMs(null);
        setResendSecondsLeft(0);
        sessionStorage.removeItem(TWO_FACTOR_RESEND_UNTIL_STORAGE_KEY);
        return;
      }
      setResendSecondsLeft(Math.max(1, Math.ceil(diff / 1000)));
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [resendUntilMs]);*/

  const handleBackToLogin = () => {
    sessionStorage.removeItem(TWO_FACTOR_CHALLENGE_STORAGE_KEY);
    sessionStorage.removeItem(TWO_FACTOR_MESSAGE_STORAGE_KEY);
    sessionStorage.removeItem(TWO_FACTOR_RESEND_UNTIL_STORAGE_KEY);
    navigate("/", { replace: true });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const payload: TwoFactorVerifyRequest = {
      challengeId,
      code: code.trim(),
    };

    if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(payload.code)) {
      setErrorMessage(`Ingresa un código numérico de ${OTP_LENGTH} dígitos.`);
      return;
    }

    setIsVerifying(true);
    try {
      const response = await verify(payload);

      if (response.requiresTwoFactor) {
        setErrorMessage(response.message || "Código inválido. Intenta nuevamente.");
        return;
      }

      if (!response.jwt) {
        setErrorMessage(response.message || "No se recibió el token. Intenta nuevamente.");
        return;
      }

      sessionStorage.removeItem(TWO_FACTOR_CHALLENGE_STORAGE_KEY);
      sessionStorage.removeItem(TWO_FACTOR_MESSAGE_STORAGE_KEY);
      sessionStorage.removeItem(TWO_FACTOR_RESEND_UNTIL_STORAGE_KEY);
      setAccessToken(response.jwt);
      dispatch(loginAction(response.jwt));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMessage("No se pudo verificar el código. Intenta nuevamente.");
    } finally {
      setIsVerifying(false);
    }
  };

  /*const handleResend = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    if (!challengeId) {
      setErrorMessage("No hay un desafío activo para reenviar el código.");
      return;
    }

    if (resendUntilMs && resendUntilMs > Date.now()) {
      return;
    }

    setIsResending(true);
    try {
      const response = await resend({ challengeId });
      setInfoMessage(response.message || "Código reenviado.");

      const nextChallengeId = response.challengeId ?? "";
      if (nextChallengeId) {
        setChallengeId(nextChallengeId);
        sessionStorage.setItem(TWO_FACTOR_CHALLENGE_STORAGE_KEY, nextChallengeId);
      }

      const nextUntil = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
      setResendUntilMs(nextUntil);
      sessionStorage.setItem(TWO_FACTOR_RESEND_UNTIL_STORAGE_KEY, String(nextUntil));
    } catch (err) {
      console.error(err);
      setErrorMessage("No se pudo reenviar el código.");
    } finally {
      setIsResending(false);
    }
  };*/

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 6, sm: 8 },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative" }}>
        <Fade in timeout={450}>
          <Box>
            <Grow in timeout={550}>
              <Paper
                elevation={0}
                sx={(theme) => ({
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark"
                      ? "rgba(141, 146, 106, 0.20)"
                      : "rgba(102, 104, 46, 0.20)",
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(18, 18, 14, 0.70)"
                      : "rgba(255, 255, 255, 0.80)",
                  backdropFilter: "blur(10px)",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 18px 60px rgba(0,0,0,0.55)"
                      : "0 18px 60px rgba(0,0,0,0.12)",
                  transformOrigin: "50% 65%",
                })}
              >
                <Stack spacing={2.25}>
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        display: "block",
                        letterSpacing: 2.2,
                        opacity: 0.85,
                      }}
                    >
                      Seguridad Vial
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                      Verificación
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.75 }}>
                      Ingresa el código enviado para continuar.
                    </Typography>
                  </Box>

                  {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                  {infoMessage ? <Alert severity="info">{infoMessage}</Alert> : null}

                  <Box component="form" onSubmit={handleVerify} noValidate>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1.25 }}>
                        {Array.from({ length: OTP_LENGTH }, (_, index) => (
                          <TextField
                            key={index}
                            value={otp[index] ?? ""}
                            inputRef={(el) => {
                              otpRefs.current[index] = el;
                            }}
                            onChange={(e) => {
                              setErrorMessage(null);
                              const raw = e.target.value ?? "";
                              const digits = String(raw).replace(/\D/g, "");

                              if (digits.length <= 1) {
                                setOtpAt(index, digits);
                                if (digits.length === 1) otpRefs.current[index + 1]?.focus();
                                return;
                              }

                              applyTextFromIndex(index, digits);
                            }}
                            onKeyDown={(e) => {
                              if (e.key !== "Backspace") return;
                              if (otp[index]) return;
                              if (index <= 0) return;
                              setOtpAt(index - 1, "");
                              otpRefs.current[index - 1]?.focus();
                              e.preventDefault();
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              setErrorMessage(null);
                              const text = e.clipboardData.getData("text") ?? "";
                              applyTextFromIndex(index, text);
                            }}
                            inputProps={{
                              inputMode: "numeric",
                              pattern: "\\d",
                              maxLength: 1,
                              autoComplete: index === 0 ? "one-time-code" : "off",
                            }}
                            sx={{
                              width: 54,
                              "& input": {
                                textAlign: "center",
                                fontSize: "1.6rem",
                                fontWeight: 800,
                                fontFamily:
                                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                paddingY: 1.1,
                              },
                            }}
                          />
                        ))}
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={isVerifying}
                        startIcon={!isVerifying ? <VerifiedOutlinedIcon /> : undefined}
                        sx={{ mt: 0.5, py: 1.25, fontWeight: 700, borderRadius: 2 }}
                      >
                        {isVerifying ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CircularProgress size={18} color="inherit" />
                            Verificando...
                          </Box>
                        ) : (
                          "Verificar"
                        )}
                      </Button>

                      <Button
                        type="button"
                        color="inherit"
                        fullWidth
                        onClick={handleBackToLogin}
                        startIcon={<ArrowBackOutlinedIcon />}
                        sx={{ py: 1.1, fontWeight: 700, borderRadius: 2 }}
                      >
                        Volver al login
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grow>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
