import { Typography, Divider, Grid, Paper, Box } from "@mui/material";
import type { HechoVialListDto } from "../models/HechoVialListDto";
import { ProtagonistaDetalle } from "./ProtagonistaDetalle";
import { BotonCopiarHechoVial } from "../components/containers/BotonCopiar";

interface Props {
  hecho: HechoVialListDto;
}

const Label = ({ label, value }: { label: string; value?: any }) => (
  <Typography variant="body2">
    <b>{label}:</b> {value ?? "—"}
  </Typography>
);

export const HechoVialDetalle = ({ hecho }: Props) => {
  const fecha = new Date(hecho.fecha);

  return (
    <Paper sx={{ p: 3 }}>
      {/* ENCABEZADO */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <BotonCopiarHechoVial hechoVial={hecho} />
      </Box>
      <Typography variant="h6" align="center">
        DESTACAMENTO
      </Typography>

      <Typography variant="subtitle1" align="center" sx={{ mt: 1 }}>
        INFORME: HECHO VIAL CON / SIN VÍCTIMA – DAÑOS MATERIALES
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* FECHA Y HORA */}
      <Grid container spacing={2}>
        <Grid size={6}>
          <Label label="FECHA" value={fecha.toLocaleDateString()} />
        </Grid>
        <Grid size={6}>
          <Label label="HORA" value={fecha.toLocaleTimeString()} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* UBICACION */}
      <Typography variant="subtitle2">UBICACIÓN DEL HECHO</Typography>
      <Grid container spacing={1}>
        <Grid size={12}>
          <Label label="Lugar" value={hecho.ruta} />
        </Grid>
        <Grid size={6}>
          <Label
            label="Coordenadas"
            value={`${hecho.ubicacionReq.lat}, ${hecho.ubicacionReq.lng}`}
          />
        </Grid>
        <Grid size={6}>
          <Label label="Ciudad / Localidad" value={hecho.ubicacionReq.localidad} />
        </Grid>
        <Grid size={6}>
          <Label label="Departamento" value={hecho.ubicacionReq.departamento} />
        </Grid>
        <Grid size={6}>
          <Label label="Unidad Regional" value={hecho.ubicacionReq.unidadRegional} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* DATOS GENERALES */}
      <Typography variant="subtitle2">DATOS GENERALES</Typography>
      <Grid container spacing={1}>
        <Grid size={4}>
          <Label label="Víctima fatal" value={hecho.victimaFatal} />
        </Grid>
        <Grid size={4}>
          <Label label="Daños materiales" value={hecho.danosMateriales} />
        </Grid>
        <Grid size={4}>
          <Label label="Zona" value={hecho.zona} />
        </Grid>
        <Grid size={6}>
          <Label label="Tipo de vía" value={hecho.tipoVia} />
        </Grid>
        <Grid size={6}>
          <Label label="Otro tipo de vía" value={hecho.tipoViaOtro} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* INVOLUCRADOS */}
      <Typography variant="subtitle2">INVOLUCRADOS</Typography>
      <Typography variant="body2">
        {hecho.involucrados.join(" – ")}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* CONDICIONES */}
      <Typography variant="subtitle2">CONDICIONES DE LA VÍA</Typography>
      <Grid container spacing={1}>
        <Grid size={6}>
          <Label label="Configuración" value={hecho.configuracionVia} />
        </Grid>
        <Grid size={6}>
          <Label label="Estado calzada" value={hecho.estadoCalzada} />
        </Grid>
        <Grid size={6}>
          <Label label="Estado físico" value={hecho.estadoFisicoCalzada} />
        </Grid>
        <Grid size={6}>
          <Label label="Material calzada" value={hecho.materialCalzada} />
        </Grid>
        <Grid size={6}>
          <Label label="Semáforo" value={hecho.semaforo} />
        </Grid>
        <Grid size={6}>
          <Label label="Luz artificial" value={hecho.luzArtificial} />
        </Grid>
        <Grid size={6}>
          <Label label="Estado ambiental" value={hecho.estadoAmbiental} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* SINIESTRO */}
      <Typography variant="subtitle2">SINIESTRO</Typography>
      <Grid container spacing={1}>
        <Grid size={6}>
          <Label label="Tipo de siniestro" value={hecho.tipoSiniestro} />
        </Grid>
        <Grid size={6}>
          <Label label="Tipo de colisión" value={hecho.tipoColision} />
        </Grid>
        <Grid size={6}>
          <Label
            label="Posibles causas"
            value={hecho.posiblesCausas.join(" – ")}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* SINTESIS */}
      <Typography variant="subtitle2">SÍNTESIS</Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {hecho.sintesis}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* PROTAGONISTAS */}
      {/* PROTAGONISTAS */}
      <Typography variant="h5" gutterBottom>
        Protagonistas
      </Typography>

      {hecho.protagonistas.map((p, index) => (
        <ProtagonistaDetalle key={index} protagonista={p} nro={index + 1} />
      ))}

      <Divider sx={{ my: 3 }} />

      {/* PIE */}
      <Typography variant="body2">
        PERSONAL INTERVINIENTE: {hecho.puesto}
      </Typography>
    </Paper>
  );
};
