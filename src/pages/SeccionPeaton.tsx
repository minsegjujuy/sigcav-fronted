import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Controller, useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import type { HechoVialForm, Peaton } from "../models/HechoVialForm";

type SeccionPeatonProps = {
  control: Control<HechoVialForm>;
  register: UseFormRegister<HechoVialForm>;
};

const BooleanRadioField = ({ field }: { field: { value: boolean; onChange: (value: boolean) => void } }) => (
  <RadioGroup
    row
    value={String(Boolean(field.value))}
    onChange={(_, value) => field.onChange(value === "true")}
  >
    <FormControlLabel value="true" control={<Radio />} label="Sí" />
    <FormControlLabel value="false" control={<Radio />} label="No" />
  </RadioGroup>
);

export const SeccionPeaton = ({ control, register }: SeccionPeatonProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "peatones",
  });

  return (
    <Box sx={{ mt: 3, p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Peatones
        </Typography>

        <Button
          variant="outlined"
          size="small"
          startIcon={<PersonAddIcon />}
          onClick={() =>
            append({
              nombre: "",
              genero: "",
              nacionalidad: "",
              provincia: "",
              domicilio: "",
              localidad: "",
              tipo: "DNI",
              numeroDocumento: "",
              fechaNacimiento: "",
              edad: "",
              dispositivoRetencion: false,
              trasladado: "",
              estadoSalud: "",
            } as Peaton)
          }
        >
          Agregar peatón
        </Button>
      </Box>

      {fields.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
          No hay peatones cargados.
        </Typography>
      ) : null}

      {fields.map((field, index) => (
        <Paper key={field.id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {index + 1}º Peatón
              </Typography>
              <Button color="error" size="small" startIcon={<DeleteIcon />} onClick={() => remove(index)}>
                Quitar
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Nombre y apellido"
                {...register(`peatones.${index}.nombre`)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Controller
                name={`peatones.${index}.genero`}
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Género">
                    <MenuItem value="M">M</MenuItem>
                    <MenuItem value="F">F</MenuItem>
                    <MenuItem value="OTRO">OTRO</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name={`peatones.${index}.nacionalidad`}
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Nacionalidad">
                    <MenuItem value="ARGENTINA">Argentina</MenuItem>
                    <MenuItem value="CHILENA">Chilena</MenuItem>
                    <MenuItem value="BOLIVIANA">Boliviana</MenuItem>
                    <MenuItem value="PARAGUAYA">Paraguaya</MenuItem>
                    <MenuItem value="BRASILERA">Brasilera</MenuItem>
                    <MenuItem value="PERUANA">Peruana</MenuItem>
                    <MenuItem value="VENEZOLANA">Venezolana</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Provincia" {...register(`peatones.${index}.provincia`)} />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Domicilio" {...register(`peatones.${index}.domicilio`)} />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Localidad" {...register(`peatones.${index}.localidad`)} />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Controller
                name={`peatones.${index}.tipo`}
                control={control}
                defaultValue="DNI"
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Tipo doc.">
                    <MenuItem value="DNI">DNI</MenuItem>
                    <MenuItem value="LC">LC</MenuItem>
                    <MenuItem value="LE">LE</MenuItem>
                    <MenuItem value="CI">CI</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Número documento" {...register(`peatones.${index}.numeroDocumento`)} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de nacimiento"
                InputLabelProps={{ shrink: true }}
                {...register(`peatones.${index}.fechaNacimiento`)}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <TextField fullWidth label="Edad" {...register(`peatones.${index}.edad`)} />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">¿Dispositivo de retención?</FormLabel>
                <Controller
                  name={`peatones.${index}.dispositivoRetencion`}
                  control={control}
                  defaultValue={false}
                  render={({ field }) => <BooleanRadioField field={field} />}
                />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Traslado"
                placeholder="Ej.: Sí, al hospital ..."
                multiline
                minRows={2}
                {...register(`peatones.${index}.trasladado`)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name={`peatones.${index}.estadoSalud`}
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Estado de salud">
                    <MenuItem value="SIN LESIONES">Sin lesiones</MenuItem>
                    <MenuItem value="HERIDO LEVE">Herido leve</MenuItem>
                    <MenuItem value="HERIDO GRAVE">Herido grave</MenuItem>
                    <MenuItem value="FALLECIDO">Fallecido</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};
