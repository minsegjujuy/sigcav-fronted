import { 
  TextField, MenuItem, FormControlLabel, Radio, RadioGroup, 
  FormControl, FormLabel, Button, Typography, Paper, Divider,
  Grid,
  Box,
  IconButton,
  InputLabel,
  Select,
} from '@mui/material';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { SeccionProtagonistas } from './SeccionProtagonista';
import { getPuestos } from '../services/PuestoService';
import { useEffect, useState } from 'react';
import type { Puesto } from '../models/Puesto';
import MapaJujuy from '../components/containers/MapaJujuy';
import type { UbicacionRequest } from '../models/UbicacionRequest';
import { obtenerUnidadesRegionalesPorDepartamento } from '../services/UnidadRegionalService';
import type { Localidad } from '../models/Localidad';
import type { UnidadRegional } from '../models/UnidadRegional';
import { guardarhechoVial } from '../services/HechoVialService';
import { SnackbarUtilities } from '../utilities/SnackbarUtilities';
import type { HechoVialForm } from '../models/HechoVialForm';
import { useHechoVial } from '../context/HechoVialContext';
import { TIPOS_INVOLUCRADOS } from '../utilities/tipoRodado';
import FullscreenMultiSelect from '../components/containers/MultiSelect';
import { PersonalUnidad } from './PersonalUnidad';

const FormularioHechoVial = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch
  } = useForm<HechoVialForm>({
    defaultValues: {
      protagonistas: [],
      victimaFatal: "NO",
      zona: "URBANA",
      danosMateriales: "SI",
      unidades: [
        {
          unidad: "",
          personal: [{ nombre: "", jerarquia: "", observacion: "" }],
        },
      ],
    }
  });
  
  const { fields, append, remove } = useFieldArray<HechoVialForm>({
    control,
    name: "involucrados"
  });

  // FieldArray de UNIDADES
  const {
    fields: unidadesFields,
    append: appendUnidad,
    remove: removeUnidad,
  } = useFieldArray({
    control,
    name: "unidades",
  });

  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const { hechoVial, modo, limpiarHechoVial } = useHechoVial();
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [unidadesRegionales, setUnidadesRegionales] = useState<UnidadRegional[]>([]);
  const [ubicacion, setUbicacion] = useState<UbicacionRequest>({
    lat: 0,
    lng: 0,
    unidadRegional: 0,
    departamento: '',
    localidad: undefined
});

  const fetchPuestos = async () => {
    const data = await getPuestos();
    setPuestos(data);
  }

  // Observamos los tipos para mostrar el campo "Especificar" si eligen "OTRO"
  const watchInvolucrados = useWatch({ control, name: "involucrados" });
  
  const tipoSiniestro = watch("tipoSiniestro");

  const onSubmit = async (data: HechoVialForm) => {
    const payload: HechoVialForm = {
        ...data,
        ubicacionReq: ubicacion
    };
    //danosMateriales, zona, y victimaFatal  son undefined si no los selcciono explicitamente
    console.log("Datos capturados:", payload);
    await guardarhechoVial(payload);
    SnackbarUtilities.success('Se guardó correctamente el hecho vial');
    limpiarHechoVial();
  };

   const handleMapSelect = async (point: UbicacionRequest) => {
    console.log('ubicacion ', point);
    setUbicacion(point)
    const data = await obtenerUnidadesRegionalesPorDepartamento(point.departamento);
    console.log('unidad regional ', data)
    setUnidadesRegionales(data);
  }

  const handleSelectedUR = (event : any) => {
    const unidadRId = Number(event.target.value);
    const depto = unidadesRegionales.find(u => u.idUr === unidadRId)?.departamentos.find(d => d.nombre === ubicacion?.departamento );
    console.log('ur', depto)
    setLocalidades(depto?.localidades!);
    setUbicacion(prevData => ({...prevData, unidadRegional: unidadRId}))
  }

  const handleLocalidadChange = (event : any) => {
    const localidadId = Number(event.target.value);
    setUbicacion(prevData => ({...prevData, localidad: localidadId}));
  }
  
  useEffect(() => {
    fetchPuestos();
    if (modo === 'edit' && hechoVial) {
      console.log('hv edit ', hechoVial.ubicacionReq);
      reset(hechoVial);
      handleMapSelect(hechoVial.ubicacionReq)
    }
    return () => {
      reset();
    };
  }, [hechoVial, modo, reset]);


  return (
    <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto', my: 4, borderRadius: 3 }}>
      <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 700, color: 'primary.main' }}>
        Informe de Hecho Vial
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          
          {/* --- ENCABEZADO Y UBICACIÓN --- */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" color="secondary">Datos de Identificación</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
                select
                fullWidth
                label="Destacamento"
                defaultValue=""
                {...register("destacamento")}
            >
                {puestos.map((puesto) => (
                <MenuItem key={puesto.idPuesto} value={puesto.idPuesto}>
                    {puesto.nombre}
                </MenuItem>
                ))}
            </TextField>
            </Grid>

          <Controller
            name="grupo"
            control={control}
            render={({ field: { onChange, value, ...field }, fieldState }) => (
              <TextField
                {...field}
                value={value} 
                onChange={(e) => onChange(Number(e.target.value))}
                select
                fullWidth
                label="Seleccionar grupo"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {[
                  { label: "GRUPO 1", id: 1 },
                  { label: "GRUPO 2", id: 2 },
                  { label: "GRUPO 3", id: 3 },
                ].map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField fullWidth type="date" label="Fecha" InputLabelProps={{ shrink: true }} {...register("fecha")} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField fullWidth type="time" label="Hora" InputLabelProps={{ shrink: true }} {...register("hora")} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Ubicación (Lugar del hecho - KM/Altura)" {...register("ruta")} />
          </Grid>
          <MapaJujuy onSelect={handleMapSelect} initialValue={hechoVial?.ubicacionReq} />

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
            <InputLabel id="unidad-label">Unidad Regional</InputLabel>
            <Select
                labelId="unidad-label"
                value={ubicacion.unidadRegional}
                label="Unidad Regional"
                onChange={handleSelectedUR}
            >
                {unidadesRegionales.map((unidad) => (
                <MenuItem key={unidad.idUr} value={unidad.idUr}>
                    {unidad.nombre}
                </MenuItem>
                ))}
            </Select>
            </FormControl>
          </Grid>

          {localidades.length > 0 && 
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
            <InputLabel id="unidad-label">Localidad</InputLabel>
            <Select
                labelId="localidad"
                {...register("ubicacionReq.localidad")} 
                label="Localidad"
                onChange={handleLocalidadChange}
            >
                {localidades.map((localidad) => (
                <MenuItem key={localidad.id} value={localidad.id}>
                    {localidad.nombre}
                </MenuItem>
                ))}
            </Select>
            </FormControl>
          </Grid>}

          <Grid size={{ xs: 12 }}><Divider /></Grid>

          {/* --- CLASIFICACIÓN DEL HECHO --- */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">¿Víctima Fatal?</FormLabel>
              <Controller
                name="victimaFatal"
                control={control}
                defaultValue="NO"
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel value="SI" control={<Radio />} label="SI" />
                    <FormControlLabel value="NO" control={<Radio />} label="NO" />
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Zona</FormLabel>
              <Controller
                name="zona"
                control={control}
                defaultValue="URBANA"
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel value="URBANA" control={<Radio />} label="Urbana" />
                    <FormControlLabel value="RURAL" control={<Radio />} label="Rural" />
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Daños Materiales</FormLabel>
              <Controller
                name="danosMateriales"
                control={control}
                defaultValue="SI"
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel value="SI" control={<Radio />} label="SI" />
                    <FormControlLabel value="NO" control={<Radio />} label="NO" />
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="tipoVia"
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Tipo de Vía"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {[
                    "CALLE",
                    "AVENIDA",
                    "SEMIAUTOPISTA",
                    "AUTOPISTA",
                    "RUTA NACIONAL",
                    "RUTA PROVINCIAL",
                  ].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}

                  <MenuItem value="OTRO">OTRO (ESPECIFICAR)</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          {/* INVOLUCRADOS */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="secondary">Involucrados</Typography>
                <Button 
                startIcon={<AddCircleOutlineIcon />} 
                variant="outlined" 
                onClick={() => append({ tipo: '', cantidad: 1 })}
                >
                Agregar Involucrado
                </Button>
            </Box>

            {fields.map((field, index) => (
                <Grid container spacing={2} key={field.id} sx={{ mb: 2, alignItems: 'center' }}>
                {/* Cantidad */}
                <Grid size={{ xs: 3, md: 2 }}>
                    <TextField
                    fullWidth
                    type="number"
                    label="Cant."
                    {...register(`involucrados.${index}.cantidad`)}
                    inputProps={{ min: 1 }}
                    />
                </Grid>

                {/* Tipo de Involucrado */}
                <Grid size={{ xs: 7, md: 4 }}>
                    <TextField
                    select
                    fullWidth
                    label="Tipo de Vehículo/Persona"
                    defaultValue={field.id}
                    {...register(`involucrados.${index}.tipo`)}
                    >
                    {TIPOS_INVOLUCRADOS.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                    </TextField>
                </Grid>

                {/* Especificar si es OTRO */}
                {watchInvolucrados?.[index]?.tipo === 'OTRO' && (
                    <Grid size={{ xs: 10, md: 5 }}>
                    <TextField
                        fullWidth
                        label="Especificar otro"
                        {...register(`involucrados.${index}.especificarOtro`)}
                    />
                    </Grid>
                )}

                {/* Botón Eliminar Fila */}
                <Grid size={{ xs: 2, md: 1 }}>
                    <IconButton color="error" onClick={() => remove(index)}>
                    <DeleteIcon />
                    </IconButton>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                    <Divider variant="middle" sx={{ opacity: 0.5 }} />
                </Grid>
                </Grid>
            ))}

            {fields.length === 0 && (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray', textAlign: 'center' }}>
                No hay involucrados agregados.
                </Typography>
            )}
            </Grid>

          <Grid size={{ xs: 12 }}><Divider /></Grid>

          {/* --- CONDICIONES DE LA VÍA --- */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" color="secondary">Características de la Escena</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="configuracionVia"
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Configuración de la Vía"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {[
                    "INTERSECCION",
                    "MITAD DE CALLE/AVENIDA",
                    "INGRESO/EGRESO DE LA VIA",
                    "RECTA",
                    "CURVA HORIZONTAL",
                    "CURVA VERTICAL",
                    "ROTONDA",
                    "DISTRIBUIDOR",
                    "BIFURCACION",
                    "PASO A NIVEL FFCC",
                    "PUENTE",
                    "VIADUCTO",
                    "TUNEL",
                    "CICLOVIA",
                    "FUERA DE CALZADA"
                  ].map((val) => (
                    <MenuItem key={val} value={val}>
                      {val}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* --- SECCIÓN: ESTADO DE LA CALZADA --- */}
        <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            ESTADO DE LA CALZADA
        </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="estadoFisicoCalzada"
            control={control}
            defaultValue=""
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Seleccionar Estado"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="APTO">APTO</MenuItem>
                <MenuItem value="CON BACHES">CON BACHES</MenuItem>
                <MenuItem value="AHUELLAMIENTO">AHUELLAMIENTO</MenuItem>
                <MenuItem value="EN REPARACION">EN REPARACIÓN</MenuItem>
                <MenuItem value="OTRO">OTRO (ESPECIFICAR)</MenuItem>
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
        <TextField
            fullWidth
            label="Especificar Estado (si corresponde)"
            {...register("estadoFisicoCalzada")}
            helperText="Completar solo si seleccionó OTRO"
        />
        </Grid>

        {/* --- SECCIÓN: ESTADO FÍSICO / AMBIENTAL DE LA CALZADA --- */}
        <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            ESTADO FÍSICO / AMBIENTAL DE LA CALZADA
        </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="estadoCalzada"
          control={control}
          defaultValue=""
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Condición de superficie"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="SECA">SECA</MenuItem>
              <MenuItem value="MOJADA">MOJADA</MenuItem>
              <MenuItem value="INUNDADA">INUNDADA</MenuItem>
              <MenuItem value="CON CHARCOS">CON CHARCOS</MenuItem>
              <MenuItem value="CON HIELO">CON HIELO</MenuItem>
              <MenuItem value="CON NIEVE">CON NIEVE</MenuItem>
              <MenuItem value="OTRO">OTRO (ESPECIFICAR)</MenuItem>
            </TextField>
          )}
        />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
        <TextField
            fullWidth
            label="Especificar Condición (si corresponde)"
            {...register("estadoCalzada")}
        />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="estadoAmbiental"
            control={control}
            defaultValue=""
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Estado Ambiental"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {["DESPEJADO", "LLUVIA", "NIEBLA", "VIENTO", "POLVO"].map((val) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
          {/* --- SECCIÓN: SEMÁFORO Y LUZ ARTIFICIAL --- */}
        <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            ILUMINACIÓN Y SEÑALIZACIÓN LUMINOSA
        </Typography>
        </Grid>

        {/* Semáforo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="semaforo"
            control={control}
            defaultValue=""
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Semáforo"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="SI">SI</MenuItem>
                <MenuItem value="NO">NO</MenuItem>
                <MenuItem value="INTERMITENTE">INTERMITENTE</MenuItem>
              </TextField>
            )}
          />
        </Grid>


            {/* Luz Artificial */}
            <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="luzArtificial"
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Luz Artificial"
                  helperText={fieldState.error?.message || "Indicar presencia y funcionamiento"}
                  error={!!fieldState.error}
                >
                  <MenuItem value="SI">SI</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                  <MenuItem value="FUNCIONA">FUNCIONA</MenuItem>
                </TextField>
              )}
            />
          </Grid>
            {/* --- SECCIÓN: MATERIAL DE LA CALZADA --- */}
            <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                MATERIAL DE LA CALZADA
            </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="materialCalzada"
                control={control}
                defaultValue=""
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Material"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="ASFALTO">ASFALTO</MenuItem>
                    <MenuItem value="RIPIO">RIPIO</MenuItem>
                    <MenuItem value="TIERRA">TIERRA</MenuItem>
                    <MenuItem value="ADOQUIN">ADOQUIN</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          <Grid size={{ xs: 12 }}><Divider /></Grid>
          {/* --- TIPO DE SINIESTRO --- */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="tipoSiniestro"
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Tipo de Siniestro"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="COLISION">COLISIÓN ENTRE VEHÍCULOS</MenuItem>
                  <MenuItem value="VUELCO">VUELCO</MenuItem>
                  <MenuItem value="DESPEÑAMIENTO">DESPEÑAMIENTO</MenuItem>
                  <MenuItem value="ATROPELLO_PEATON">ATROPELLO PEATÓN</MenuItem>
                  <MenuItem value="ATROPELLO_ANIMAL">ATROPELLO ANIMAL</MenuItem>
                  <MenuItem value="SALIDA DE LA CALZADA">SALIDA DE LA CALZADA</MenuItem>
                  <MenuItem value="CHOQUE CONTRA OBJETO FIJO">CHOQUE CONTRA OBJETO FIJO</MenuItem>
                  <MenuItem value="DESPISTE">DESPISTE</MenuItem>
                  <MenuItem value="DERRAPE">DERRAPE</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          {tipoSiniestro === "COLISION" && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="tipoColision"
                control={control}
                defaultValue=""
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Tipo de Colisión"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="FRONTAL">FRONTAL</MenuItem>
                    <MenuItem value="ALCANCE">POR ALCANCE</MenuItem>
                    <MenuItem value="LATERAL">LATERAL</MenuItem>
                    <MenuItem value="ANGULO">EN ÁNGULO</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          )}

        {/* --- SECCIÓN: POSIBLES CAUSAS DEL SINIESTRO --- */}
        <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            POSIBLES CAUSAS DEL SINIESTRO VIAL
        </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
        <Controller
          name="posiblesCausas"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <FullscreenMultiSelect
              label="Seleccionar Causas"
              value={field.value || []}
              onChange={field.onChange}
              placeholder="Seleccionar causas"
              options={[
                { id: "EXCESO DE VELOCIDAD", label: "EXCESO DE VELOCIDAD" },
                { id: "MANIOBRA RIESGOSA", label: "MANIOBRA RIESGOSA" },
                { id: "VIOLACION DEL SEMAFORO", label: "VIOLACIÓN DEL SEMÁFORO" },
                { id: "NO RESPETO DE LA PRIORIDAD", label: "NO RESPETO DE LA PRIORIDAD" },
                { id: "GIRO A LA IZQUIERDA/DERECHA", label: "GIRO A LA IZQUIERDA/DERECHA" },
                { id: "INVASION DE CARRIL CONTRARIO", label: "INVASIÓN DE CARRIL CONTRARIO" },
                { id: "PERDIDA DE CONTROL", label: "PÉRDIDA DE CONTROL" },
                { id: "PRESENCIA DE ALCOHOL Y/O DROGAS", label: "PRESENCIA DE ALCOHOL Y/O DROGAS" },
                { id: "CANSANCIO/FATIGA/SUEÑO", label: "CANSANCIO / FATIGA / SUEÑO" },
                { id: "DISTRACCION", label: "DISTRACCIÓN" },
                { id: "PEATON IMPRUDENTE", label: "PEATÓN IMPRUDENTE" },
                { id: "FALLA EN LA VIA", label: "FALLA EN LA VÍA" },
                { id: "FALLA EN EL VEHICULO", label: "FALLA EN EL VEHÍCULO" },
                { id: "NO SE PUEDE DETERMINAR", label: "NO SE PUEDE DETERMINAR" },
              ]}
            />
          )}
        />
        </Grid>
        {/*CARGAR UNIDADES*/}
        {unidadesFields.map((field, index) => (
          <Paper key={field.id} sx={{ p: 2, mb: 3 }}>
            <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                PERSONAL INTERVINIENTE POR UNIDADES
            </Typography>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 10 }}>
              <Controller
              name={`unidades.${index}.unidad`}
              control={control}
              render={({ field }) => (
              <TextField {...field} label="Unidad" fullWidth />
              )}
              />
              </Grid>
              <Grid size={{ xs: 12, md:4 }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              >
              <IconButton color="error" onClick={() => removeUnidad(index)}>
              <DeleteIcon />
              </IconButton>
              </Grid>


              {/* Personal de la unidad */}
              <Grid size={{ xs: 12 }}>
              <PersonalUnidad control={control} unidadIndex={index} />
              </Grid>
            </Grid>
          </Paper>
          ))}


          <Button
            variant="outlined"
            onClick={() =>
            appendUnidad({
            unidad: "",
            personal: [{ nombre: "", jerarquia: "", observacion: "" }],
            })
            }
            sx={{ mr: 2 }}
          >
            Agregar otra unidad
          </Button>

          {/* --- SÍNTESIS FINAL --- */}
          <Grid size={{ xs: 12 }}>
            <TextField 
              fullWidth 
              multiline 
              rows={5} 
              label="Síntesis del Hecho" 
              placeholder="Ej. En fecha 09/12/2025 a hora 00:00 por comunicación SAME/911/BASE OPERACIONAL/JEFE SUPERIOR/ AUTORIDAD…/ (EJ. SGTO AYTE VILTE DE BASE OPERACIONAL), se toma conocimiento de un hecho de vial en SOBRE RUTA NAC 9 ALT INGRESO AV FORESTAL, se dirige móvil K45 a cargo de SGTO AYTE ESCALERA con personal de servicio."
              {...register("sintesis")} 
            />
          </Grid>

          <SeccionProtagonistas control={control} register={register} watch={watch} />

          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              fullWidth
              sx={{ py: 1.5, fontWeight: 'bold' }}
            >
              Generar Informe Oficial
            </Button>
          </Grid>

        </Grid>
      </form>
    </Paper>
  );
};

export default FormularioHechoVial;