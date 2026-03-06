import { useEffect, useMemo, useState } from 'react';
import Tesseract from 'tesseract.js';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

interface FormData {
  dominio: string;
  apellido: string;
  documento: string;
}

const initialFormData: FormData = {
  dominio: '',
  apellido: '',
  documento: '',
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const cleanLine = (value: string) => value.replace(/\s+/g, ' ').trim();

const getNextRealValue = (lines: string[], startIndex: number): string => {
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = cleanLine(lines[i]);
    if (!line) continue;
    if (/APELLIDO|SURNAME|DOCUMENTO|DOCUMENT|DOMINIO/i.test(line)) continue;
    return line;
  }
  return '';
};

const formatDocumento = (digits: string): string => {
  const onlyDigits = digits.replace(/\D/g, '');
  if (!onlyDigits) return '';
  const normalizedDigits = onlyDigits.length >= 8 ? onlyDigits.slice(0, 8) : onlyDigits.padStart(8, '0');
  return `${normalizedDigits.slice(0, 2)}.${normalizedDigits.slice(2, 5)}.${normalizedDigits.slice(5, 8)}`;
};

const extractDniCandidates = (text: string): string[] => {
  const cleanText = text.replace(/\b\d{11}\b/g, ' ');
  const candidates = new Set<string>();

  const dottedFull = cleanText.match(/\b\d{1,2}\.\d{3}\.\d{3}\b/g) ?? [];
  dottedFull.forEach((value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 8) candidates.add(digits);
  });

  const splitDotted = cleanText.match(/\b\d{1,2}\s+\d{3}\.\d{3}\b/g) ?? [];
  splitDotted.forEach((value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 8) candidates.add(digits);
  });

  const trailingDotted = [...cleanText.matchAll(/\b(\d{3})\.(\d{3})\b/g)];
  trailingDotted.forEach((match) => {
    const sixDigits = `${match[1]}${match[2]}`;
    const start = match.index ?? 0;
    const prefixWindow = cleanText.slice(Math.max(0, start - 24), start);
    const prefix = prefixWindow.match(/(\d{1,2})\D*$/)?.[1] ?? '';
    if (prefix) {
      const digits = `${prefix}${sixDigits}`.replace(/\D/g, '');
      if (digits.length >= 7 && digits.length <= 8) candidates.add(digits);
    }

    // Heuristica OCR: "4204" arriba + "045.742" abajo => "42045742".
    const fourDigitPrefix = prefixWindow.match(/(\d{4})\D*$/)?.[1] ?? '';
    if (fourDigitPrefix && sixDigits.length === 6) {
      const overlap = sixDigits.slice(0, 2);
      if (fourDigitPrefix.endsWith(overlap)) {
        const reconstructed = `${fourDigitPrefix.slice(0, 2)}${sixDigits}`;
        if (reconstructed.length === 8) {
          candidates.add(reconstructed);
        }
      }
    }
  });

  const plain = cleanText.match(/\b\d{7,8}\b/g) ?? [];
  plain.forEach((value) => candidates.add(value));

  return [...candidates];
};

const scoreDocumentoCandidate = (value: string, nearLabelValues: string[]): number => {
  const n = Number(value);
  let score = 0;

  if (nearLabelValues.includes(value)) score += 120;
  if (value.length === 8) score += 45;
  if (n >= 5000000 && n <= 80000000) score += 30;
  if (/^0\d{7}$/.test(value)) score -= 20;
  if (/^(19|20)\d{6}$/.test(value)) score -= 50;

  return score;
};

