import { Button, Grid, IconButton, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Controller, useFieldArray, type Control, type FieldErrors } from "react-hook-form";
import type { HechoVialForm } from "../models/HechoVialForm";

interface PersonalUnidadProps {
  control: Control<HechoVialForm>;
  unidadIndex: number;
  errors: FieldErrors<HechoVialForm>;
}

const getErrorMessage = (errors: FieldErrors<HechoVialForm>, path: string) => {
  let current: unknown = errors;
  for (const key of path.split(".")) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  if (current && typeof current === "object" && "message" in current) {
    return String((current as { message?: unknown }).message ?? "") || undefined;
  }
  return undefined;
};

export function PersonalUnidad({ control, unidadIndex, errors }: PersonalUnidadProps) {
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
        <Grid container spacing={2} key={field.id} sx={{ mb: 1, pl: 1 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name={`unidades.${unidadIndex}.personal.${index}.nombre`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre"
                  fullWidth
                  error={!!getErrorMessage(errors, `unidades.${unidadIndex}.personal.${index}.nombre`)}
                  helperText={getErrorMessage(errors, `unidades.${unidadIndex}.personal.${index}.nombre`)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name={`unidades.${unidadIndex}.personal.${index}.jerarquia`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Jerarquía"
                  fullWidth
                  error={!!getErrorMessage(errors, `unidades.${unidadIndex}.personal.${index}.jerarquia`)}
                  helperText={getErrorMessage(errors, `unidades.${unidadIndex}.personal.${index}.jerarquia`)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name={`unidades.${unidadIndex}.personal.${index}.observacion`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Observación"
                  fullWidth
                  error={!!getErrorMessage(errors, `unidades.${unidadIndex}.personal.${index}.observacion`)}
                  helperText={getErrorMessage(errors, `unidades.${unidadIndex}.personal.${index}.observacion`)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 1 }} display="flex" alignItems="center" justifyContent="center">
            <IconButton color="error" onClick={() => remove(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Grid size={{ xs: 12 }}>
        <Button variant="outlined" onClick={() => append({ nombre: "", jerarquia: "", observacion: "" })}>
          Agregar personal a esta unidad
        </Button>
      </Grid>
    </Grid>
  );
}
