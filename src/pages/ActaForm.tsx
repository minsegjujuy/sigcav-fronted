import { useEffect, useState } from "react";
import type { ActaRequest } from "../models/ActaRequest";
import { Box, Button, Checkbox, Container, FormControl, FormControlLabel, FormGroup, FormHelperText, InputLabel, MenuItem, Paper, Select, TextField, Typography, type SelectChangeEvent } from "@mui/material";
import type { Articulo } from "../models/Articulo";
import type { Tipo } from "../models/Tipo";
import type { Grupo } from "../models/Grupo";
import type { Ley } from "../models/Ley";
import { getAllTipoActas } from "../services/TipoActaService";
import { getGrupos } from "../services/GrupoService";
import { getLeyes } from "../services/LeyService";
import { getArticulosByLey } from "../services/ArticuloService";
import { crearActa } from "../services/ActaService";
import { useActaForm } from "../hooks/useActaForm";
import { Controller } from "react-hook-form";

const initialState: ActaRequest = {
  idGrupo: 1,
  idTipo: 2,
  idUser: 3,
  motivo: "",
  nro: "",
  articulos: [],
  infractor: {
    nombre: "",
    apellido: "",
    dni: "",
    lugar: "",
    propietario: true
  },
  vehiculo: {
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    dominio: "",
    motor: "",
    cuadro: "",
    propietario: {
      nombre: "",
      apellido: "",
      dni: "",
      direccion: "",
    },
  },
};

