import { Box, Button, Divider, FormControl, FormControlLabel, FormLabel, Grid, MenuItem, Paper, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { SeccionAcompanantes } from "./SeccionAcompanantes";
import { Controller, useFieldArray } from "react-hook-form";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export const SeccionProtagonistas = ({ control, register, watch }: { control: any, register: any, watch: any }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "protagonistas"
  });

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
              <TextField select fullWidth label="Tipo de Rodado" {...register(`protagonistas.${index}.tipoRodado`)}>
                <MenuItem value="AUTOMOVIL">AUTOMÓVIL</MenuItem>
                <MenuItem value="CAMIONETA">CAMIONETA</MenuItem>
                <MenuItem value="MOTOCICLETA">MOTOCICLETA</MenuItem>
                <MenuItem value="CAMION">CAMION</MenuItem>
                <MenuItem value="CAMION CON ACOPLADO">CAMION CON ACOPLADO</MenuItem>
                <MenuItem value="CARGA TRACTOR">CAMION TRACTOR</MenuItem>
                <MenuItem value="OMNIBUS">OMNIBUS</MenuItem>
                <MenuItem value="OMNIBUS URBANO">OMNIBUS URBANO</MenuItem>
                <MenuItem value="OMNIBUS A LARGA DISTANCIA / ARTICULADO">OMNIBUS A LARGA DISTANCIA / ARTICULADO</MenuItem>
                <MenuItem value="MAQUINARIA">MAQUINARIA</MenuItem>
              </TextField>
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
              <TextField select fullWidth label="Color" {...register(`protagonistas.${index}.color`)}>
                <MenuItem value="ROJO">ROJO</MenuItem>
                <MenuItem value="AZUL">AZUL</MenuItem>
                <MenuItem value="BLANCO">BLANCO</MenuItem>
                <MenuItem value="NEGRO">NEGRO</MenuItem>
                <MenuItem value="AMARILLO">AMARILLO</MenuItem>
                <MenuItem value="GRIS">GRIS</MenuItem>
                <MenuItem value="OTRO">OTRO</MenuItem>
              </TextField>
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
                <TextField
                    select
                    fullWidth
                    label="Genero"
                    defaultValue=""
                    {...register(`protagonistas.${index}.conductorGenero`)}
                >
                    <MenuItem value="M">M</MenuItem>
                    <MenuItem value="F">F</MenuItem>
                    <MenuItem value="OTRO">OTRO</MenuItem>
                </TextField>
            </Grid>
            {/* Fecha y Edad */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth 
                size="small" 
                type="date" 
                label="Fecha de Nacimiento" 
                InputLabelProps={{ shrink: true }} 
                {...register(`protagonistas.${index}.conductorFechaNacimiento`)}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField fullWidth size="small" label="Edad" {...register(`protagonistas.${index}.conductorEdad`)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Alcoholemia (G/L)" {...register(`protagonistas.${index}.graduacionAlcoholica`)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Nacionalidad" {...register(`protagonistas.${index}.conductorNacionalidad`)} />
            </Grid>

            {/* Licencia */}
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    select
                    fullWidth
                    label="Tipo de licencia"
                    defaultValue=""
                    {...register(`protagonistas.${index}.licenciaClase`)}
                >
                    <MenuItem value="MUNICIPAL">MUNICIPAL</MenuItem>
                    <MenuItem value="PROVINCIAL">PROVINCIAL</MenuItem>
                    <MenuItem value="NACIONAL">NACIONAL</MenuItem>
                    <MenuItem value="EXTRANJERA">EXTRANJERA</MenuItem>
                </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Licencia Nro" {...register(`protagonistas.${index}.licenciaNro`)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField select fullWidth label="Estado Licencia" {...register(`protagonistas.${index}.licenciaEstado`)}>
                <MenuItem value="VIGENTE">VIGENTE</MenuItem>
                <MenuItem value="VENCIDA">VENCIDA</MenuItem>
                <MenuItem value="NO POSEE">NO POSEE</MenuItem>
              </TextField>
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
              <TextField fullWidth label="Ref Nro Acta" {...register(`protagonistas.${index}.actaRef`)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Articulado, EJ. ART 40 INC B, ART 40 INC A, ETC" 
              {...register(`protagonistas.${index}.articuladoRef`)} />
            </Grid>
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
                    render={({ field }) => (
                      <TextField {...field} label="Jerarquía" fullWidth />
                    )}
                  />
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