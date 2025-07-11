import { useEffect, useState } from "react";
import type { ActaResumenDto } from "../models/ActaResumenDto";
import { getResumenActas } from "../services/ActaService";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

const ActaResumenTable: React.FC = () => {
  const [actas, setActas] = useState<ActaResumenDto[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getResumenActas();
        setActas(data);
      } catch (error) {
        console.error('Error al obtener resumen de actas', error);
      }
    };

    fetchData();
  }, []);

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>Resumen de Actas</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nro</TableCell>
            <TableCell>Grupo</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Motivo</TableCell>
            <TableCell>Retención</TableCell>
            <TableCell>Infractor</TableCell>
            <TableCell>Vehículo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {actas.map((acta, index) => (
            <TableRow key={index}>
              <TableCell>{acta.nro}</TableCell>
              <TableCell>{acta.grupo}</TableCell>
              <TableCell>{new Date(acta.fecha).toLocaleString()}</TableCell>
              <TableCell>{acta.motivo}</TableCell>
              <TableCell>{acta.retencion}</TableCell>
              <TableCell>{`${acta.nombre} ${acta.apellidor}`}</TableCell>
              <TableCell>{`${acta.marcaVehiculo} ${acta.modeloVehiculo} ${acta.año} - ${acta.dominio}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ActaResumenTable;