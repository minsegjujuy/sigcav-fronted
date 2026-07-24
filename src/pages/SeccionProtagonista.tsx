import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getJerarquias } from "../services/JerarquiaService";
import type { Jerarquia } from "../models/Jerarquia";
import { SeccionAcompanantes } from "./SeccionAcompanantes";
import { SeccionPeaton } from "./SeccionPeaton";
import FullscreenMultiSelect from "../components/containers/MultiSelect";
import type { HechoVialForm } from "../models/HechoVialForm";
import type { LicenciaRequest } from "../models/LicenciaRequest";
import { obtenerLicenciasPorNumero } from "../services/LicenciaService";
import { useGetArticulosQuery } from "../redux/api/puestoApi";
import { TIPO_RODADO } from "../utilities/tipoRodado";

type SeccionProtagonistasProps = {
  control: Control<HechoVialForm>;
  register: UseFormRegister<HechoVialForm>;
  setValue: UseFormSetValue<HechoVialForm>;
  watch: UseFormWatch<HechoVialForm>;
  errors: FieldErrors<HechoVialForm>;
};

type ProtagonistaForm = HechoVialForm["protagonistas"][number];
type ActaNoCargadaForm = ProtagonistaForm["actasNoCargadas"][number];

type ActasNoCargadasProps = {
  pIndex: number;
  control: Control<HechoVialForm>;
  register: UseFormRegister<HechoVialForm>;
};

type SeccionLicenciaProps = {
  protagonistIndex: number;
  control: Control<HechoVialForm>;
  setValue: UseFormSetValue<HechoVialForm>;
  watch: UseFormWatch<HechoVialForm>;
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

const SeccionActasNoCargadas = ({ pIndex, control, register }: ActasNoCargadasProps) => {
  const { data :  articulo = [] } = useGetArticulosQuery();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `protagonistas.${pIndex}.actasNoCargadas` as const,
  });
  const actasNoCargadas = useWatch({
    control,
    name: `protagonistas.${pIndex}.actasNoCargadas` as const,
  });
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!hydratedRef.current && Array.isArray(actasNoCargadas) && actasNoCargadas.length > 0) {
      replace(actasNoCargadas as ActaNoCargadaForm[]);
      hydratedRef.current = true;
    }
  }, [actasNoCargadas, replace]);

  return (
    <Box sx={{ mt: 3, p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Actas
        </Typography>

        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() =>
            append({
              id: 0,
              nroActa: "",
              articulado: "",
              tipo: "",
              fechaActa: "",
            } as ActaNoCargadaForm)
          }
        >
          Agregar acta
        </Button>
      </Box>

      {fields.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
          No hay actas cargadas.
        </Typography>
      ) : null}

      {fields.map((field, index) => (
        <Paper key={field.id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12 }}>
              <TextField
                type="hidden"
                sx={{ display: "none" }}
                {...register(`protagonistas.${pIndex}.actasNoCargadas.${index}.id`)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Número de acta"
                {...register(`protagonistas.${pIndex}.actasNoCargadas.${index}.nroActa`)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`protagonistas.${pIndex}.actasNoCargadas.${index}.articulado`}
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FullscreenMultiSelect
                    label="Articulado"
                    value={
                      field.value
                        ? String(field.value)
                            .split(",")
                            .map((articulo) => articulo.trim())
                            .filter(Boolean)
                        : []
                    }
                    onChange={(values) => field.onChange(values.join(", "))}
                    options={articulo.map((art) => ({
                      id: art.nro,
                      label: `Art. ${art.nro}`
                    }))}
                    placeholder="Seleccionar artículos"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex", justifyContent: "center" }}>
              <Button color="error" onClick={() => remove(index)} startIcon={<DeleteIcon />}>
                Quitar
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

const isDniCompleto = (dni: string) => /^\d{7,8}$/.test(String(dni).trim());

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

const SeccionLicencia = ({ protagonistIndex, control, setValue, watch }: SeccionLicenciaProps) => {
  const dni = watch(`protagonistas.${protagonistIndex}.conductorDni`) ?? "";
  const licenciaActual = watch(`protagonistas.${protagonistIndex}.licenciaRequest`);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [, setMostrarCamposLicencia] = useState(false);
  const [cargandoRegistro, setCargandoRegistro] = useState(false);
  const [licencias, setLicencias] = useState<LicenciaRequest[]>([]);

  const dniCompleto = useMemo(() => isDniCompleto(String(dni)), [dni]);

  const cargarLicencias = useCallback(async () => {
    const dniNormalizado = String(dni).trim();
    if (!isDniCompleto(dniNormalizado)) return;

    setCargandoRegistro(true);
    try {
      const data = await obtenerLicenciasPorNumero(dniNormalizado);
      setLicencias(data);
      setMostrarRegistro(true);
    } finally {
      setCargandoRegistro(false);
    }
  }, [dni]);

  const seleccionarLicencia = useCallback(
    (licencia: LicenciaRequest) => {
      setMostrarCamposLicencia(true);
      setValue(`protagonistas.${protagonistIndex}.licenciaRequest`, licencia, {
        shouldDirty: true,
        shouldTouch: true,
      });
    },
    [protagonistIndex, setValue]
  );

  const nuevaLicencia = useCallback(() => {
    setMostrarCamposLicencia(true);
    setValue(
      `protagonistas.${protagonistIndex}.licenciaRequest`,
      {
        id: 0,
        numero: "",
        clase: "",
        autoridadExpedicion: "",
        fechaExpedicion: "",
        fechaVencimiento: "",
      },
      { shouldDirty: true, shouldTouch: true }
    );
  }, [protagonistIndex, setValue]);

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 1 }}>Licencia</Divider>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          disabled={!dniCompleto || cargandoRegistro}
          onClick={() => void cargarLicencias()}
        >
          {cargandoRegistro ? "Buscando..." : "Ver registro de licencias"}
        </Button>

        {!dniCompleto ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Completa el DNI para ver el registro.
          </Typography>
        ) : null}
      </Box>

      {mostrarRegistro ? (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center", mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Registro de licencias
            </Typography>
            <Button size="small" variant="contained" onClick={nuevaLicencia}>
              Agregar nueva
            </Button>
          </Box>

          {licencias.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              no hay licencias registradas
            </Typography>
          ) : (
            <FormControl fullWidth>
              <RadioGroup
                value={licenciaActual?.id?.toString() ?? "0"}
                onChange={(_, value) => {
                  const licenciaSeleccionada = licencias.find((licencia) => String(licencia.id) === value);
                  if (licenciaSeleccionada) {
                    seleccionarLicencia(licenciaSeleccionada);
                  }
                }}
              >
                {licencias?.map((licencia) => (
                  <FormControlLabel
                    key={licencia.id ?? `${licencia.numero}-${licencia.clase}`}
                    value={String(licencia.id ?? 0)}
                    control={<Radio />}
                    label={`${licencia.numero} - Clase ${licencia.clase} - Vto. ${licencia.fechaVencimiento} - ${licencia.autoridadExpedicion}` }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </Paper>
      ) : null}

      {licenciaActual?.id !== undefined && licenciaActual.id > 0 ? (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name={`protagonistas.${protagonistIndex}.licenciaRequest.numero`}
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Número de licencia"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name={`protagonistas.${protagonistIndex}.licenciaRequest.clase`}
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Clase de licencia"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name={`protagonistas.${protagonistIndex}.licenciaRequest.autoridadExpedicion`}
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Autoridad de expedición"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name={`protagonistas.${protagonistIndex}.licenciaRequest.fechaExpedicion`}
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Fecha de expedición"
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name={`protagonistas.${protagonistIndex}.licenciaRequest.fechaVencimiento`}
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Fecha de vencimiento"
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export const SeccionProtagonistas = ({ control, register, setValue, watch, errors }: SeccionProtagonistasProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "protagonistas",
  });
  const [jerarquias, setJerarquias] = useState<Jerarquia[]>([]);

  useEffect(() => {
    const fetchJerarquias = async () => {
      const data = await getJerarquias();
      setJerarquias(data);
    };

    void fetchJerarquias();
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Protagonistas y vehículos
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            append({
              acompanantes: [],
              actasNoCargadas: [],
              licenciaRequest: undefined,
              tipoRodado: "",
              dominio: "",
              marca: "",
              modelo: "",
              color: "",
              asegurado: false,
              rto: false,
              cedula: false,
              airbagActivado: false,
              usoSeguridad: false,
              licenciaEstado: "SD",
              esFuerzaSeguridad: false,
              conductorNombre: "",
              conductorGenero: "",
              conductorDni: "",
              conductorNacionalidad: "",
              domicilio: "",
              localidad: "",
              provincia: "",
              conductorEdad: "",
              conductorFechaNacimiento: "",
              municipio: "",
              graduacionAlcoholica: null,
              estadoSalud: "",
              trasladoConductor: "",
              situacion: "",
            } as ProtagonistaForm)
          }
        >
          Nuevo protagonista
        </Button>
      </Box>

      {fields.map((field, index) => {
        const esFuerza = watch(`protagonistas.${index}.esFuerzaSeguridad`);
        return (
          <Paper
            key={field.id}
            sx={{ p: 3, mb: 4, borderLeft: "6px solid", borderColor: "primary.main" }}
            elevation={2}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="h6">{index + 1}º Protagonista</Typography>
                <Button color="error" startIcon={<DeleteIcon />} onClick={() => remove(index)}>
                  Quitar
                </Button>
              </Grid>

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
                      label="Tipo de rodado"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      {TIPO_RODADO.map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  label="Dominio"
                  {...register(`protagonistas.${index}.dominio`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.dominio`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.dominio`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Marca"
                  {...register(`protagonistas.${index}.marca`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.marca`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.marca`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Modelo"
                  {...register(`protagonistas.${index}.modelo`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.modelo`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.modelo`)}
                />
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
                      <MenuItem value="ROJO">Rojo</MenuItem>
                      <MenuItem value="AZUL">Azul</MenuItem>
                      <MenuItem value="BLANCO">Blanco</MenuItem>
                      <MenuItem value="NEGRO">Negro</MenuItem>
                      <MenuItem value="AMARILLO">Amarillo</MenuItem>
                      <MenuItem value="GRIS">Gris</MenuItem>
                      <MenuItem value="OTRO">Otro</MenuItem>
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
                    render={({ field }) => <BooleanRadioField field={field} />}
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
                    render={({ field }) => <BooleanRadioField field={field} />}
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">¿Cédula?</FormLabel>
                  <Controller
                    name={`protagonistas.${index}.cedula`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => <BooleanRadioField field={field} />}
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">¿Airbag activado?</FormLabel>
                  <Controller
                    name={`protagonistas.${index}.airbagActivado`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => <BooleanRadioField field={field} />}
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">¿Uso cinturón de seguridad/casco?</FormLabel>
                  <Controller
                    name={`protagonistas.${index}.usoSeguridad`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => <BooleanRadioField field={field} />}
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }}>Datos del conductor</Divider>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  label="Apellido y nombres"
                  {...register(`protagonistas.${index}.conductorNombre`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.conductorNombre`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.conductorNombre`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="DNI"
                  {...register(`protagonistas.${index}.conductorDni`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.conductorDni`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.conductorDni`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
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
                      <MenuItem value="X">OTRO</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Domicilio"
                  {...register(`protagonistas.${index}.domicilio`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.domicilio`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.domicilio`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Localidad"
                  {...register(`protagonistas.${index}.localidad`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.localidad`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.localidad`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Provincia"
                  {...register(`protagonistas.${index}.provincia`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.provincia`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.provincia`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de nacimiento"
                  InputLabelProps={{ shrink: true }}
                  {...register(`protagonistas.${index}.conductorFechaNacimiento`)}
                />
              </Grid>

              <Grid size={{ xs: 6, md: 2 }}>
                <TextField
                  fullWidth
                  label="Edad"
                  {...register(`protagonistas.${index}.conductorEdad`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.conductorEdad`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.conductorEdad`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name={`protagonistas.${index}.graduacionAlcoholica`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Graduación alcohólica (g/L)"
                      type="number"
                      fullWidth
                      inputProps={{ step: "0.01", min: 0, max: 10 }}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? null : Number(value));
                      }}
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error?.message ?? "Dejar en blanco si el conductor se retiró sin test"
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
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
                      <MenuItem value="ARGENTINA">Argentina</MenuItem>
                      <MenuItem value="CHILENA">Chilena</MenuItem>
                      <MenuItem value="BOLIVIANA">Boliviana</MenuItem>
                      <MenuItem value="PARAGUAYA">Paraguaya</MenuItem>
                      <MenuItem value="BRASILERA">Brasilera</MenuItem>
                      <MenuItem value="PERUANA">Peruana</MenuItem>
                      <MenuItem value="VENEZOLANA">Venezolana</MenuItem>
                      <MenuItem value="OTRO">Otro</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Municipio"
                  {...register(`protagonistas.${index}.municipio`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.municipio`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.municipio`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
                <TextField
                  fullWidth
                  label="Descripcion"
                  placeholder="Colocar descripción de la persona solo si no se cuenta con todos los datos, por ej. dni, nombre, nacionalidad, etc."
                  multiline
                  minRows={3}
                  {...register(`protagonistas.${index}.descripcion`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.descripcion`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.descripcion`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
                <TextField
                  fullWidth
                  label="Traslado (Hospital/SAME)"
                  placeholder="Ej.: Sí, al hospital Pablo Soria por personal de SAME (interno Nro. - Enfermero / Chofer). Estado de salud: herido leve / herido grave."
                  multiline
                  minRows={3}
                  {...register(`protagonistas.${index}.trasladoConductor`)}
                  error={!!getErrorMessage(errors, `protagonistas.${index}.trasladoConductor`)}
                  helperText={getErrorMessage(errors, `protagonistas.${index}.trasladoConductor`)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
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
                      <MenuItem value="SIN LESIONES">Sin lesiones</MenuItem>
                      <MenuItem value="HERIDO LEVE">Herido leve</MenuItem>
                      <MenuItem value="HERIDO GRAVE">Herido grave</MenuItem>
                      <MenuItem value="FALLECIDO">Fallecido</MenuItem>
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
                    render={({ field }) => <BooleanRadioField field={field} />}
                  />
                </FormControl>
              </Grid>

              {esFuerza ? (
                <>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Legajo" {...register(`protagonistas.${index}.legajo`)} />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Controller
                      name={`protagonistas.${index}.jerarquia`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth error={!!fieldState.error}>
                          <InputLabel id={`jerarquia-label-${index}`}>Jerarquía</InputLabel>
                          <Select
                            {...field}
                            labelId={`jerarquia-label-${index}`}
                            label="Jerarquía"
                            value={field.value ?? ""}
                          >
                            <MenuItem value="">
                              <em>Seleccione una jerarquía</em>
                            </MenuItem>

                            {jerarquias.map((jerarquia) => (
                              <MenuItem key={jerarquia.idJer} value={jerarquia.nombre}>
                                {jerarquia.nombre}
                              </MenuItem>
                            ))}
                          </Select>

                          {fieldState.error ? <FormHelperText>{fieldState.error.message}</FormHelperText> : null}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Situación de revista" {...register(`protagonistas.${index}.situacion`)} />
                  </Grid>
                </>
              ) : null}

              <Grid size={{ xs: 12 }}>
                <SeccionLicencia protagonistIndex={index} control={control} setValue={setValue} watch={watch} />
              </Grid>

              {watch(`protagonistas.${index}.licenciaRequest`)?.id === 0 ? (
                <>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name={`protagonistas.${index}.licenciaRequest.numero`}
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Número de licencia"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name={`protagonistas.${index}.licenciaRequest.clase`}
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Clase de licencia"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name={`protagonistas.${index}.licenciaRequest.autoridadExpedicion`}
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Autoridad de expedición"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name={`protagonistas.${index}.licenciaRequest.fechaExpedicion`}
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Fecha de expedición"
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name={`protagonistas.${index}.licenciaRequest.fechaVencimiento`}
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Fecha de vencimiento"
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
                </>
              ) : null}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }}>Actas</Divider>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <SeccionActasNoCargadas pIndex={index} control={control} register={register} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }}>Acompañantes del protagonista</Divider>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <SeccionAcompanantes pIndex={index} control={control} register={register} errors={errors} />
              </Grid>
            </Grid>
          </Paper>
        );
      })}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Peatones
        </Typography>
        <SeccionPeaton control={control} register={register} errors={errors} />
      </Box>
    </Box>
  );
};
