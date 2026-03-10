import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Box, Typography } from "@mui/material";

interface ScannerProps {
  onScan: (result: string) => void;
}

export const BarcodeScanner: React.FC<ScannerProps> = ({ onScan }) => {

  useEffect(() => {

    const scanner = new Html5QrcodeScanner(
      "scanner",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      (error) => {
        console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };

  }, []);

  return (
    <Box>
      <Typography variant="h6">
        Escanear código
      </Typography>

      <div id="scanner" />
    </Box>
  );
};