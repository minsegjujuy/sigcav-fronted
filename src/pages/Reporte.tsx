import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ReportePorDia from "./ReportePorDia";
import type { ParamsDate } from "../models/ParamsDate";

const Reporte = () => {
  const [fechaInicio, setFechaInicio] = useState<Dayjs | null>(dayjs());
  const [fechaFin, setFechaFin] = useState<Dayjs | null>(dayjs());
  const [params, setParams] = useState<ParamsDate>();

  const handleFilter = () => {
    const fi  = fechaInicio?.format('YYYY-MM-DD HH:mm:ss');
    const ff = fechaFin?.format('YYYY-MM-DD HH:mm:ss')
    console.log('fechas ', fi , ' ' , ff);
    setParams({fechaInicio: fi!, fechaFin: ff!});
  }

  return (
    <>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                gap={2}
                sx={{ p: 3, width: "300px" }}
            >
                <Typography variant="h6">Seleccionar rango de fechas</Typography>

                <DatePicker
                label="Fecha inicio"
                format="YYYY-MM-DD HH:mm:ss"
                value={fechaInicio}
                onChange={(newValue) => setFechaInicio(newValue)}
                slotProps={{
                    textField: {
                    fullWidth: true,
                    variant: "outlined",
                    },
                }}
                />

                <DatePicker
                label="Fecha fin"
                value={fechaFin}
                format="YYYY-MM-DD"
                onChange={(newValue) => setFechaFin(newValue)}
                slotProps={{
                    textField: {
                    fullWidth: true,
                    variant: "outlined",
                    },
                }}
                />
            </Box>
            </LocalizationProvider>
            <button onClick={handleFilter}>Ver informe</button>
            <ReportePorDia fechaFin={params?.fechaFin!} fechaInicio={params?.fechaInicio!}/>
            
    </>
  );
};

export default Reporte;

