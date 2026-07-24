import { Grid, Paper, Typography } from "@mui/material";
import type { Acompanante } from "../models/HechoVialForm";

interface AcompananteProps {
  acompanante: Acompanante;
  nro: number;
}

export const AcompananteDetalle = ({ acompanante, nro }: AcompananteProps) => (
  <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
    <Typography variant="subtitle2">
      {nro}º Acompañante
    </Typography>

    <Grid container spacing={2}>
      <Grid size={6}><strong>Nombre:</strong> {acompanante.nombre}</Grid>
      <Grid size={6}><strong>Género:</strong> {acompanante.genero}</Grid>
      <Grid size={6}><strong>Nacionalidad:</strong> {acompanante.nacionalidad}</Grid>
      <Grid size={6}><strong>Provincia:</strong> {acompanante.provincia}</Grid>
      <Grid size={6}>
        <strong>Documento:</strong> {acompanante.tipo} {acompanante.numeroDocumento}
      </Grid>
      <Grid size={6}><strong>Edad:</strong> {acompanante.edad}</Grid>
      <Grid size={6}><strong>Cinturón/Casco:</strong> {String(acompanante.usoCinturonCasco)}</Grid>
      <Grid size={6}><strong>Retención:</strong> {String(acompanante.dispositivoRetencion)}</Grid>
      <Grid size={6}><strong>Traslado:</strong> {acompanante.trasladado}</Grid>
      <Grid size={6}><strong>Estado Salud:</strong> {acompanante.estadoSalud}</Grid>
    </Grid>
  </Paper>
);