const parseDocumentDataFromOcr = (rawText: string, numericFallbackText?: string): Partial<FormData> => {
  const normalized = normalizeText(rawText);
  const lines = normalized.split(/\r?\n/).map((line) => cleanLine(line)).filter(Boolean);

  const result: Partial<FormData> = {};

  const apellidoIndex = lines.findIndex((line) => /APEL+IDO|SURNAME/.test(line));
  if (apellidoIndex !== -1) {
    const surname = getNextRealValue(lines, apellidoIndex)
      .replace(/[^A-Z\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (surname) {
      result.apellido = surname;
    }
  }

  const dominioMatch = normalized.match(/DOMINIO\s*[:.]?\s*([A-Z0-9]{6,9})/);
  if (dominioMatch) {
    result.dominio = dominioMatch[1].replace(/[^A-Z0-9]/g, '');
  }

  const docLabelIndex = lines.findIndex((line) => /DOCUMENTO|DOCUMENT/.test(line));
  const nearDocumentText =
    docLabelIndex >= 0
      ? lines.slice(Math.max(0, docLabelIndex - 1), Math.min(lines.length, docLabelIndex + 6)).join(' ')
      : '';

  const nearCandidates = extractDniCandidates(nearDocumentText);
  const allCandidates = [
    ...extractDniCandidates(normalized),
    ...extractDniCandidates(normalizeText(numericFallbackText ?? '')),
  ];
  const uniqueCandidates = [...new Set(allCandidates)];

  if (uniqueCandidates.length > 0) {
    const best = uniqueCandidates
      .map((candidate) => ({
        candidate,
        score: scoreDocumentoCandidate(candidate, nearCandidates),
      }))
      .sort((a, b) => b.score - a.score)[0]?.candidate;

    if (best) {
      result.documento = formatDocumento(best);
    }
  }

  return result;
};

const preprocessImageForOcr = async (file: File): Promise<Blob> => {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo crear contexto de canvas.');

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const contrast = gray > 128 ? 255 : gray * 0.8;
      data[i] = contrast;
      data[i + 1] = contrast;
      data[i + 2] = contrast;
    }

    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => {
        if (!value) {
          reject(new Error('No se pudo convertir imagen preprocesada.'));
          return;
        }
        resolve(value);
      }, 'image/png');
    });

    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const DocumentDataCapture = () => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loadingExtraction, setLoadingExtraction] = useState(false);
  const [scanError, setScanError] = useState('');
  const [photoVerified, setPhotoVerified] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const imagePreview = useMemo(() => {
    if (!photoFile) return '';
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const onFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setPhotoVerified(false);
  };

  const tryExtractFromImage = async (file: File) => {
    setLoadingExtraction(true);
    setScanError('');

    try {
      const preprocessed = await preprocessImageForOcr(file);

      const [generalResult, numbersResult] = await Promise.all([
        Tesseract.recognize(preprocessed, 'spa+eng'),
        Tesseract.recognize(preprocessed, 'eng'),
      ]);

      const generalText = generalResult.data.text;
      const numbersText = numbersResult.data.text;
      const parsed = parseDocumentDataFromOcr(generalText, numbersText);

      setFormData((prev) => ({
        ...prev,
        ...parsed,
      }));

      console.log('OCR texto detectado:', generalText);
      console.log('OCR numeros detectados:', numbersText);
      console.log('Campos extraidos:', parsed);

      if (!parsed.dominio && !parsed.apellido && !parsed.documento) {
        setScanError('No se detectaron DOMINIO, Apellido/Surname o Documento/Document.');
      }
    } catch {
      setScanError('No se pudo extraer texto de la imagen.');
    } finally {
      setLoadingExtraction(false);
    }
  };

  const onPhotoChange = async (file?: File) => {
    const selected = file ?? null;
    setPhotoFile(selected);
    setPhotoVerified(false);
    if (!selected) return;
    await tryExtractFromImage(selected);
  };

  const canVerify = Boolean(photoFile);

  const onVerifyPhoto = () => {
    if (!canVerify || !photoFile) return;
    setPhotoVerified(true);
    console.log('Datos verificados:', {
      dominio: formData.dominio,
      apellido: formData.apellido,
      documento: formData.documento,
      foto: {
        nombreArchivo: photoFile.name,
        tamanoBytes: photoFile.size,
        tipo: photoFile.type,
      },
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Captura OCR de documento</Typography>

        <Box>
          <Button component="label" variant="outlined" disabled={loadingExtraction}>
            Seleccionar foto
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => void onPhotoChange(e.target.files?.[0])}
            />
          </Button>
        </Box>

        {loadingExtraction && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2">Extrayendo DOMINIO / APELLIDO / DOCUMENTO...</Typography>
          </Stack>
        )}

        {imagePreview && (
          <Box
            component="img"
            src={imagePreview}
            alt="Vista previa del documento"
            sx={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 1,
              border: '1px solid #ddd',
            }}
          />
        )}

        {scanError && <Alert severity="warning">{scanError}</Alert>}

        <TextField
          label="DOMINIO"
          value={formData.dominio}
          onChange={(e) => onFieldChange('dominio', e.target.value)}
        />

        <TextField
          label="Apellido / Surname"
          value={formData.apellido}
          onChange={(e) => onFieldChange('apellido', e.target.value)}
        />

        <TextField
          label="Documento / Document"
          value={formData.documento}
          onChange={(e) => onFieldChange('documento', e.target.value)}
        />

        {photoVerified && (
          <Alert severity="success">Foto verificada. Se enviaron los datos a la consola.</Alert>
        )}

        <Button
          variant="contained"
          onClick={onVerifyPhoto}
          disabled={!canVerify || loadingExtraction}
          sx={{ width: 'fit-content' }}
        >
          Verificar foto
        </Button>
      </Stack>
    </Paper>
  );
};

export default DocumentDataCapture;

