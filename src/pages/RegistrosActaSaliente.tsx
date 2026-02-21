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
  Box,
  Chip,
  Divider,
} from "@mui/material";
import { useActaSaliente } from "../context/ActaSalienteContext";
import { useEffect, useState } from "react";
import { obtenerRegistrosActaSaliente } from "../services/RegistroActaSAlienteService";
import AssignmentIcon from '@mui/icons-material/Assignment';

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

      {/* ================= SECCIÓN DETALLES (Actas Detalle) ================= */}
      <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" /> Detalle de Infracciones (Actas)
        </Typography>
        
        <Grid container spacing={2}>
          {actaSeleccionada?.actas && actaSeleccionada.actas.length > 0 ? (
            actaSeleccionada.actas.map((detalle, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card variant="outlined" sx={{ bgcolor: '#fafafa', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        Nro. Acta: {detalle.nroActa}
                      </Typography>
                      <Chip 
                        label={detalle.tipo} 
                        size="small" 
                        color="info" 
                        variant="filled" 
                      />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Fecha:</strong> {new Date(detalle.fechaActa).toLocaleString('es-AR')}
                    </Typography>

                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      <strong>Articulado:</strong><br />
                      {detalle.articulado}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                No hay actas de detalle registradas.
              </Typography>
            </Grid>
          )}
        </Grid>
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
