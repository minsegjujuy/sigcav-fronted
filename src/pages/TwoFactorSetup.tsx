import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Fade,
  Grow,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { setup } from "../services/AuthService";
import axios from "axios";

export interface SetupResponse {
  secret: string;
  qrUrl: string;
}

interface TwoFactorSetupProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const TwoFactorSetup = ({ onClose }: TwoFactorSetupProps) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchQr = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await setup();
        setQrUrl(res.qrUrl);
        setSecret(res.secret);
      } catch (err: any) {
        // 1. Validar si el error viene de una respuesta del backend (ej. Axios)
        if (axios.isAxiosError(err) && err.response?.data?.message) {
            // Esto capturará "2FA ya activado"
            setError(err.response.data.message); 
        } else if (err instanceof Error) {
            // Errores genéricos de JavaScript (ej. problemas de red)
            setError(err.message);
        } else {
            // Fallback por si pasa algo muy raro
            setError("Error inesperado al generar el QR");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, []);

  /*const handleVerify = async () => {
    setError("");
    try {
      await verify
      setSuccess(true);
      onSuccess?.();
    } catch {
      setError("Codigo invalido. Intenta de nuevo.");
    }
  };*/

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClose = () => {
    setCode("");
    setError("");
    setSuccess(false);
    onClose?.();
  };

  const formatSecret = (value: string) => value.replace(/(.{4})/g, "$1 ").trim();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 4, sm: 6 },
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={400}>
          <Box>
            <Grow in timeout={500}>
              <Paper
                elevation={0}
                sx={{
                  maxWidth: 520,
                  mx: "auto",
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 2,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6" fontWeight={700}>
                    Autenticacion en dos pasos
                  </Typography>
                  <IconButton onClick={handleClose} size="small" sx={{ color: "text.secondary" }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Divider sx={{ mb: 2.5 }} />

                {loading ? (
                  <Box display="flex" flexDirection="column" alignItems="center" py={4} gap={2}>
                    <CircularProgress size={36} />
                    <Typography variant="body2" color="text.secondary">
                      Generando codigo QR...
                    </Typography>
                  </Box>
                ) : success ? (
                  <Alert severity="success" sx={{ my: 1 }}>
                    Autenticacion en dos pasos activada correctamente.
                  </Alert>
                ) : (
                  <>
                    <Box display="flex" alignItems="flex-start" gap={2} mb={2.5}>
                      <Box
                        sx={{
                          bgcolor: "primary.main",
                          borderRadius: 1.5,
                          p: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 44,
                          minHeight: 44,
                        }}
                      >
                        <PhoneIphoneIcon sx={{ color: "#fff", fontSize: 26 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          Usa una app de autenticacion de terceros
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Usa una app de autenticacion para escanear este codigo QR.
                        </Typography>
                      </Box>
                    </Box>

                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                    )}

                    <Box
                      display="flex"
                      gap={2}
                      alignItems="stretch"
                      mb={2.5}
                      sx={{ flexDirection: { xs: "column", sm: "row" } }}
                    >
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 1.5,
                          flex: "0 0 auto",
                          minWidth: 148,
                          minHeight: 148,
                        }}
                      >
                        {qrUrl ? (
                          <img
                            src={qrUrl}
                            alt="Codigo QR para 2FA"
                            style={{ width: 130, height: 130, display: "block" }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 130,
                              height: 130,
                              bgcolor: "grey.100",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography variant="caption" color="text.disabled">
                              Sin QR
                            </Typography>
                          </Box>
                        )}
                      </Paper>

                      <Paper
                        variant="outlined"
                        sx={{
                          flex: 1,
                          p: 2,
                          borderRadius: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.5, textAlign: "center" }}
                        >
                          O ingresa este codigo en la app de autenticacion
                        </Typography>

                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          letterSpacing={2}
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.97rem",
                            wordBreak: "break-all",
                            textAlign: "center",
                            color: "text.primary",
                            lineHeight: 1.7,
                          }}
                        >
                          {secret ? formatSecret(secret) : "-"}
                        </Typography>

                        <Tooltip title={copied ? "Copiado" : "Copiar codigo"} placement="top">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                            onClick={handleCopySecret}
                            disabled={!secret}
                            color={copied ? "success" : "primary"}
                            sx={{
                              mt: 0.5,
                              borderRadius: 1,
                              textTransform: "none",
                              fontWeight: 500,
                              fontSize: "0.82rem",
                              transition: "all 0.2s",
                            }}
                          >
                            {copied ? "Copiado" : "Copiar codigo"}
                          </Button>
                        </Tooltip>
                      </Paper>
                    </Box>
                  </>
                )}
              </Paper>
            </Grow>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default TwoFactorSetup;
