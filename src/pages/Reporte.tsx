import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ReportePorDia from "./ReportePorDia";
import type { ParamsDate } from "../models/ParamsDate";
import ReporteInfracciones from "./ReporteInfracciones";

const Reporte: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState<Dayjs | null>(dayjs());
  const [fechaFin, setFechaFin] = useState<Dayjs | null>(dayjs());
  const [params, setParams] = useState<ParamsDate | null>(null);

  const handleFilter = () => {
    if (!fechaInicio || !fechaFin) {
      // validar
      console.warn("Faltan fechas");
      return;
    }

    // Formatea como quiera tu backend. Aquí uso 'YYYY-MM-DD HH:mm:ss'
    const fi = fechaInicio.format("YYYY-MM-DDTHH:mm:ssZ");
    const ff = fechaFin.format("YYYY-MM-DDTHH:mm:ssZ");

    console.log("Enviando fechas:", fi, ff);
    setParams({ fechaInicio: fi, fechaFin: ff });
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" flexDirection="column" gap={2} sx={{ p: 3, width: 320 }}>
          <Typography variant="h6">Seleccionar rango de fechas</Typography>

          <DatePicker
            label="Fecha inicio"
            value={fechaInicio}
            onChange={(newValue) => setFechaInicio(newValue)}
            slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
          />

          <DatePicker
            label="Fecha fin"
            value={fechaFin}
            onChange={(newValue) => setFechaFin(newValue)}
            slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
          />

          <Button variant="contained" onClick={handleFilter}>
            Ver informe
          </Button>
        </Box>
      </LocalizationProvider>

      {/* Paso las fechas formateadas; si no hay params, paso strings vacíos */}
      <ReportePorDia
        fechaInicio={params?.fechaInicio ?? ""}
        fechaFin={params?.fechaFin ?? ""}
      />
      <ReporteInfracciones
        fechaInicio={params?.fechaInicio ?? ""}
        fechaFin={params?.fechaFin ?? ""}
      />
    </>
  );
};

export default Reporte;

