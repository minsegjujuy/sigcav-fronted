import { useState } from "react";
import type { ActaRequest } from "../models/ActaRequest";
import { Box, Button, Checkbox, Container, ListItemText, MenuItem, OutlinedInput, Paper, Select, TextField, Typography } from "@mui/material";
import type { Articulo } from "../models/Articulo";
import type { Tipo } from "../models/Tipo";
import type { Grupo } from "../models/Grupo";
import type { Puesto } from "../models/Puesto";

const initialState: ActaRequest = {
  idGrupo: 1,
  idTipo: 2,
  idUser: 3,
  motivo: "",
  nro: "",
  idPuesto: 1,
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
  const [grupo, setGrupo] = useState<Grupo[]>([]);
  const [puesto, setPuesto] = useState<Puesto[]>([]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado:", form);
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Crear Acta de Infracción
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>

          <TextField label="Motivo" fullWidth margin="normal"
            value={form.motivo}
            onChange={(e) => handleChange("motivo", e.target.value)} />

          <TextField label="Número de Acta" fullWidth margin="normal"
            value={form.nro}
            onChange={(e) => handleChange("nro", e.target.value)} />

          <Typography variant="h6" sx={{ mt: 3 }}>Infractor</Typography>
          <TextField label="Nombre" fullWidth margin="normal"
            value={form.infractor.nombre}
            onChange={(e) => handleChange("infractor.nombre", e.target.value)} />
          <TextField label="Apellido" fullWidth margin="normal"
            value={form.infractor.apellido}
            onChange={(e) => handleChange("infractor.apellido", e.target.value)} />
          <TextField label="DNI" fullWidth margin="normal"
            value={form.infractor.dni}
            onChange={(e) => handleChange("infractor.dni", e.target.value)} />
          <TextField label="Lugar" fullWidth margin="normal"
            value={form.infractor.lugar}
            onChange={(e) => handleChange("infractor.lugar", e.target.value)} />

          <Typography variant="h6" sx={{ mt: 3 }}>Vehículo</Typography>
          <TextField label="Marca" fullWidth margin="normal"
            value={form.vehiculo.marca}
            onChange={(e) => handleChange("vehiculo.marca", e.target.value)} />
          <TextField label="Modelo" fullWidth margin="normal"
            value={form.vehiculo.modelo}
            onChange={(e) => handleChange("vehiculo.modelo", e.target.value)} />
          <TextField label="Año" type="number" fullWidth margin="normal"
            value={form.vehiculo.año}
            onChange={(e) => handleChange("vehiculo.año", Number(e.target.value))} />
          <TextField label="Dominio" fullWidth margin="normal"
            value={form.vehiculo.dominio}
            onChange={(e) => handleChange("vehiculo.dominio", e.target.value)} />
          <TextField label="Motor" fullWidth margin="normal"
            value={form.vehiculo.motor}
            onChange={(e) => handleChange("vehiculo.motor", e.target.value)} />
          <TextField label="Cuadro" fullWidth margin="normal"
            value={form.vehiculo.cuadro}
            onChange={(e) => handleChange("vehiculo.cuadro", e.target.value)} />

          <Typography variant="h6" sx={{ mt: 3 }}>Propietario</Typography>
          <TextField label="Nombre" fullWidth margin="normal"
            value={form.vehiculo.propietario.nombre}
            onChange={(e) => handleChange("vehiculo.propietario.nombre", e.target.value)} />
          <TextField label="Apellido" fullWidth margin="normal"
            value={form.vehiculo.propietario.apellido}
            onChange={(e) => handleChange("vehiculo.propietario.apellido", e.target.value)} />
          <TextField label="DNI" fullWidth margin="normal"
            value={form.vehiculo.propietario.dni}
            onChange={(e) => handleChange("vehiculo.propietario.dni", e.target.value)} />
          <TextField label="Dirección" fullWidth margin="normal"
            value={form.vehiculo.propietario.direccion}
            onChange={(e) => handleChange("vehiculo.propietario.direccion", e.target.value)} />

          <Typography variant="h6" sx={{ mt: 3 }}>Artículos</Typography>
          <Select
            multiple
            fullWidth
            value={form.articulos}
            onChange={(e) => handleChange("articulos", e.target.value)}
            input={<OutlinedInput />}
            renderValue={(selected) =>
              articulos
                .filter((art) => selected.includes(art.idArt))
                .map((a) => a.detalle)
                .join(", ")
            }
          >
            {articulos.map((art) => (
              <MenuItem key={art.idArt} value={art.idArt}>
                <Checkbox checked={form.articulos.includes(art.idArt)} />
                <ListItemText primary={art.detalle} />
              </MenuItem>
            ))}
          </Select>

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4 }}>
            Enviar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}