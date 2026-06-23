import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { IndicadoresActaDto } from "../../models/IndicadoresActaDto";

interface IndicadoresActaTableProps {
  indicadores: IndicadoresActaDto;
}

const IndicadoresActas: React.FC<IndicadoresActaTableProps> = ({
  indicadores,
}) => {
  const rows = [
    {
      concepto: "Actas con alcoholemia",
      cantidad: indicadores.cantidadAlcoholemia,
    },
    {
      concepto: "Actas con velocidad",
      cantidad: indicadores.cantidadVelocidad,
    },
    {
      concepto: "Actas sin alcoholemia ni velocidad",
      cantidad: indicadores.cantidadOtros,
    },
  ];

  return (
    <TableContainer component={Paper}>
      <Typography
        variant="h6"
        sx={{ p: 2, fontWeight: "bold" }}
      >
        Indicadores de Actas
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Concepto</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Cantidad</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.concepto}>
              <TableCell>{row.concepto}</TableCell>
              <TableCell align="right">
                {row.cantidad}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IndicadoresActas;