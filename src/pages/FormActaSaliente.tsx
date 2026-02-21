import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Chip,
  Box,
} from "@mui/material";
import type { Juzgado } from "../models/Juzgado";
import FullscreenMultiSelect from "../components/containers/MultiSelect";
import type { Articulo } from "../models/Articulo";
import { getArticulos } from "../services/ArticuloService";
import type { ActaSalienteDetalleRequest } from "../models/ActaSalienteDetalleRequest";

export interface ActaSalienteRequest {
    id: number | null; // null para nuevas actas
    lugar: string;
    fecha: string; // LocalDate en Java
    recibo: string;
    dictamen: string;
    
    // Datos del infractor
    nombreInfractor: string;
    dni: string;

    // Metadatos y estados
    retencion: boolean;
    descargo: boolean;
    cantidadFojas: number;
    juzgado: number;
    expediente: string;

    // Lista de actas asociadas
    actas: ActaSalienteDetalleRequest[];
}

interface Props {
  defaultValues?: Partial<ActaSalienteRequest>;
  onSubmit: (data: ActaSalienteRequest) => Promise<void>;
  juzgados: Juzgado[];
  action: 'edit' | 'create'
}

const FormActaSaliente: React.FC<Props> = ({
  defaultValues,
  onSubmit,
  juzgados,
  action
}) => {
  const { control, handleSubmit, reset } = useForm<ActaSalienteRequest>({
    defaultValues: {
      id: undefined,
      lugar: "",
      fecha: "",
      recibo: "",
      dictamen: "",
      nombreInfractor: "",
      dni: "",
      retencion: false,
      actas: [],
      descargo: false,
      cantidadFojas: 0,
      juzgado: undefined,
      expediente: "",
      ...defaultValues,
    },
  });
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "actas"
  });

  const fetchArticulos = async () => {
      const data = await getArticulos();
      setArticulos(data);
      console.log('data articulos ', data)
    }

  useEffect(() => {
    fetchArticulos();
  if (action === 'create') {
    reset({
      id: undefined,
      lugar: "",
      fecha: "",
      recibo: "",
      dictamen: "",
      nombreInfractor: "",
      dni: "",
      retencion: false,
      descargo: false,
      cantidadFojas: 0,
      juzgado: undefined,
      actas:[],
      expediente:""
    });
  }
}, [action, reset]);


  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h6" mb={2}>
        Formulario de Acta Saliente
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* --- SECCIÓN 1: DATOS GENERALES --- */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="fecha"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Fecha General" type="date" fullWidth InputLabelProps={{ shrink: true }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="lugar"
              control={control}
              render={({ field }) => (
                <TextField select label="Lugar" {...field} fullWidth>
                  <MenuItem value="BARRIO NORTE 107">BARRIO NORTE 107</MenuItem>
                  <MenuItem value="DTO PERICO">DTO PERICO</MenuItem>
                  <MenuItem value="DTO CHAMICAL">DTO CHAMICAL</MenuItem>
                  <MenuItem value="DTO PAMPA BLANCA">DTO PAMPA BLANCA</MenuItem>
                  <MenuItem value="DTSV">DTSV</MenuItem>
                  <MenuItem value="SSV">SSV</MenuItem>
                  <MenuItem value="SUSQUES">SUSQUES</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="juzgado"
              control={control}
              render={({ field }) => (
                <TextField select label="Juzgado" {...field} fullWidth>
                  {juzgados.map((j) => (
                    <MenuItem key={j.id} value={j.id}>{j.nombre}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* --- SECCIÓN 2: INFRACTOR --- */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Controller
              name="nombreInfractor"
              control={control}
              render={({ field }) => <TextField {...field} label="Nombre Infractor" fullWidth />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="dni"
              control={control}
              render={({ field }) => <TextField {...field} label="DNI" fullWidth />}
            />
          </Grid>

          {/* --- SECCIÓN 3: DETALLES DINÁMICOS (LISTA DE ACTAS) --- */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }}>
              <Chip label="Detalle de Actas Involucradas" />
            </Divider>
            
            {fields.map((item, index) => (
              <Box key={item.id} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Controller
                      name={`actas.${index}.nroActa`}
                      control={control}
                      render={({ field }) => <TextField {...field} label="N° Acta" fullWidth size="small" />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Controller
                      name={`actas.${index}.tipo`}
                      control={control}
                      render={({ field }) => (
                        <TextField select label="Tipo" {...field} fullWidth size="small">
                          <MenuItem value="PDA">PDA</MenuItem>
                          <MenuItem value="SERIE B">SERIE B</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Controller
                      name={`actas.${index}.fechaActa`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Fecha Acta" type="datetime-local" fullWidth size="small" InputLabelProps={{ shrink: true }} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Button color="error" onClick={() => remove(index)}>Eliminar</Button>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name={`actas.${index}.articulado`}
                      control={control}
                      render={({ field }) => (
                        <FullscreenMultiSelect
                          label="Artículos del Acta"
                          value={field.value ? field.value.split(", ") : []}
                          onChange={(vals) => field.onChange(vals.join(", "))}
                          options={articulos.map(a => ({ id: a.nro, label: a.nro, description: a.detalle }))}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button variant="outlined" onClick={() => append({ nroActa: '', tipo: '', fechaActa: '', articulado: '' })}>
              + Agregar otra Acta
            </Button>
          </Grid>

          {/* --- SECCIÓN 4: DATOS FINALES --- */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="recibo"
              control={control}
              render={({ field }) => <TextField {...field} label="Recibo" fullWidth />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="dictamen"
              control={control}
              render={({ field }) => <TextField {...field} label="Dictamen" fullWidth />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="expediente"
              control={control}
              render={({ field }) => <TextField {...field} label="Expediente" fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="retencion"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <FormLabel>Retención</FormLabel>
                  <RadioGroup row {...field} onChange={(e) => field.onChange(e.target.value === "true")}>
                    <FormControlLabel value="true" control={<Radio />} label="Sí" />
                    <FormControlLabel value="false" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="descargo"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <FormLabel>¿Presentó descargo?</FormLabel>
                  <RadioGroup row {...field} onChange={(e) => field.onChange(e.target.value === "true")}>
                    <FormControlLabel value="true" control={<Radio />} label="Sí" />
                    <FormControlLabel value="false" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              )}
            />
          </Grid>

          {/* ... (campos similares para descargo y licencia) */}

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="cantidadFojas"
              control={control}
              render={({ field }) => <TextField {...field} type="number" label="Cantidad Fojas" fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button type="submit" variant="contained" color="primary" fullWidth size="large">
              Guardar Acta Saliente
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default FormActaSaliente;
