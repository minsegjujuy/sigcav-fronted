import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

interface PhotoPickerProps {
  disabled?: boolean;
  onFileSelected: (file: File) => void | Promise<void>;
}

const PhotoPicker = ({ disabled = false, onFileSelected }: PhotoPickerProps) => {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const storageInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Este dispositivo no soporta acceso directo a la camara desde el navegador.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraError('');
    } catch {
      setCameraError('No se pudo acceder a la camara. Revisá permisos del navegador.');
    }
  };

  useEffect(() => {
    if (isCameraOpen) {
      void startCamera();
      return;
    }

    stopCamera();

    return () => {
      stopCamera();
    };
  }, [isCameraOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    void onFileSelected(selectedFile);
    event.target.value = '';
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92);
    });

    if (!blob) return;

    const file = new File([blob], `captura-${Date.now()}.jpg`, { type: 'image/jpeg' });
    await onFileSelected(file);
    setIsCameraOpen(false);
  };

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button variant="contained" disabled={disabled} onClick={() => setIsCameraOpen(true)}>
          Tomar foto
        </Button>
        <Button
          variant="outlined"
          disabled={disabled}
          onClick={() => storageInputRef.current?.click()}
        >
          Subir desde almacenamiento
        </Button>
      </Stack>

      <Dialog open={isCameraOpen} onClose={() => setIsCameraOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Tomar foto</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {cameraError && <Alert severity="warning">{cameraError}</Alert>}

            <Box
              sx={{
                width: '100%',
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: '#000',
                minHeight: 220,
              }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                autoPlay
                style={{ width: '100%', display: 'block' }}
              />
            </Box>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCameraOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled}
            variant="outlined"
          >
            Usar selector de camara
          </Button>
          <Button onClick={() => void handleCapture()} variant="contained" disabled={disabled}>
            Capturar
          </Button>
        </DialogActions>
      </Dialog>

      <input
        ref={cameraInputRef}
        hidden
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />
      <input
        ref={storageInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </>
  );
};

export default PhotoPicker;
