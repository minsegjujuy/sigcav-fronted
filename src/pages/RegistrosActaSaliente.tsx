import {
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
} from "@mui/material";
import { useActaSaliente } from "../context/ActaSalienteContext";
import { useEffect, useState } from "react";
import { obtenerRegistrosActaSaliente } from "../services/RegistroActaSAlienteService";

export type EstadoActaSaliente =
  | "ENVIADA"
  | "DEVUELTA"
  | "REENVIADA"
  | "ARCHIVADA";

export interface RegistroActaSaliente {
  id: number;
  fecha: string;
  estado: EstadoActaSaliente;
  motivo: string;
}

/* ================= Componente ================= */

const ActaSalienteDetalle = () => {
    const {actaSeleccionada} = useActaSaliente();
    const [registros, setRegistros] = useState<RegistroActaSaliente[]>([]);

    const fetchRegistros = async () =>  {
        const data = await obtenerRegistrosActaSaliente(actaSeleccionada?.id!);
        setRegistros(data);
    }

    useEffect(()=>{
      fetchRegistros();
    },[])

  return (
    <Grid container spacing={3}>
      {/* ================= CARD ACTA ================= */}
      <Grid size={{xs:12}}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Acta Saliente #{actaSeleccionada?.id}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{xs:12, md:4}}>
                <Typography><strong>Lugar:</strong> {actaSeleccionada?.lugar}</Typography>
              </Grid>

              <Grid size={{xs:12, md:4}}>
                <Typography><strong>Fecha:</strong> {actaSeleccionada?.fecha}</Typography>
              </Grid>

              <Grid size={{xs:12, md:4}}>
                <Typography><strong>Juzgado:</strong> {actaSeleccionada?.juzgado}</Typography>
              </Grid>

              <Grid size={{xs:12, md:4}}>
                <Typography><strong>N° Acta:</strong> {actaSeleccionada?.nroActa}</Typography>
              </Grid>

              <Grid size={{xs:12, md:4}}>
                <Typography><strong>DNI:</strong> {actaSeleccionada?.dni}</Typography>
              </Grid>

              <Grid size={{xs:12, md:4}}>
                <Typography>
                  <strong>Infractor:</strong> {actaSeleccionada?.nombreInfractor}
                </Typography>
              </Grid>

              <Grid size={{xs:12, md:4}}>
                <Typography>
                  <strong>Retención:</strong> {actaSeleccionada?.retencion ? "Sí" : "No"}
                </Typography>
              </Grid>

              <Grid size={{xs:12, md:4}}>
                <Typography>
                  <strong>Descargo:</strong> {actaSeleccionada?.descargo ? "Sí" : "No"}
                </Typography>
              </Grid>

              <Grid size={{xs:12, md:4}}>
                <Typography>
                  <strong>Fojas:</strong> {actaSeleccionada?.cantidadFojas}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* ================= TABLA REGISTROS ================= */}
      <Grid size={{xs:12}}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Motivo</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {registros.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.fecha}</TableCell>
                  <TableCell>{r.estado}</TableCell>
                  <TableCell>{r.motivo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default ActaSalienteDetalle;
