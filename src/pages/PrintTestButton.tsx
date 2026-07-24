import React, { useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { getLocalPrinters, sendZpl } from "../services/BluetoothService";

const TEST_ZPL = `
^XA
^CF0,40
^FO40,40^FDPRUEBA ZEBRA^FS
^FO40,90^FDHola desde React^FS
^XZ
`.trim();
const PrintTestButton: React.FC = () => {
  const [status, setStatus] = useState("");

  const handleDetect = async () => {
    try {
      const devices = await getLocalPrinters();
      if (!devices.length) {
        setStatus("No se detectaron impresoras.");
        return;
      }
      setStatus(`Impresoras detectadas: ${devices.map(d => d.name).join(", ")}`);
    } catch (error) {
      console.error(error);
      setStatus("No se pudo detectar Browser Print o las impresoras.");
    }
  };

  const handlePrint = async () => {
    try {
      setStatus("Enviando prueba a la impresora...");
      await sendZpl(TEST_ZPL);
      setStatus("Impresión enviada correctamente.");
    } catch (error) {
      console.error(error);
      setStatus("Error al imprimir.");
    }
  };

  return (
    <Stack spacing={2}>
      <Button variant="outlined" onClick={handleDetect}>
        Detectar impresora
      </Button>

      <Button variant="contained" onClick={handlePrint}>
        Imprimir prueba
      </Button>

      <Typography>{status}</Typography>
    </Stack>
  );
};

export default PrintTestButton;