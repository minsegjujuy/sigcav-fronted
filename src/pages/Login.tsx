import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Grow,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";
import type { AuthenticationRequest } from "../models/AuthenticationRequest";
import type { AppDispatch } from "../redux/store/Store";
import { useDispatch } from "react-redux";
import { loginAction } from "../redux/slice/AuthSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [data, setData] = useState<AuthenticationRequest>({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const authResponse = await login(data);
      dispatch(loginAction(authResponse.jwt));
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage("Credenciales incorrectas. Revisa usuario y contrasena.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                      Iniciar sesion
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.75 }}>
                      Accede con tus credenciales para continuar.
                    </Typography>
                  </Box>

                  {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

                  <Box component="form" onSubmit={handleLogin} noValidate>
                    <Stack spacing={1.5}>
                      <TextField
                        label="Usuario"
                        name="username"
                        autoComplete="username"
                        fullWidth
                        required
                        value={data.username}
                        onChange={handleChange}
                        autoFocus
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutlineIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        label="Contrasena"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        fullWidth
                        required
                        value={data.password}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={showPassword ? "ocultar contrasena" : "mostrar contrasena"}
                                onClick={() => setShowPassword((v) => !v)}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOffOutlinedIcon fontSize="small" />
                                ) : (
                                  <VisibilityOutlinedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={isSubmitting}
                        startIcon={!isSubmitting ? <LoginOutlinedIcon /> : undefined}
                        sx={{
                          mt: 0.5,
                          py: 1.25,
                          fontWeight: 700,
                          borderRadius: 2,
                        }}
                      >
                        {isSubmitting ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CircularProgress size={18} color="inherit" />
                            Ingresando...
                          </Box>
                        ) : (
                          "Ingresar"
                        )}
                      </Button>

                      <Typography variant="caption" sx={{ opacity: 0.75, textAlign: "center" }}>
                        Si tenes problemas para ingresar, contacta a un administrador.
                      </Typography>
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
