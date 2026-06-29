import { Grid, TextField, IconButton, Button, Typography, Box, FormControlLabel, MenuItem, FormControl, FormLabel, RadioGroup, Radio } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Controller, useFieldArray, useWatch, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import type { Acompanante, HechoVialForm } from '../models/HechoVialForm';
import { useEffect } from 'react';

interface AcompanantesProps {
  pIndex: number;
  control: Control<HechoVialForm>;
  register: UseFormRegister<HechoVialForm>;
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

export const SeccionAcompanantes = ({ pIndex, control, register, errors }: AcompanantesProps) => {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `protagonistas.${pIndex}.acompanantes` as const
  });
  const acompanantes = useWatch({
    control,
    name: `protagonistas.${pIndex}.acompanantes` as const,
  });

  useEffect(() => {
    if (Array.isArray(acompanantes) && fields.length === 0 && acompanantes.length > 0) {
      replace(acompanantes as Acompanante[]);
    }
  }, [acompanantes, fields.length, replace]);

  return (
    <Box sx={{ mt: 3, pl: { md: 4 }, borderLeft: '2px solid #e0e0e0' }}>
      <Typography variant="subtitle2" gutterBottom color="primary.main" sx={{ fontWeight: 'bold' }}>
        ACOMPAÑANTES DEL {pIndex + 1}º PROTAGONISTA
      </Typography>
      
      {fields.map((field, aIndex) => (
        <Grid container spacing={2} key={field.id} sx={{ mb: 3, p: 2, bgcolor: '#ffffff', borderRadius: 1 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Apellido y Nombre"
              {...register(`protagonistas.${pIndex}.acompanantes.${aIndex}.nombre`)}
              error={!!getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.nombre`)}
              helperText={getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.nombre`)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name={`protagonistas.${pIndex}.acompanantes.${aIndex}.tipo`}
              control={control}
              defaultValue="DNI"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  label="Tipo Documento"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="DNI">DNI</MenuItem>
                  <MenuItem value="LE">LE</MenuItem>
                  <MenuItem value="LC">LC</MenuItem>
                  <MenuItem value="CI">CI</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Domicilio"
              {...register(`protagonistas.${pIndex}.acompanantes.${aIndex}.domicilio`)}
              error={!!getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.domicilio`)}
              helperText={getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.domicilio`)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Localidad"
              {...register(`protagonistas.${pIndex}.acompanantes.${aIndex}.localidad`)}
              error={!!getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.localidad`)}
              helperText={getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.localidad`)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Nro"
              {...register(`protagonistas.${pIndex}.acompanantes.${aIndex}.numeroDocumento`)}
              error={!!getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.numeroDocumento`)}
              helperText={getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.numeroDocumento`)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={`protagonistas.${pIndex}.acompanantes.${aIndex}.nacionalidad`}
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  label="Nacionalidad"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="ARGENTINA">ARGENTINA</MenuItem>
                  <MenuItem value="CHILENA">CHILENA</MenuItem>
                  <MenuItem value="BOLIVIANA">BOLIVIANA</MenuItem>
                  <MenuItem value="PARAGUAYA">PARAGUAYA</MenuItem>
                  <MenuItem value="BRASILERA">BRASILERA</MenuItem>
                  <MenuItem value="PERUANA">PERUANA</MenuItem>
                  <MenuItem value="VENEZOLANA">VENEZOLANA</MenuItem>
                  <MenuItem value="OTRO">OTRO</MenuItem>
                </TextField>
              )}
            />
          </Grid>
           <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={`protagonistas.${pIndex}.acompanantes.${aIndex}.provincia`}
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  label="Provincia"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="BUENOS_AIRES">Buenos Aires</MenuItem>
                  <MenuItem value="CIUDAD_AUTONOMA_DE_BUENOS_AIRES">
                    Ciudad Autonoma de Buenos Aires
                  </MenuItem>
                  <MenuItem value="CATAMARCA">Catamarca</MenuItem>
                  <MenuItem value="CHACO">Chaco</MenuItem>
                  <MenuItem value="CHUBUT">Chubut</MenuItem>
                  <MenuItem value="CORDOBA">Cordoba</MenuItem>
                  <MenuItem value="CORRIENTES">Corrientes</MenuItem>
                  <MenuItem value="ENTRE_RIOS">Entre Ri­os</MenuItem>
                  <MenuItem value="FORMOSA">Formosa</MenuItem>
                  <MenuItem value="JUJUY">Jujuy</MenuItem>
                  <MenuItem value="LA_PAMPA">La Pampa</MenuItem>
                  <MenuItem value="LA_RIOJA">La Rioja</MenuItem>
                  <MenuItem value="MENDOZA">Mendoza</MenuItem>
                  <MenuItem value="MISIONES">Misiones</MenuItem>
                  <MenuItem value="NEUQUEN">Neuquen</MenuItem>
                  <MenuItem value="RIO_NEGRO">Ri­o Negro</MenuItem>
                  <MenuItem value="SALTA">Salta</MenuItem>
                  <MenuItem value="SAN_JUAN">San Juan</MenuItem>
                  <MenuItem value="SAN_LUIS">San Luis</MenuItem>
                  <MenuItem value="SANTA_CRUZ">Santa Cruz</MenuItem>
                  <MenuItem value="SANTA_FE">Santa Fe</MenuItem>
                  <MenuItem value="SANTIAGO_DEL_ESTERO">Santiago del Estero</MenuItem>
                  <MenuItem value="TIERRA_DEL_FUEGO">Tierra del Fuego</MenuItem>
                  <MenuItem value="TUCUMAN">Tucuman</MenuItem>
                  <MenuItem value="N/A">N/A</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          {/* Fecha y Edad */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField 
              fullWidth 
              size="small" 
              type="date" 
              label="Fecha de Nacimiento" 
              InputLabelProps={{ shrink: true }} 
              {...register(`protagonistas.${pIndex}.acompanantes.${aIndex}.fechaNacimiento`)} 
              error={!!getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.fechaNacimiento`)}
              helperText={getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.fechaNacimiento`)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Edad"
              {...register(`protagonistas.${pIndex}.acompanantes.${aIndex}.edad`)}
              error={!!getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.edad`)}
              helperText={getErrorMessage(errors, `protagonistas.${pIndex}.acompanantes.${aIndex}.edad`)}
            />
          </Grid>

          {/* Seguridad (CinturÃ³n/Casco) */}
          <Grid size={{ xs: 12, md: 4 }}>
                <FormControl component="fieldset">
                <FormLabel component="legend">¿Uso cinturon de seguridad/casco?</FormLabel>
                <Controller
                    name={`protagonistas.${pIndex}.acompanantes.${aIndex}.usoCinturonCasco`}
                    control={control}
                    defaultValue={false}
                    render={({ field, fieldState }) => (
                    <FormControl error={!!fieldState.error}>
                      <RadioGroup
                        row
                        value={String(Boolean(field.value))}
                        onChange={(_, value) => field.onChange(value === "true")}
                      >
                        <FormControlLabel value="true" control={<Radio />} label="SI" />
                        <FormControlLabel value="false" control={<Radio />} label="NO" />
                      </RadioGroup>
                      {fieldState.error ? (
                        <Typography variant="caption" color="error">
                          {fieldState.error.message}
                        </Typography>
                      ) : null}
                    </FormControl>
                    )}
                />
                </FormControl>
            </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
                <FormControl component="fieldset">
                <FormLabel component="legend">¿Dispositivo de retencion?</FormLabel>
                <Controller
                    name={`protagonistas.${pIndex}.acompanantes.${aIndex}.dispositivoRetencion`}
                    control={control}
                    defaultValue={false}
                    render={({ field, fieldState }) => (
                    <FormControl error={!!fieldState.error}>
                      <RadioGroup
                        row
                        value={String(Boolean(field.value))}
                        onChange={(_, value) => field.onChange(value === "true")}
                      >
                        <FormControlLabel value="true" control={<Radio />} label="SI" />
                        <FormControlLabel value="false" control={<Radio />} label="NO" />
                      </RadioGroup>
                      {fieldState.error ? (
                        <Typography variant="caption" color="error">
                          {fieldState.error.message}
                        </Typography>
                      ) : null}
                    </FormControl>
                    )}
                />
                </FormControl>
            </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={`protagonistas.${pIndex}.acompanantes.${aIndex}.genero`}
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Genero"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="M">M</MenuItem>
                  <MenuItem value="F">F</MenuItem>
                  <MenuItem value="X">OTRO</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
                fullWidth
                label="Traslado (Hospital/SAME)"
                placeholder="Ej. Si­, al hospital Pablo Soria por personal de SAME (interno Nro. Enfermero / Chofer). Estado de salud: herido leve / herido grave."
                multiline
                minRows={3}
                {...register(`protagonistas.${pIndex}.acompanantes.${aIndex}.trasladado`)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name={`protagonistas.${pIndex}.acompanantes.${aIndex}.estadoSalud`}
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Estado de salud"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="SIN LESIONES">SIN LESIONES</MenuItem>
                  <MenuItem value="HERIDO LEVE">HERIDO LEVE</MenuItem>
                  <MenuItem value="HERIDO GRAVE">HERIDO GRAVE</MenuItem>
                  <MenuItem value="FALLECIDO">FALLECIDO</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 2, md: 1 }}>
            <IconButton color="error" onClick={() => remove(aIndex)}><DeleteIcon /></IconButton>
          </Grid>
        </Grid>
      ))}

      <Button
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
            usoCinturonCasco: false,
            dispositivoRetencion: false,
            trasladado: "",
            estadoSalud: "",
          } as Acompanante)
        }
        variant="text"
        size="small"
      >
        Añadir Acompañante
      </Button>
    </Box>
  );
};

