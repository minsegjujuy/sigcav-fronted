import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import SignatureCanvas from "react-signature-canvas";

export interface FirmaCaptureProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
  height?: number;
  clearLabel?: string;
}

export interface FirmaCaptureHandle {
  getDataUrl: () => string | null;
  isEmpty: () => boolean;
  clear: () => void;
}

const MIN_WIDTH = 260;

const trimCanvas = (source: HTMLCanvasElement, padding = 8): HTMLCanvasElement => {
  const width = source.width;
  const height = source.height;
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;

  const { data } = ctx.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1 || maxY === -1) return source;

  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const right = Math.min(width - 1, maxX + padding);
  const bottom = Math.min(height - 1, maxY + padding);

  const trimmedWidth = Math.max(1, right - left + 1);
  const trimmedHeight = Math.max(1, bottom - top + 1);

  const out = document.createElement("canvas");
  out.width = trimmedWidth;
  out.height = trimmedHeight;

  const outCtx = out.getContext("2d");
  if (!outCtx) return source;
  outCtx.drawImage(source, left, top, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);
  return out;
};

const FirmaCapture = forwardRef<FirmaCaptureHandle, FirmaCaptureProps>(function FirmaCapture(
  { value, onChange, disabled = false, height = 180, clearLabel = "Limpiar" },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const lastAppliedValueRef = useRef<string | null>(null);
  const [width, setWidth] = useState<number>(MIN_WIDTH);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const next = Math.max(MIN_WIDTH, Math.floor(el.getBoundingClientRect().width || MIN_WIDTH));
      setWidth((prev) => (prev === next ? prev : next));
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => measure());
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const signatureStyle = useMemo(
    () => ({
      width: "100%",
      height,
      border: "1px solid rgba(0,0,0,0.23)",
      borderRadius: 8,
      backgroundColor: disabled ? "rgba(0,0,0,0.04)" : "#fff",
      touchAction: "none",
      opacity: disabled ? 0.8 : 1,
      pointerEvents: disabled ? ("none" as const) : ("auto" as const),
    }),
    [disabled, height],
  );

  const applyValueToCanvas = (dataUrl: string | null) => {
    const pad = signatureRef.current;
    if (!pad) return;

    pad.clear();
    if (dataUrl) {
      try {
        pad.fromDataURL(dataUrl, { ratio: 1, width, height });
      } catch {
        // Si el dataURL no es válido, no hacemos nada.
      }
    }
  };

  const getDataUrl = (): string | null => {
    const pad = signatureRef.current;
    if (!pad || pad.isEmpty()) return null;
    const canvas = pad.getCanvas();
    return trimCanvas(canvas).toDataURL("image/png");
  };

  useEffect(() => {
    if (lastAppliedValueRef.current === value) return;
    lastAppliedValueRef.current = value;
    applyValueToCanvas(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, width, height]);

  const handleEnd = () => {
    onChange(getDataUrl());
  };

  const handleClear = () => {
    signatureRef.current?.clear();
    onChange(null);
  };

  useImperativeHandle(
    ref,
    () => ({
      getDataUrl,
      isEmpty: () => signatureRef.current?.isEmpty() ?? true,
      clear: handleClear,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, height, disabled, value],
  );

  return (
    <Stack spacing={1.5}>
      <Box ref={containerRef}>
        <SignatureCanvas
          ref={(instance) => {
            signatureRef.current = instance;
          }}
          onEnd={handleEnd}
          canvasProps={{
            width,
            height,
            style: signatureStyle,
          }}
        />
      </Box>

      <Box>
        <Button variant="outlined" onClick={handleClear} disabled={disabled}>
          {clearLabel}
        </Button>
      </Box>
    </Stack>
  );
});

export default FirmaCapture;
