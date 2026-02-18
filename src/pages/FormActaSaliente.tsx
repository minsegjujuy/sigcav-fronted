import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
} from "@mui/material";
import type { Juzgado } from "../models/Juzgado";
import FullscreenMultiSelect from "../components/containers/MultiSelect";
import type { Articulo } from "../models/Articulo";
import { getArticulos } from "../services/ArticuloService";

export interface ActaSalienteRequest {
  id?: number;
  lugar: string;
  fecha: string;
  recibo: string;
  dictamen: string;
  nroActa: string;
  fechaActa: string;
  nombreInfractor: string;
  dni: string;
  tipo: string;
  articulado: string;
  retencion: boolean;
  descargo: boolean;
  cantidadFojas: number;
  juzgado: number;
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
      nroActa: "",
      fechaActa: "",
      nombreInfractor: "",
      dni: "",
      tipo: "",
      articulado: "",
      retencion: false,
      descargo: false,
      cantidadFojas: 0,
      juzgado: undefined,
      ...defaultValues,
    },
  });
  const [articulos, setArticulos] = useState<Articulo[]>([]);

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
      nroActa: "",
      fechaActa: "",
      nombreInfractor: "",
      dni: "",
      tipo: "",
      articulado: "",
      retencion: false,
      descargo: false,
      cantidadFojas: 0,
      juzgado: undefined,
    });
  }
}, [action, reset]);


  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h6" mb={2}>
        Acta Saliente
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {[
            { name: "fecha", label: "Fecha", type: "datetime-local" },
            { name: "recibo", label: "Recibo" },
            { name: "dictamen", label: "Dictamen" },
            { name: "nroActa", label: "N° Acta" },
            { name: "fechaActa", label: "Fecha Acta", type: "datetime-local" },
            { name: "nombreInfractor", label: "Nombre Infractor" },
            { name: "dni", label: "DNI" },
          ].map((field) => (
            <Grid size={{xs:12, md:6}} key={field.name}>
              <Controller
                name={field.name as keyof ActaSalienteRequest}
                control={control}
                render={({ field: controllerField }) => (
                  <TextField
                    {...controllerField}
                    label={field.label}
                    type={field.type || "text"}
                    fullWidth
                    InputLabelProps={field.type ? { shrink: true } : undefined}
                  />
                )}
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
                name="lugar"
                control={control}
                render={({ field }) => (
                <TextField select label="Lugar" {...field} fullWidth>
                    <MenuItem value="BARRIO NORTE 107">BARRIO NORTE 107</MenuItem>
                    <MenuItem value="DTO CHAMICAL">DTO CHAMICAL</MenuItem>
                    <MenuItem value="DTO PAMPA BLANCA">DTO PAMPA BLANCA</MenuItem>
                    <MenuItem value="DTO PERICO">DTO PERICO</MenuItem>
                    <MenuItem value="DTSV">DTSV</MenuItem>
                    <MenuItem value="SSV">SSV</MenuItem>
                    <MenuItem value="SUSQUES">SUSQUES</MenuItem>
                </TextField>
                )}
            />
            </Grid>
            <FormControl fullWidth>
            <Controller
                name="articulado"
                control={control}
                render={({ field }) => {
                // convertir string del form → array de labels para el select
                const selectedValues = field.value
                    ? field.value.split(", ").map(v => v.trim())
                    : [];

                return (
                    <FullscreenMultiSelect
                    label="Artículos"
                    value={selectedValues}
                    onChange={(values: string[]) => {
                        // convertir array → string "ART 1, ART 40"
                        const articuladosString = values.join(", ");
                        field.onChange(articuladosString);
                    }}
                    options={articulos.map(a => ({
                        id: a.nro,
                        label: a.nro,
                        description: a.detalle,
                    }))}
                    placeholder="Seleccionar artículos"
                    />
                );
                }}
            />
            </FormControl>
            <Grid size={{ xs: 12, md: 6 }}>
            <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                <TextField select label="Tipo de acta" {...field} fullWidth>
                    <MenuItem value="PDA">PDA</MenuItem>
                    <MenuItem value="SERIE B">SERIE B</MenuItem>
                </TextField>
                )}
            />
            </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
                name="retencion"
                control={control}
                render={({ field }) => (
                <FormControl>
                    <FormLabel>Retención</FormLabel>
                    <RadioGroup
                    row
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    >
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
                    <FormLabel>Descargo</FormLabel>
                    <RadioGroup
                    row
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    >
                    <FormControlLabel value="true" control={<Radio />} label="Sí" />
                    <FormControlLabel value="false" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>
                )}
            />
            </Grid>
          <Grid size={{xs:12, md:4}}>
            <Controller
              name="cantidadFojas"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Cantidad de fojas"
                  type="number"
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid size={{xs:12, md:4}}>
            <Controller
              name="juzgado"
              control={control}
              render={({ field }) => (
                <TextField select label="Juzgado" {...field} fullWidth>
                  {juzgados.map((j) => (
                    <MenuItem key={j.id} value={j.id}>
                      {j.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{xs:12}}>
            <Button type="submit" variant="contained" fullWidth>
              Guardar Acta Saliente
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default FormActaSaliente;
