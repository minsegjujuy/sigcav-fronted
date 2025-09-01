import { useEffect, useState } from "react";
import type { ActaRequest } from "../models/ActaRequest";
import { Box, Button, Checkbox, Container, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Paper, Select, TextField, Typography, type SelectChangeEvent } from "@mui/material";
import type { Articulo } from "../models/Articulo";
import type { Tipo } from "../models/Tipo";
import type { Grupo } from "../models/Grupo";
import type { Ley } from "../models/Ley";
import { getAllTipoActas } from "../services/TipoActaService";
import { getGrupos } from "../services/GrupoService";
import { getLeyes } from "../services/LeyService";
import { getArticulosByLey } from "../services/ArticuloService";
import { crearActa } from "../services/ActaService";

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
          <FormControl fullWidth margin="normal">
            <InputLabel id="grupo-label">Grupo</InputLabel>
            <Select
              labelId="grupo-label"
              id="grupo"
              value={selectedGrupo}
              label="Grupo"
              onChange={(e) => setSelectedGrupo(e.target.value)}
            >
              <MenuItem value="">Seleccione un grupo</MenuItem>
              {grupos.map((grupo) => (
                <MenuItem key={grupo.idGrupo} value={grupo.idGrupo}>
                  {grupo.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Datos generales */}
          <TextField label="Motivo" fullWidth margin="normal" value={form.motivo} onChange={(e) => handleChange("motivo", e.target.value)} />
          <TextField label="Número de Acta" fullWidth margin="normal" value={form.nro} onChange={(e) => handleChange("nro", e.target.value)} />

          {/* Infractor */}
          <Typography variant="h6" sx={{ mt: 3 }}>Infractor</Typography>
          <TextField label="Nombre" fullWidth margin="normal" value={form.infractor.nombre} onChange={(e) => handleChange("infractor.nombre", e.target.value)} />
          <TextField label="Apellido" fullWidth margin="normal" value={form.infractor.apellido} onChange={(e) => handleChange("infractor.apellido", e.target.value)} />
          <TextField label="DNI" fullWidth margin="normal" value={form.infractor.dni} onChange={(e) => handleChange("infractor.dni", e.target.value)} />
          <TextField label="Lugar" fullWidth margin="normal" value={form.infractor.lugar} onChange={(e) => handleChange("infractor.lugar", e.target.value)} />

          {/* Vehículo */}
          <Typography variant="h6" sx={{ mt: 3 }}>Vehículo</Typography>
          <TextField label="Marca" fullWidth margin="normal" value={form.vehiculo.marca} onChange={(e) => handleChange("vehiculo.marca", e.target.value)} />
          <TextField label="Modelo" fullWidth margin="normal" value={form.vehiculo.modelo} onChange={(e) => handleChange("vehiculo.modelo", e.target.value)} />
          <TextField label="Año" type="number" fullWidth margin="normal" value={form.vehiculo.año} onChange={(e) => handleChange("vehiculo.año", Number(e.target.value))} />
          <TextField label="Dominio" fullWidth margin="normal" value={form.vehiculo.dominio} onChange={(e) => handleChange("vehiculo.dominio", e.target.value)} />
          <TextField label="Motor" fullWidth margin="normal" value={form.vehiculo.motor} onChange={(e) => handleChange("vehiculo.motor", e.target.value)} />
          <TextField label="Cuadro" fullWidth margin="normal" value={form.vehiculo.cuadro} onChange={(e) => handleChange("vehiculo.cuadro", e.target.value)} />

          {/* Propietario */}
          <Typography variant="h6" sx={{ mt: 3 }}>Propietario</Typography>
          <TextField label="Nombre" fullWidth margin="normal" value={form.vehiculo.propietario.nombre} onChange={(e) => handleChange("vehiculo.propietario.nombre", e.target.value)} />
          <TextField label="Apellido" fullWidth margin="normal" value={form.vehiculo.propietario.apellido} onChange={(e) => handleChange("vehiculo.propietario.apellido", e.target.value)} />
          <TextField label="DNI" fullWidth margin="normal" value={form.vehiculo.propietario.dni} onChange={(e) => handleChange("vehiculo.propietario.dni", e.target.value)} />
          <TextField label="Dirección" fullWidth margin="normal" value={form.vehiculo.propietario.direccion} onChange={(e) => handleChange("vehiculo.propietario.direccion", e.target.value)} />

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