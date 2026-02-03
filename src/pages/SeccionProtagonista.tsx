import { Box, Button, Checkbox, Divider, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, TextField, Typography } from "@mui/material";
import { SeccionAcompanantes } from "./SeccionAcompanantes";
import { Controller, useFieldArray } from "react-hook-form";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Articulo } from "../models/Articulo";
import { useEffect, useState } from "react";
import { getArticulos } from "../services/ArticuloService";
import { getJerarquias } from "../services/JerarquiaService";
import type { Jerarquia } from "../models/Jerarquia";

export const SeccionProtagonistas = ({ control, register, watch }: { control: any, register: any, watch: any }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "protagonistas"
  });
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [jerarquias, setjerarquias] = useState<Jerarquia[]>([]);

  const fetchArticulos = async () => {
    const data = await getArticulos();
    setArticulos(data);
    console.log('data articulos ', data)
  }

  const fetchJerarquias = async() => {
    const data = await getJerarquias();
    console.log('jerarquias ' , data)
    setjerarquias(data);
  }

  useEffect(()=> {
    fetchArticulos();
    fetchJerarquias();
  }, [])

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>PROTAGONISTAS Y VEHÍCULOS</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => append({ acompanantes: [] } as any)}>
          Nuevo Protagonista
        </Button>
      </Box>

      {fields.map((field, index) => {
        const esFuerza = watch(`protagonistas.${index}.esFuerzaSeguridad`);
        const licenciaClase = watch(`protagonistas.${index}.licenciaClase`);
        return (
          <Paper key={field.id} sx={{ p: 3, mb: 4, borderLeft: '6px solid', borderColor: 'primary.main' }} elevation={2}>
          <Grid container spacing={3}>
            {/* Título y Borrar */}
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">{index + 1}º PROTAGONISTA</Typography>
              <Button color="error" startIcon={<DeleteIcon />} onClick={() => remove(index)}>Quitar</Button>
            </Grid>

            {/* Datos Rodado */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name={`protagonistas.${index}.tipoRodado`}
                control={control}
                defaultValue=""
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Tipo de Rodado"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="AUTOMOVIL">AUTOMÓVIL</MenuItem>
                    <MenuItem value="CAMIONETA">CAMIONETA</MenuItem>
                    <MenuItem value="MOTOCICLETA">MOTOCICLETA</MenuItem>
                    <MenuItem value="CAMION">CAMIÓN</MenuItem>
                    <MenuItem value="CAMION CON ACOPLADO">CAMIÓN CON ACOPLADO</MenuItem>
                    <MenuItem value="CARGA TRACTOR">CAMIÓN TRACTOR</MenuItem>
                    <MenuItem value="OMNIBUS">ÓMNIBUS</MenuItem>
                    <MenuItem value="OMNIBUS URBANO">ÓMNIBUS URBANO</MenuItem>
                    <MenuItem value="OMNIBUS A LARGA DISTANCIA / ARTICULADO">
                      ÓMNIBUS A LARGA DISTANCIA / ARTICULADO
                    </MenuItem>
                    <MenuItem value="MAQUINARIA">MAQUINARIA</MenuItem>
                  </TextField>
                            )}
                          />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField fullWidth label="Dominio" {...register(`protagonistas.${index}.dominio`)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Marca" {...register(`protagonistas.${index}.marca`)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Modelo" {...register(`protagonistas.${index}.modelo`)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name={`protagonistas.${index}.color`}
                control={control}
                defaultValue=""
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Color"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="ROJO">ROJO</MenuItem>
                    <MenuItem value="AZUL">AZUL</MenuItem>
                    <MenuItem value="BLANCO">BLANCO</MenuItem>
                    <MenuItem value="NEGRO">NEGRO</MenuItem>
                    <MenuItem value="AMARILLO">AMARILLO</MenuItem>
                    <MenuItem value="GRIS">GRIS</MenuItem>
                    <MenuItem value="OTRO">OTRO</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <FormControl component="fieldset">
                <FormLabel component="legend">¿Asegurado?</FormLabel>
                <Controller
                    name={`protagonistas.${index}.asegurado`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                    <RadioGroup row {...field}>
                        <FormControlLabel value="true" control={<Radio />} label="SI" />
                        <FormControlLabel value="false" control={<Radio />} label="NO" />
                    </RadioGroup>
                    )}
                />
                </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <FormControl component="fieldset">
                <FormLabel component="legend">¿RTO?</FormLabel>
                <Controller
                    name={`protagonistas.${index}.rto`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                    <RadioGroup row {...field}>
                        <FormControlLabel value="true" control={<Radio />} label="SI" />
                        <FormControlLabel value="false" control={<Radio />} label="NO" />
                    </RadioGroup>
                    )}
                />
                </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <FormControl component="fieldset">
                <FormLabel component="legend">¿Cedula?</FormLabel>
                <Controller
                    name={`protagonistas.${index}.cedula`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                    <RadioGroup row {...field}>
                        <FormControlLabel value="true" control={<Radio />} label="SI" />
                        <FormControlLabel value="false" control={<Radio />} label="NO" />
                    </RadioGroup>
                    )}
                />
                </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <FormControl>
                  <FormLabel>¿Airbag activado?</FormLabel>

                  <Controller
                    name={`protagonistas.${index}.airbagActivado`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <RadioGroup
                        row
                        value={field.value}
                        onChange={(_, value) => field.onChange(value === 'true')}
                      >
                        <FormControlLabel value="true" control={<Radio />} label="SI" />
                        <FormControlLabel value="false" control={<Radio />} label="NO" />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <FormControl component="fieldset">
                <FormLabel component="legend">¿Uso cinturon de seguridad/casco?</FormLabel>
                <Controller
                    name={`protagonistas.${index}.usoSeguridad`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                    <RadioGroup row {...field}>
                        <FormControlLabel value="true" control={<Radio />} label="SI" />
                        <FormControlLabel value="false" control={<Radio />} label="NO" />
                    </RadioGroup>
                    )}
                />
                </FormControl>
            </Grid>

            {/* Datos Conductor */}
            <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }}>DATOS DEL CONDUCTOR</Divider></Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField fullWidth label="Apellido y Nombres" {...register(`protagonistas.${index}.conductorNombre`)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="DNI" {...register(`protagonistas.${index}.conductorDni`)} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`protagonistas.${index}.conductorGenero`}
                control={control}
                defaultValue=""
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Género"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="M">M</MenuItem>
                    <MenuItem value="F">F</MenuItem>
                    <MenuItem value="OTRO">OTRO</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            {/* Fecha y Edad */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth
                type="date" 
                label="Fecha de Nacimiento" 
                InputLabelProps={{ shrink: true }} 
                {...register(`protagonistas.${index}.conductorFechaNacimiento`)}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField fullWidth label="Edad" {...register(`protagonistas.${index}.conductorEdad`)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
              name={`protagonistas.${index}.graduacionAlcoholica`}
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Graduación Alcohólica (g/L)"
                  type="number" // Mantiene el teclado numérico en móviles
                  fullWidth
                  // Esto es la clave:
                  inputProps={{ 
                    step: "0.01", // Permite incrementos de 0.01 (decimales)
                    min: 0,
                    max: 10 
                  }}
                  // Importante: convertir el string del input a float de JS
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? "" : parseFloat(val));
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name={`protagonistas.${index}.conductorNacionalidad`}
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
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
                </TextField>
              )}
            />
          </Grid>
            {/* Licencia */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`protagonistas.${index}.licenciaClase`}
                control={control}
                defaultValue=""
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Tipo de licencia"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="MUNICIPAL">MUNICIPAL</MenuItem>
                    <MenuItem value="PROVINCIAL">PROVINCIAL</MenuItem>
                    <MenuItem value="NACIONAL">NACIONAL</MenuItem>
                    <MenuItem value="EXTRANJERA">EXTRANJERA</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Licencia Nro" {...register(`protagonistas.${index}.licenciaNro`)} />
            </Grid>
            {licenciaClase === 'MUNICIPAL' && (
              <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Municipio" {...register(`protagonistas.${index}.municipio`)} />
            </Grid>
            )}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name={`protagonistas.${index}.licenciaEstado`}
                control={control}
                defaultValue=""
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Estado Licencia"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="VIGENTE">VIGENTE</MenuItem>
                    <MenuItem value="VENCIDA">VENCIDA</MenuItem>
                    <MenuItem value="NO_POSEE">NO POSEE</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
            <TextField
                fullWidth
                label="Traslado (Hospital/SAME)"
                placeholder="Ej. Sí, al hospital Pablo Soria por personal de SAME (interno Nro. – Enfermero / Chofer). Estado de salud: herido leve / herido grave."
                multiline
                minRows={3}
                {...register(`protagonistas.${index}.trasladoConductor`)}
            />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name={`protagonistas.${index}.estadoSalud`}
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
            <Grid size={{ xs: 12, md: 4 }}>
                <FormControl component="fieldset">
                <FormLabel component="legend">¿Es personal de las fuerzas de seguridad?</FormLabel>
                <Controller
                    name={`protagonistas.${index}.esFuerzaSeguridad`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                    <RadioGroup row {...field}>
                        <FormControlLabel value="true" control={<Radio />} label="SI" />
                        <FormControlLabel value="false" control={<Radio />} label="NO" />
                    </RadioGroup>
                    )}
                />
                </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Ref Nro acta" {...register(`protagonistas.${index}.actaRef`)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Ref nro acta retencion" {...register(`protagonistas.${index}.actaRetencionRef`)} />
            </Grid>
            <FormControl fullWidth>
              <InputLabel id="articulos-label">Artículos</InputLabel>

              <Controller
                name={`protagonistas.${index}.articuladoRef`}
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="articulos-label"
                    multiple
                    input={<OutlinedInput label="Artículos" />}
                    renderValue={(selected) =>
                      articulos
                        .filter(a => selected.includes(a.idArt))
                        .map(a => `Art. ${a.nro}`)
                        .join(', ')
                    }
                  >
                    {articulos.map((art) => (
                      <MenuItem key={art.idArt} value={art.idArt}>
                        <Checkbox checked={field.value.includes(art.idArt)} />
                        <ListItemText
                          primary={`Art. ${art.nro}`}
                          secondary={art.detalle}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            {esFuerza && (
              <>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name={`protagonistas.${index}.legajo`}
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Legajo" fullWidth />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name={`protagonistas.${index}.jerarquia`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormControl
                        fullWidth
                        error={!!fieldState.error}
                      >
                        <InputLabel id="jerarquia-label">
                          Jerarquía
                        </InputLabel>

                        <Select
                          {...field}
                          labelId="jerarquia-label"
                          label="Jerarquía"
                          value={field.value ?? ''}
                        >
                          <MenuItem value="">
                            <em>Seleccione una jerarquía</em>
                          </MenuItem>

                          {jerarquias.map((jerarquia) => (
                            <MenuItem
                              key={jerarquia.idJer}
                              value={jerarquia.nombre}
                            >
                              {jerarquia.nombre}
                            </MenuItem>
                          ))}
                        </Select>

                        {fieldState.error && (
                          <FormHelperText>
                            {fieldState.error.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Situacion de revista" {...register(`protagonistas.${index}.situacion`)} />
                </Grid>
              </>
            )}

            {/* Acompañantes del protagonista */}
            <Grid size={{ xs: 12 }}>
              <SeccionAcompanantes pIndex={index} control={control} register={register} />
            </Grid>
          </Grid>
        </Paper>
        )
      })}
    </Box>
  );
};