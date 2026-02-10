import { Controller, useFieldArray, type Control } from "react-hook-form";
import type { HechoVialForm } from "../models/HechoVialForm";
import { Button, Grid, IconButton, TextField, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

// =====================
// Componente hijo: Personal por unidad
// =====================
interface PersonalUnidadProps {
  control: Control<HechoVialForm>;
  unidadIndex: number;
}

export function PersonalUnidad({ control, unidadIndex }: PersonalUnidadProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `unidades.${unidadIndex}.personal` as const,
  });

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1">Personal interviniente</Typography>
      </Grid>

      {fields.map((field, index) => (
        <Grid
          container
          spacing={2}
          key={field.id}
          sx={{ mb: 1, pl: 1 }}
        >
          <Grid size={{ xs: 12, md:4 }}>
            <Controller
              name={`unidades.${unidadIndex}.personal.${index}.nombre`}
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Nombre" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name={`unidades.${unidadIndex}.personal.${index}.jerarquia`}
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Jerarquía" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md:4 }}>
            <Controller
              name={`unidades.${unidadIndex}.personal.${index}.observacion`}
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Observación" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 1 }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <IconButton color="error" onClick={() => remove(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Grid size={{ xs: 12}}>
        <Button
          variant="outlined"
          onClick={() => append({ nombre: "", jerarquia: "", observacion: "" })}
        >
          Agregar personal a esta unidad
        </Button>
      </Grid>
    </Grid>
  );
}
