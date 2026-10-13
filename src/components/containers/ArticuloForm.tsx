import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  MenuItem,
  Stack,
  Divider,
} from "@mui/material";
import type { ArticuloRequest } from "../../models/Articulo";

interface ArticuloFormProps {
  onSubmit: (articulo: ArticuloRequest) => void | Promise<void>;
  initialData?: ArticuloRequest;
}

const initialForm: ArticuloRequest = {
  idArt: null,
  velocidad: false,
  alcoholemia: false,
  unidadesFijas: 0,
  importe: 0,
  idLey: 0,
  enabled: true,
  nro: "",
  detalle: "",
};

export default function ArticuloForm({
  onSubmit,
  initialData,
}: ArticuloFormProps) {
  const [form, setForm] = useState<ArticuloRequest>(
    initialData ?? initialForm
  );

  const [loading, setLoading] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;

    const newValue =
      type === "checkbox"
        ? (event.target as HTMLInputElement).checked
        : ["unidadesFijas", "importe"].includes(name)
        ? value === ""
          ? null
          : Number(value)
        : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      await onSubmit(form);
    } catch (error) {
      console.error("Error al guardar artículo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {form.idArt ? "Editar artículo" : "Nuevo artículo"}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>

          {/* Número */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="Número de artículo"
              name="nro"
              value={form.nro}
              onChange={handleChange}
            />
          </Grid>

          {/* Ley */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              required
              label="Ley"
              name="idLey"
              value={form.idLey ?? ""}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  idLey: Number(event.target.value),
                }))
              }
            >
              <MenuItem value={1}>Ley 24.449</MenuItem>
              <MenuItem value={2}>Ley 6.082</MenuItem>
            </TextField>
          </Grid>

          {/* Detalle */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Detalle del artículo"
              name="detalle"
              value={form.detalle}
              onChange={handleChange}
            />
          </Grid>

          {/* Unidades fijas */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Unidades fijas"
              name="unidadesFijas"
              value={form.unidadesFijas ?? ""}
              onChange={handleChange}
              slotProps={{
                htmlInput: { min: 0, step: 1 },
              }}
            />
          </Grid>

          {/* Importe */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Importe ($)"
              name="importe"
              value={form.importe ?? ""}
              onChange={handleChange}
              slotProps={{
                htmlInput: { min: 0, step: "0.01" },
              }}
            />
          </Grid>

          {/* Opciones */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Configuración del artículo
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    name="velocidad"
                    checked={form.velocidad}
                    onChange={handleChange}
                  />
                }
                label="Velocidad"
              />

              <FormControlLabel
                control={
                  <Switch
                    name="alcoholemia"
                    checked={form.alcoholemia}
                    onChange={handleChange}
                  />
                }
                label="Alcoholemia"
              />

              <FormControlLabel
                control={
                  <Switch
                    name="enabled"
                    checked={form.enabled}
                    onChange={handleChange}
                  />
                }
                label="Habilitado"
              />
            </Stack>
          </Grid>

          {/* Botones */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => setForm(initialForm)}
                disabled={loading}
              >
                Limpiar
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar artículo"}
              </Button>
            </Stack>
          </Grid>

        </Grid>
      </Box>
    </Paper>
  );
}