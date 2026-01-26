import { Divider, Grid, Paper, Typography } from "@mui/material";
import type { Protagonista } from "../models/HechoVialForm";
import { AcompananteDetalle } from "./AcompananteDetalle";

interface ProtagonistaProps {
  protagonista: Protagonista;
  nro: number;
}

export const ProtagonistaDetalle = ({ protagonista, nro }: ProtagonistaProps) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6">
        {nro}º Protagonista – {protagonista.tipoRodado}
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Grid container spacing={2}>
        <Grid size={4}><strong>Dominio:</strong> {protagonista.dominio}</Grid>
        <Grid size={4}><strong>Marca:</strong> {protagonista.marca}</Grid>
        <Grid size={4}><strong>Modelo:</strong> {protagonista.modelo}</Grid>
        <Grid size={4}><strong>Color:</strong> {protagonista.color}</Grid>
        <Grid size={4}><strong>Asegurado:</strong> {String(protagonista.asegurado)}</Grid>
        <Grid size={4}><strong>RTO:</strong> {String(protagonista.rto)}</Grid>
        <Grid size={4}><strong>Cédula:</strong> {String(protagonista.cedula)}</Grid>
        <Grid size={4}><strong>Airbag:</strong> {String(protagonista.airbagActivado)}</Grid>
        <Grid size={4}><strong>Uso Seguridad:</strong> {String(protagonista.usoSeguridad)}</Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1">Conductor</Typography>
      <Grid container spacing={2}>
        <Grid size={6}><strong>Nombre:</strong> {protagonista.conductorNombre}</Grid>
        <Grid size={6}><strong>Género:</strong> {protagonista.conductorGenero}</Grid>
        <Grid size={6}><strong>DNI:</strong> {protagonista.conductorDni}</Grid>
        <Grid size={6}><strong>Nacionalidad:</strong> {protagonista.conductorNacionalidad}</Grid>
        <Grid size={6}><strong>Edad:</strong> {protagonista.conductorEdad}</Grid>
        <Grid size={6}><strong>Licencia:</strong> {protagonista.licenciaNro}</Grid>
        <Grid size={6}><strong>Clase:</strong> {protagonista.licenciaClase}</Grid>
        <Grid size={6}><strong>Estado:</strong> {protagonista.licenciaEstado}</Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1">Salud y Alcohol</Typography>
      <Grid container spacing={2}>
        <Grid size={6}><strong>Traslado:</strong> {protagonista.trasladoConductor}</Grid>
        <Grid size={6}><strong>Alcohol:</strong> {protagonista.graduacionAlcoholica}</Grid>
        <Grid size={6}><strong>Acta:</strong> {protagonista.actaComprobacionNro}</Grid>
      </Grid>

      {protagonista.acompanantes?.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">Acompañantes</Typography>

          {protagonista.acompanantes.map((a, idx) => (
            <AcompananteDetalle key={idx} acompanante={a} nro={idx + 1} />
          ))}
        </>
      )}
    </Paper>
  );
};
