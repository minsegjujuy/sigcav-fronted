import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Tesseract, { createWorker } from "tesseract.js";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { VehiculoSolicitud } from "../../models/VehiculoSolicitud";
import type { Propietario } from "../../models/Propietario";

type FrenteData = {
  dominio: string;
  modelo: string;
  marca: string;
  motor: string;
  cuadro: string;
  vencimiento: string;
  tipoRodado: string;
};

type DorsoData = {
  nombre: string;
  apellido: string;
  dni: string;
  direccion: string;
};

type CedulaData = {
  frente: FrenteData;
  dorso: DorsoData;
};

const initialData: CedulaData = {
  frente: {
    dominio: "",
    modelo: "",
    marca: "",
    motor: "",
    cuadro: "",
    vencimiento: "",
    tipoRodado: "",
  },
  dorso: {
    nombre: "",
    apellido: "",
    dni: "",
    direccion: "",
  },
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const cleanLine = (value: string) => value.replace(/\s+/g, " ").trim();

const getLines = (rawText: string): string[] =>
  normalizeText(rawText)
    .split(/\r?\n/)
    .map((line) => cleanLine(line))
    .filter(Boolean);

const FRONT_LABELS = "DOMINIO|MARCA|MODELO|TIPO|USO|CHASIS|CUADRO|MOTOR|VENCE|VENCIMIENTO";

const cleanExtractedValue = (value: string) =>
  value
    .replace(/\[/g, " ")
    .replace(/\]/g, " ")
    .replace(/[{}|`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractInlineOrNext = (lines: string[], label: RegExp, stopLabelRegex?: RegExp): string => {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!label.test(line)) continue;

    const inline = cleanExtractedValue(
      line
        .replace(label, "")
        .replace(/^[:\-\s]+/, "")
        .replace(new RegExp(`\\b(?:${FRONT_LABELS})\\b.*$`), "")
    );

    if (inline) return inline;

    const next = cleanExtractedValue(lines[i + 1] ?? "");
    if (!next) continue;
    if (stopLabelRegex && stopLabelRegex.test(next)) continue;
    return next;
  }

  return "";
};

const pickByRegex = (value: string, matcher: RegExp): string => {
  const match = value.match(matcher);
  return match?.[0] ?? "";
};

const pickMotorCandidate = (value: string): string => {
  const tokens = value
    .replace(/[^A-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !/^(AUTOMOTOR|MOTOR|ORIGINAL|PRIVADO|TIPO|USO|DOMINIO|MARCA|MODELO)$/.test(token));

  const best = tokens.find((token) => /\d/.test(token) && token.length >= 6 && token.length <= 15);
  return best ?? "";
};


type FrontTagKey = "dominio" | "marca" | "modelo" | "cuadro" | "motor" | "vencimiento";

const FRONT_TAG_ALIASES: Record<FrontTagKey, string[]> = {
  dominio: ["DOMINIO"],
  marca: ["MARCA"],
  modelo: ["MODELO"],
  cuadro: ["CHASIS", "CUADRO"],
  motor: ["MOTOR"],
  vencimiento: ["VENCE", "VENCIMIENTO", "ENCE"],
};

const sanitizeLabel = (value: string): string => value.replace(/[^A-Z]/g, "");

const levenshtein = (a: string, b: string): number => {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
};

const isSimilarLabel = (token: string, aliases: string[]): boolean => {
  const normalizedToken = sanitizeLabel(token);
  if (!normalizedToken) return false;

  return aliases.some((alias) => {
    if (normalizedToken.includes(alias) || alias.includes(normalizedToken)) return true;
    const distance = levenshtein(normalizedToken, alias);
    const threshold = alias.length >= 8 ? 2 : 1;
    return distance <= threshold;
  });
};

const resolveFrontTag = (labelText: string): FrontTagKey | null => {
  const words = cleanExtractedValue(labelText)
    .split(/\s+/)
    .map((word) => sanitizeLabel(word))
    .filter(Boolean);
  const joined = sanitizeLabel(labelText);
  const tokensToTest = [...words, joined];

  const keys: FrontTagKey[] = ["dominio", "marca", "modelo", "cuadro", "motor", "vencimiento"];

  for (const key of keys) {
    const aliases = FRONT_TAG_ALIASES[key];
    if (tokensToTest.some((token) => isSimilarLabel(token, aliases))) {
      return key;
    }
  }

  return null;
};

const extractFrontTaggedValues = (rawText: string): Partial<FrenteData> => {
  const lines = getLines(rawText).map((line) => cleanExtractedValue(line.replace(/^[^A-Z0-9]+/, "")));
  const tagged: Partial<FrenteData> = {};

  for (const line of lines) {
    if (!line.includes(":")) continue;

    const parts = line.split(":");
    const labelPart = parts[0] ?? "";
    const rawValue = parts.slice(1).join(":");
    const value = cleanExtractedValue(
      rawValue
        .replace(new RegExp(`\\b(?:${FRONT_LABELS})\\b.*$`, "i"), "")
        .replace(/^[[({\s]+/, "")
        .replace(/[)\]}\s]+$/, "")
    );

    if (!value) continue;

    const key = resolveFrontTag(labelPart);
    if (!key) continue;
    if (!tagged[key]) tagged[key] = value;
  }

  return tagged;
};

const extractVencDateAfterColon = (lines: string[]): string => {
  for (const line of lines) {
    if (!/\b(VENCE|VENCIMIENTO)\b/.test(line)) continue;
    if (!line.includes(":")) continue;

    const afterColon = line.split(":").slice(1).join(":").trim();
    const date = afterColon.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
    if (date?.[0]) return date[0];
  }

  return "";
};

const normalizeDominio = (value: string): string => {
  const compact = value.replace(/[^A-Z0-9]/g, "");

  const candidates = [
    ...(compact.match(/[A-Z]{2}\d{3}[A-Z]{2}/g) ?? []),
    ...(compact.match(/[A-Z]{2}\d{2}[A-Z]{3}/g) ?? []),
    ...(compact.match(/[A-Z]{3}\d{3}/g) ?? []),
  ];

  if (candidates.length > 0) {
    return candidates.sort((a, b) => b.length - a.length)[0];
  }

  const loose = compact.match(/[A-Z0-9]{6,8}/g) ?? [];
  const plausible = loose.find((candidate) => {
    const letters = (candidate.match(/[A-Z]/g) ?? []).length;
    const digits = (candidate.match(/\d/g) ?? []).length;
    return letters >= 2 && digits >= 2;
  });

  return plausible ?? "";
};

const splitTitular = (titular: string): Pick<DorsoData, "nombre" | "apellido"> => {
  const compact = cleanExtractedValue(titular);
  if (!compact) return { nombre: "", apellido: "" };

  const parts = compact.split(/\s+/).filter(Boolean);
  if (parts.length >= 4) {
    return {
      apellido: `${parts[0]} ${parts[1]}`.trim(),
      nombre: parts.slice(2).join(" ").trim(),
    };
  }

  if (parts.length >= 2) {
    return {
      apellido: parts[0],
      nombre: parts.slice(1).join(" ").trim(),
    };
  }

  return { nombre: compact, apellido: "" };
};

const parseFrente = (rawText: string): FrenteData => {
  const lines = getLines(rawText).map((line) => cleanExtractedValue(line.replace(/^[^A-Z0-9]+/, "")));

  const tagged = extractFrontTaggedValues(rawText);

  const dominioRaw = tagged.dominio || extractInlineOrNext(lines, /\bDOMINIO\b\s*:?/);
  const marcaRaw = tagged.marca || extractInlineOrNext(lines, /\bMARCA\b\s*:?/);
  const modeloRaw = tagged.modelo || extractInlineOrNext(lines, /\bMODELO\b\s*:?/);
  const chasisRaw = tagged.cuadro || extractInlineOrNext(lines, /\b(CHASIS|CUADRO)\b\s*:?/);
  const motorRaw = tagged.motor || extractInlineOrNext(lines, /\bMOTOR\b\s*:?/);
  const vencRaw = tagged.vencimiento || extractInlineOrNext(lines, /\b(VENCE|VENCIMIENTO)\b\s*:?/);
  const vencFromColon = extractVencDateAfterColon(lines);

  const dominio = normalizeDominio(dominioRaw);
  const marca = cleanExtractedValue(marcaRaw).replace(/\bORIGINAL\b/g, "").trim();
  const modelo = cleanExtractedValue(modeloRaw).replace(/\bTIPO\b.*$/, "").trim();

  const cuadroCompact = chasisRaw.replace(/[^A-Z0-9]/g, "");
  const cuadro = pickByRegex(cuadroCompact, /[A-Z0-9]{10,20}/);

  const motor = pickMotorCandidate(motorRaw);
  const vencimiento = vencFromColon || pickByRegex(vencRaw, /\b\d{2}\/\d{2}\/\d{4}\b/);

  return {
    dominio,
    modelo,
    marca,
    motor,
    cuadro,
    vencimiento,
    tipoRodado: "",
  };
};
const parseDorso = (rawText: string): DorsoData => {
  const lines = getLines(rawText).map((line) => cleanExtractedValue(line.replace(/^[^A-Z0-9]+/, "")));

  const titular = extractInlineOrNext(lines, /\bTITULAR\b\s*:?/);
  const titularName = splitTitular(titular);

  const documentoLine = extractInlineOrNext(lines, /\b(DOC|DOCUMENTO|D\.?N\.?I\.?)\b\s*:?/);
  const documentoDigits = documentoLine.replace(/\D/g, "");
  const documento = documentoDigits.length >= 7 ? documentoDigits.slice(0, 8) : "";

  let domicilio = "";
  const domicilioIndex = lines.findIndex((line) => /\bDOMICILIO\b\s*:?/.test(line));
  if (domicilioIndex >= 0) {
    const sameLine = cleanExtractedValue(
      lines[domicilioIndex].replace(/.*\bDOMICILIO\b\s*:?/, "").replace(/^[:\-\s]+/, "")
    );

    const nextLine = cleanExtractedValue(lines[domicilioIndex + 1] ?? "");
    const shouldAppendNext =
      !!nextLine && !/^(FIRMA|EXHIBIDA|DNRPA|MINISTERIO|AUTOMOTOR|IDENTIFICACION)/.test(nextLine);

    domicilio = [sameLine, shouldAppendNext ? nextLine : ""].filter(Boolean).join(" ").trim();
  }

  return {
    nombre: titularName.nombre,
    apellido: titularName.apellido,
    dni: documento,
    direccion: domicilio,
  };
};

const hasVehiculoSolicitudData = (vehiculo: VehiculoSolicitud): boolean => {
  const propietario = vehiculo.propietario;
  return Boolean(
    vehiculo.dominio?.trim() ||
      vehiculo.marca?.trim() ||
      vehiculo.modelo?.trim() ||
      vehiculo.motor?.trim() ||
      vehiculo.cuadro?.trim() ||
      vehiculo.tipoRodado?.trim() ||
      propietario?.nombre?.trim() ||
      propietario?.apellido?.trim() ||
      propietario?.dni?.trim() ||
      propietario?.direccion?.trim()
  );
};
const toVehiculoSolicitud = (values: CedulaData): VehiculoSolicitud => {
  const propietario: Propietario = {
    nombre: values.dorso.nombre,
    apellido: values.dorso.apellido,
    dni: values.dorso.dni,
    direccion: values.dorso.direccion,
    localidad: '',
    provincia: ''
  };

  return {
    marca: values.frente.marca || null,
    modelo: values.frente.modelo || null,
    dominio: values.frente.dominio,
    motor: values.frente.motor || null,
    cuadro: values.frente.cuadro || null,
    tipoRodado: values.frente.tipoRodado || undefined,
    propietario:
      propietario.nombre || propietario.apellido || propietario.dni || propietario.direccion
        ? propietario
        : null,
  };
};

// Binarizacion adaptativa de Sauvola (mas robusta que umbral fijo)
const applyAdaptiveThreshold = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  windowSize = 51,
  k = 0.2
): void => {
  const grayscale = new Float32Array(width * height);

  // Convertir a escala de grises
  for (let i = 0; i < grayscale.length; i++) {
    const px = i * 4;
    grayscale[i] = 0.299 * data[px] + 0.587 * data[px + 1] + 0.114 * data[px + 2];
  }

  const half = Math.floor(windowSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - half);
      const x1 = Math.min(width - 1, x + half);
      const y0 = Math.max(0, y - half);
      const y1 = Math.min(height - 1, y + half);

      let sum = 0;
      let sumSq = 0;
      let count = 0;

      for (let wy = y0; wy <= y1; wy++) {
        for (let wx = x0; wx <= x1; wx++) {
          const v = grayscale[wy * width + wx];
          sum += v;
          sumSq += v * v;
          count++;
        }
      }

      const mean = sum / count;
      const variance = sumSq / count - mean * mean;
      const stddev = Math.sqrt(Math.max(0, variance));

      // Formula de Sauvola: T = mean * (1 + k * (stddev/128 - 1))
      const threshold = mean * (1 + k * (stddev / 128 - 1));
      const gray = grayscale[y * width + x];
      const value = gray > threshold ? 255 : 0;

      const px = (y * width + x) * 4;
      data[px] = value;
      data[px + 1] = value;
      data[px + 2] = value;
      data[px + 3] = 255;
    }
  }
};

const preprocessImageForOcr = async (file: File): Promise<Blob> => {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo cargar la imagen."));
      img.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    // Escalar a 2400px de ancho maximo para buena resolucion de OCR
    const targetWidth = Math.min(image.width * 2, 2400);
    const scale = targetWidth / image.width;
    canvas.width = targetWidth;
    canvas.height = Math.round(image.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo crear contexto de canvas.");

    // Mejorar nitidez antes de escalar
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Aplicar binarizacion adaptativa de Sauvola
    applyAdaptiveThreshold(imageData.data, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (!value) {
            reject(new Error("No se pudo convertir imagen preprocesada."));
            return;
          }
          resolve(value);
        },
        "image/png",
        1.0
      );
    });

    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const runOcr = async (file: File): Promise<string> => {
  const preprocessed = await preprocessImageForOcr(file);

  const worker = await createWorker("spa+eng");

  await worker.setParameters({
    tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
    preserve_interword_spaces: "1",
  });

  const { data } = await worker.recognize(preprocessed);
  await worker.terminate();

  return data.text;
};

type CedulaQrScannerProps = {
  onVehiculoDetected?: (vehiculo: VehiculoSolicitud) => void;
};

const CedulaQrScanner = ({ onVehiculoDetected }: CedulaQrScannerProps) => {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [data, setData] = useState<CedulaData>(initialData);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const frontPreview = useMemo(() => (frontFile ? URL.createObjectURL(frontFile) : ""), [frontFile]);
  const backPreview = useMemo(() => (backFile ? URL.createObjectURL(backFile) : ""), [backFile]);

  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [frontPreview, backPreview]);

  const onFrontChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFrontFile(file);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const onBackChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setBackFile(file);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const updateFrente = (field: keyof FrenteData, value: string) => {
    setData((prev) => ({
      ...prev,
      frente: {
        ...prev.frente,
        [field]: value,
      },
    }));
  };

  const updateDorso = (field: keyof DorsoData, value: string) => {
    setData((prev) => ({
      ...prev,
      dorso: {
        ...prev.dorso,
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    const vehiculoSolicitud = toVehiculoSolicitud(data);
    if (hasVehiculoSolicitudData(vehiculoSolicitud)) {
      onVehiculoDetected?.(vehiculoSolicitud);
    }
  }, [data, onVehiculoDetected]);

  const processCedulaOcr = async () => {
    if (!frontFile && !backFile) {
      setErrorMessage("Debes cargar al menos una imagen de cedula (frente o dorso).");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const nextData: CedulaData = structuredClone(initialData);

      if (frontFile) {
        const frontRaw = await runOcr(frontFile);
        nextData.frente = parseFrente(frontRaw);
        console.log("[OCR][CEDULA][FRENTE] RAW:", frontRaw);
        console.log("[OCR][CEDULA][FRENTE] TAGS:", extractFrontTaggedValues(frontRaw));
        console.log("[OCR][CEDULA][FRENTE] CAMPOS:", nextData.frente);
      }

      if (backFile) {
        const backRaw = await runOcr(backFile);
        nextData.dorso = parseDorso(backRaw);
        console.log("[OCR][CEDULA][DORSO] RAW:", backRaw);
        console.log("[OCR][CEDULA][DORSO] CAMPOS:", nextData.dorso);
      }

      setData(nextData);
      console.log("[OCR][CEDULA][CONSOLIDADO]:", nextData);
      const vehiculoSolicitud = toVehiculoSolicitud(nextData);
      console.log("[OCR][CEDULA][VEHICULO_SOLICITUD]:", vehiculoSolicitud);
      if (hasVehiculoSolicitudData(vehiculoSolicitud)) {
        onVehiculoDetected?.(vehiculoSolicitud);
      }
      setSuccessMessage("OCR completado. Revisa consola para detalle y campos detectados.");
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo procesar OCR en las imagenes cargadas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">OCR Cedula (Frente y Dorso)</Typography>
        <Typography variant="body2" color="text.secondary">
          Carga o toma foto del frente y dorso. Se extraen campos y se imprimen por consola.
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button component="label" variant="outlined" disabled={loading}>
            Cargar frente
            <input hidden type="file" accept="image/*" capture="environment" onChange={onFrontChange} />
          </Button>

          <Button component="label" variant="outlined" disabled={loading}>
            Cargar dorso
            <input hidden type="file" accept="image/*" capture="environment" onChange={onBackChange} />
          </Button>

          <Button variant="contained" onClick={processCedulaOcr} disabled={loading || (!frontFile && !backFile)}>
            Procesar OCR
          </Button>
        </Box>

        {loading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2">Procesando OCR de cedula...</Typography>
          </Stack>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Frente</Typography>
            {frontPreview ? (
              <Box component="img" src={frontPreview} alt="Frente cedula" sx={{ width: "100%", borderRadius: 1 }} />
            ) : (
              <Typography variant="body2" color="text.secondary">Sin imagen de frente</Typography>
            )}
          </Box>

          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Dorso</Typography>
            {backPreview ? (
              <Box component="img" src={backPreview} alt="Dorso cedula" sx={{ width: "100%", borderRadius: 1 }} />
            ) : (
              <Typography variant="body2" color="text.secondary">Sin imagen de dorso</Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField label="Dominio (frente)" value={data.frente.dominio} onChange={(e) => updateFrente("dominio", e.target.value)} fullWidth />
          <TextField label="Marca (frente)" value={data.frente.marca} onChange={(e) => updateFrente("marca", e.target.value)} fullWidth />
          <TextField label="Modelo (frente)" value={data.frente.modelo} onChange={(e) => updateFrente("modelo", e.target.value)} fullWidth />
          <TextField label="Motor (frente)" value={data.frente.motor} onChange={(e) => updateFrente("motor", e.target.value)} fullWidth />
          <TextField label="Cuadro/Chasis (frente)" value={data.frente.cuadro} onChange={(e) => updateFrente("cuadro", e.target.value)} fullWidth />
          <TextField label="Tipo rodado (frente)" value={data.frente.tipoRodado} onChange={(e) => updateFrente("tipoRodado", e.target.value)} fullWidth />
          <TextField label="Vencimiento (frente)" value={data.frente.vencimiento} onChange={(e) => updateFrente("vencimiento", e.target.value)} fullWidth />
          <TextField label="Nombre propietario (dorso)" value={data.dorso.nombre} onChange={(e) => updateDorso("nombre", e.target.value)} fullWidth />
          <TextField label="Apellido propietario (dorso)" value={data.dorso.apellido} onChange={(e) => updateDorso("apellido", e.target.value)} fullWidth />
          <TextField label="DNI propietario (dorso)" value={data.dorso.dni} onChange={(e) => updateDorso("dni", e.target.value)} fullWidth />
          <TextField label="Direccion propietario (dorso)" value={data.dorso.direccion} onChange={(e) => updateDorso("direccion", e.target.value)} fullWidth multiline minRows={2} />
        </Box>

        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}
      </Stack>
    </Paper>
  );
};

export default CedulaQrScanner;










