export default function ActaForm() {
  const [form, setForm] = useState<ActaRequest>(initialState);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [tipoActa, setTipoActa] = useState<Tipo[]>([]);
  const [selectedTipoActa, setSelectedTipoActa] = useState<number | ''>('');
  const [selectedGrupo, setSelectedGrupo] = useState<number | ''>('');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedLey, setSelectedLey] = useState<number | ''>('');
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<number[]>([]);
  const [leyes, setLeyes] = useState<Ley[]>([]);
  const [propietario, setPropietario] = useState(false);
  const { register, watch, control, formState: { errors , isSubmitting } } =
  useActaForm(1);

  const handleChange = (path: string, value: any) => {
    const keys = path.split(".");
    setForm((prev) => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleLeyChange = (event: SelectChangeEvent) => {
    const leyId = Number(event.target.value);
    setSelectedLey(leyId);
    fetchArticulosPorLey(leyId);
  };

  const handleCheck = (id: number) => {
    setArticulosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if(propietario){
          form.vehiculo.propietario = null;
        }
        console.log('acta request ', watch())
        console.log('propietario ', form.vehiculo.propietario)
        form.infractor.propietario = propietario;
        const response = await crearActa(form);
        console.log('Acta creada:', response);
        alert('Acta creada exitosamente')
        // mostrar mensaje de éxito o redireccionar
      } catch (error) {
        console.error('Error al crear el acta:', error);
      }
    };

  const fetchTipo = async () => {
    const data = await getAllTipoActas();
    setTipoActa(data);
    console.log('tipo acta ', data)
  }

  const fetchGrupo = async () => {
    const data = await getGrupos();
    setGrupos(data);
    console.log('grupos ', data);
  }

  const fetchLeyes = async () => {
    const data = await getLeyes();
    setLeyes(data);
    console.log('leyes ', data)
  }

  const fetchArticulosPorLey = async (ley: number) => {
    const data = await getArticulosByLey(ley);
    setArticulos(data);
    console.log('articulo por ley ', data)
  }

  /*const fetchPuestos = async () => {
    try {
      const data = await getPuestos();
      setPuestos(data);
    } catch (error) {
      console.error('Error al obtener puestos', error);
    }
  };*/

  useEffect(()=> {
    fetchTipo();
    fetchGrupo();
    fetchLeyes();
    //fetchPuestos();
  }, [])

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Crear Acta de Infracción
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>

          {/* Tipo de Acta */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="tipo-acta-label">Tipo de Acta</InputLabel>
            <Select
              labelId="tipo-acta-label"
              id="tipo-acta"
              value={selectedTipoActa}
              label="Tipo de Acta"
              onChange={(e) => setSelectedTipoActa(e.target.value)}
            >
              {tipoActa.map((tipo) => (
                <MenuItem key={tipo.idTipo} value={tipo.idTipo}>
                  {tipo.detalle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Grupo */}
          <FormControl fullWidth margin="normal" error={!!errors.idGrupo}>
            <InputLabel id="grupo-label">Grupo</InputLabel>
            <Controller
              name="idGrupo"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Select {...field} labelId="grupo-label" label="Grupo">
                    <MenuItem value={0}>Seleccione...</MenuItem>
                    {grupos.map((g) => (
                      <MenuItem key={g.idGrupo} value={g.idGrupo}>{g.nombre}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{fieldState.error?.message || (errors.idGrupo?.message as string)}</FormHelperText>
                </>
              )}
            />
          </FormControl>

          {/* Datos generales */}
          <TextField label="Motivo" fullWidth margin="normal" value={form.motivo} onChange={(e) => handleChange("motivo", e.target.value)} />
          <TextField label="Número de Acta" fullWidth margin="normal" value={form.nro} onChange={(e) => handleChange("nro", e.target.value)} />

          {/* Infractor */}
          <Typography variant="h6" sx={{ mt: 3 }}>Infractor</Typography>
          <TextField label="Nombre" fullWidth margin="normal" {...register("infractor.nombre")} error={!!errors.infractor?.nombre} helperText={errors.infractor?.nombre?.message} />
          <TextField label="Apellido" fullWidth margin="normal" {...register("infractor.apellido")} error={!!errors.infractor?.apellido} helperText={errors.infractor?.apellido?.message} />
          <TextField label="DNI" fullWidth margin="normal" {...register("infractor.dni")} error={!!errors.infractor?.dni} helperText={errors.infractor?.dni?.message} />
          <TextField label="Lugar" fullWidth margin="normal" {...register("infractor.lugar")} error={!!errors.infractor?.lugar} helperText={errors.infractor?.lugar?.message} />

          <FormControlLabel
            control={
              <Checkbox
                      checked={propietario}
                      onChange={(e) => setPropietario(e.target.checked)}
                    />
                  }
                  label="¿Es propietario?"
                />
          {/* Vehículo */}
          <Typography variant="h6" sx={{ mt: 3 }}>Vehículo</Typography>
          <TextField label="Marca" fullWidth margin="normal" {...register("vehiculo.marca")} error={!!errors.vehiculo?.marca} helperText={errors.vehiculo?.marca?.message} />
          <TextField label="Modelo" fullWidth margin="normal" {...register("vehiculo.modelo")} error={!!errors.vehiculo?.modelo} helperText={errors.vehiculo?.modelo?.message} />
          <TextField label="Año" type="number" fullWidth margin="normal" {...register("vehiculo.año", { valueAsNumber: true })} error={!!errors.vehiculo?.año} helperText={errors.vehiculo?.año?.message} />
          <TextField label="Dominio" fullWidth margin="normal" inputProps={{ style: { textTransform: "uppercase" } }} {...register("vehiculo.dominio", { setValueAs: v => (v ? String(v).toUpperCase() : v) })} error={!!errors.vehiculo?.dominio} helperText={errors.vehiculo?.dominio?.message} />
          <TextField label="Motor" fullWidth margin="normal" {...register("vehiculo.motor")} error={!!errors.vehiculo?.motor} helperText={errors.vehiculo?.motor?.message} />
          <TextField label="Cuadro" fullWidth margin="normal" {...register("vehiculo.cuadro")} error={!!errors.vehiculo?.cuadro} helperText={errors.vehiculo?.cuadro?.message} />

          {/* Propietario del vehículo (si NO es propietario) */}
          {!propietario && (
            <Box>
              <Typography variant="h6" sx={{ mt: 3 }}>Propietario</Typography>
              <TextField label="Nombre" fullWidth margin="normal" {...register("vehiculo.propietario.nombre")} error={!!errors.vehiculo?.propietario?.nombre} helperText={errors.vehiculo?.propietario?.nombre?.message} />
              <TextField label="Apellido" fullWidth margin="normal" {...register("vehiculo.propietario.apellido")} error={!!errors.vehiculo?.propietario?.apellido} helperText={errors.vehiculo?.propietario?.apellido?.message} />
              <TextField label="DNI" fullWidth margin="normal" {...register("vehiculo.propietario.dni")} error={!!errors.vehiculo?.propietario?.dni} helperText={errors.vehiculo?.propietario?.dni?.message} />
              <TextField label="Dirección" fullWidth margin="normal" {...register("vehiculo.propietario.direccion")} error={!!errors.vehiculo?.propietario?.direccion} helperText={errors.vehiculo?.propietario?.direccion?.message} />
            </Box>
          )}

          {/* Ley */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="ley-select-label">Seleccione una Ley</InputLabel>
            <Select
              labelId="ley-select-label"
              id="ley-select"
              value={selectedLey.toString()}
              label="Seleccione una Ley"
              onChange={(e) => handleLeyChange(e)}
            >
              <MenuItem value="">Seleccione una opción</MenuItem>
              {leyes.map((ley) => (
                <MenuItem key={ley.idLey} value={ley.idLey}>
                  {ley.nro}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Artículos checklist */}
          {articulos.length > 0 && (
            <Box mt={3}>
              <Typography variant="h6">Artículos</Typography>
              <FormGroup>
                {articulos.map((articulo) => (
                  <FormControlLabel
                    key={articulo.idArt}
                    control={
                      <Checkbox
                        checked={articulosSeleccionados.includes(articulo.idArt)}
                        onChange={() => handleCheck(articulo.idArt)}
                      />
                    }
                    label={`${articulo.nro}: ${articulo.detalle}`}
                  />
                ))}
              </FormGroup>
            </Box>
          )}

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4 }}>
            Enviar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}