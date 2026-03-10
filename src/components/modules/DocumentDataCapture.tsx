import { useEffect, useMemo, useRef, useState } from 'react';
import { Paper, Stack, Typography, Box, CircularProgress, Alert, Button, IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import type { VehiculoSolicitud } from '../../models/VehiculoSolicitud';
import { processCedulaImage } from '../../utilities/preprocessImage';
import { OcrService } from '../../services/OcrService';
import type { OcrDocumentType } from '../../services/OcrService';
import PhotoPicker from './PhotoPicker';

interface DocumentDataCaptureProps {
  titulo: string;
  tipo: OcrDocumentType;
  onDataCaptured?: (data: unknown, tipo: OcrDocumentType) => void;
  onVehiculoDetected?: (vehiculo: VehiculoSolicitud) => void;
}

const defaultCrop: Crop = {
  unit: '%',
  x: 10,
  y: 10,
  width: 80,
  height: 60,
};

const DocumentDataCapture = ({ titulo, tipo, onDataCaptured, onVehiculoDetected }: DocumentDataCaptureProps) => {
  const [loadingExtraction, setLoadingExtraction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>(defaultCrop);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const imagePreview = useMemo(() => {
    if (!selectedFile) return '';
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const onPhotoChange = async (file: File) => {
    setError(null);
    setSelectedFile(file);
    setCrop(defaultCrop);
    setCompletedCrop(null);
    imageRef.current = null;
  };

  const clearSelectedImage = () => {
    setSelectedFile(null);
    setCrop(defaultCrop);
    setCompletedCrop(null);
    imageRef.current = null;
  };

  const processByType: Record<OcrDocumentType, (file: File) => Promise<unknown>> = {
    cedulaFrente: (file) => OcrService.procesarCedulaFrente(file),
    cedulaDorso: (file) => OcrService.procesarCedulaDorso(file),
    dniFrente: (file) => OcrService.procesarDniFrente(file),
    dniDorso: (file) => OcrService.procesarDniDorso(file),
    licNacFrente: (file) => OcrService.procesarLicNacFrente(file),
    licNacDorso: (file) => OcrService.procesarLicNacDorso(file),
  };

  const handleProcessImage = async () => {
    if (!selectedFile || !completedCrop || !imageRef.current) return;

    setLoadingExtraction(true);
    setError(null);

    try {
      const img = imageRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const cropData = {
        x: Math.max(0, Math.round(completedCrop.x * scaleX)),
        y: Math.max(0, Math.round(completedCrop.y * scaleY)),
        width: Math.max(1, Math.round(completedCrop.width * scaleX)),
        height: Math.max(1, Math.round(completedCrop.height * scaleY)),
      };

      const processedFile = await processCedulaImage(selectedFile, cropData);
      const ocrResult = await processByType[tipo](processedFile);

      onDataCaptured?.(ocrResult, tipo);

      if (tipo === 'cedulaFrente' && onVehiculoDetected) {
        onVehiculoDetected(ocrResult as VehiculoSolicitud);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo procesar el documento. Asegurate de que la foto sea clara.');
    } finally {
      setLoadingExtraction(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Captura OCR de {titulo}</Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ position: 'relative' }}>
          <PhotoPicker disabled={loadingExtraction} onFileSelected={onPhotoChange} />
          {loadingExtraction && (
            <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%' }} />
          )}
        </Box>

        {imagePreview && (
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 640, borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
            <IconButton
              size="small"
              onClick={clearSelectedImage}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 2,
                bgcolor: 'rgba(0,0,0,0.55)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>

            <ReactCrop crop={crop} onChange={(nextCrop) => setCrop(nextCrop)} onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}>
              <img
                ref={imageRef}
                src={imagePreview}
                alt="Vista previa"
                style={{ width: '100%', display: 'block', maxHeight: 460, objectFit: 'contain' }}
              />
            </ReactCrop>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={() => void handleProcessImage()}
          disabled={!selectedFile || !completedCrop || loadingExtraction}
          sx={{ width: 'fit-content' }}
        >
          Procesar imagen
        </Button>
      </Stack>
    </Paper>
  );
};

export default DocumentDataCapture;
