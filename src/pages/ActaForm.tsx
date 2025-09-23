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
import { SnackbarUtilities } from "../utilities/SnackbarUtilities";
import type { Puesto } from "../models/Puesto";
import { getPuestos } from "../services/PuestoService";

//Quitar estado inicial
const initialState: ActaRequest = {
  idGrupo: 1,
  idTipo: 2,
  idUser: 1,
  idPuesto:1,
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
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [tipoActa, setTipoActa] = useState<Tipo[]>([]);
  const [selectedPuesto, setSelectedPuesto] = useState<number | ''>('');
  const [selectedTipoActa, setSelectedTipoActa] = useState<number | ''>('');
  const [selectedGrupo, setSelectedGrupo] = useState<number | ''>('');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedLey, setSelectedLey] = useState<number | ''>('');
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<number[]>([]);
  const [leyes, setLeyes] = useState<Ley[]>([]);
  const [propietario, setPropietario] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      if(validate()){
        if(propietario){
          form.vehiculo.propietario = null;
        }
        console.log('propietario ', form.vehiculo.propietario)
        form.infractor.propietario = propietario;
        console.log('acta ', form)
        const response = await crearActa(form);
        console.log('Acta creada:', response);
        SnackbarUtilities.success('Acta creada exitasomente')
      }
      
    };
  
    const validate = () => {
      const e: Record<string, string> = {};

      // selects
      if (!selectedTipoActa) e.tipoActa = "El tipo de acta es obligatorio";
      if (!selectedGrupo) e.grupo = "El grupo es obligatorio";
      if (!selectedPuesto) e.puesto = "El puesto es obligatorio";


      // campos generales
      if (!form.motivo || form.motivo.trim().length === 0) e.motivo = "El motivo es obligatorio";
      if (!form.nro || form.nro.trim().length === 0) e.nro = "El número de acta es obligatorio";


      // infractor
      if (!form.infractor.nombre || form.infractor.nombre.trim() === "") e["infractor.nombre"] = "Nombre del infractor obligatorio";
      if (!form.infractor.apellido || form.infractor.apellido.trim() === "") e["infractor.apellido"] = "Apellido del infractor obligatorio";
      if (!/^[0-9]{8}$/.test(form.infractor.dni || "")) e["infractor.dni"] = "DNI del infractor debe tener 8 dígitos";
      if (!form.infractor.lugar || form.infractor.lugar.trim() === "") e["infractor.lugar"] = "Lugar obligatorio";


      // vehiculo
      const v = form.vehiculo;
      if (!v.marca || String(v.marca).trim() === "") e["vehiculo.marca"] = "Marca obligatoria";
      if (!v.modelo || String(v.modelo).trim() === "") e["vehiculo.modelo"] = "Modelo obligatorio";
      if (!v.año) e["vehiculo.año"] = "Año obligatorio";
      if (!v.dominio || String(v.dominio).trim() === "") e["vehiculo.dominio"] = "Dominio obligatorio";
      //if (!v.motor || String(v.motor).trim() === "") e["vehiculo.motor"] = "Motor obligatorio";
      //if (!v.cuadro || String(v.cuadro).trim() === "") e["vehiculo.cuadro"] = "Cuadro obligatorio";


      // propietario: si checkbox propietario === true => validar propietario dentro de vehiculo
      if (!propietario) {
      const p = form.vehiculo.propietario!;
      if (!p.nombre || p.nombre.trim() === "") e["vehiculo.propietario.nombre"] = "Nombre del propietario obligatorio";
      if (!p.apellido || p.apellido.trim() === "") e["vehiculo.propietario.apellido"] = "Apellido del propietario obligatorio";
      if (!/^[0-9]{8}$/.test(p.dni || "")) e["vehiculo.propietario.dni"] = "DNI del propietario debe tener 8 dígitos";
      if (!p.direccion || p.direccion.trim() === "") e["vehiculo.propietario.direccion"] = "Dirección del propietario obligatoria";
      }


      // ley
      if (!selectedLey) e.ley = "Debe seleccionar una ley";


      // articulos seleccionados
      if (articulosSeleccionados.length === 0) e.articulos = "Debe seleccionar al menos un artículo";


      setErrors(e);
      return Object.keys(e).length === 0;
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

  const fetchPuestos = async () => {
    try {
      const data = await getPuestos();
      setPuestos(data);
    } catch (error) {
      console.error('Error al obtener puestos', error);
    }
  };

  useEffect(()=> {
    fetchTipo();
    fetchGrupo();
    fetchLeyes();
    fetchPuestos();
  }, [])

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Crear Acta de Infracción
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>

          {/* Tipo de Acta */}
          <FormControl fullWidth margin="normal" error={!!errors.tipoActa}>
            <InputLabel id="tipo-acta-label">Tipo de Acta</InputLabel>
            <Select
            labelId="tipo-acta-label"
            id="tipo-acta"
            value={selectedTipoActa}
            label="Tipo de Acta"
            onChange={(e) => { setSelectedTipoActa(e.target.value as any); setErrors((er) => { const c = { ...er }; delete c.tipoActa; return c; }); }}
            >
            <MenuItem value="">Seleccione un tipo</MenuItem>
            {tipoActa.map((tipo) => (
            <MenuItem key={tipo.idTipo} value={tipo.idTipo}>
            {tipo.detalle}
            </MenuItem>
            ))}
            </Select>
            {!!errors.tipoActa && <FormHelperText>{errors.tipoActa}</FormHelperText>}
          </FormControl>

          {/* Puesto */}
          <FormControl fullWidth margin="normal" error={!!errors.puesto}>
            <InputLabel id="puesto-label">Puesto</InputLabel>
            <Select
            labelId="puesto-label"
            id="puesto"
            value={selectedPuesto}
            label="Puesto"
            onChange={(e) => { setSelectedPuesto(e.target.value as any); setErrors((er) => { const c = { ...er }; delete c.tipoActa; return c; }); }}
            >
            <MenuItem value="">Seleccione un puesto</MenuItem>
            {puestos.map((puesto) => (
            <MenuItem key={puesto.idPuesto} value={puesto.idPuesto}>
            {puesto.nombre}
            </MenuItem>
            ))}
            </Select>
            {!!errors.puesto && <FormHelperText>{errors.puesto}</FormHelperText>}
          </FormControl>


          {/* Grupo */}
          <FormControl fullWidth margin="normal" error={!!errors.grupo}>
          <InputLabel id="grupo-label">Grupo</InputLabel>
          <Select
          labelId="grupo-label"
          id="grupo"
          value={selectedGrupo}
          label="Grupo"
          onChange={(e) => { setSelectedGrupo(e.target.value as any); setErrors((er) => { const c = { ...er }; delete c.grupo; return c; }); }}
          >
          <MenuItem value="">Seleccione un grupo</MenuItem>
          {grupos.map((grupo) => (
          <MenuItem key={grupo.idGrupo} value={grupo.idGrupo}>
          {grupo.nombre}
          </MenuItem>
          ))}
          </Select>
          {!!errors.grupo && <FormHelperText>{errors.grupo}</FormHelperText>}
          </FormControl>


          {/* Datos generales */}
          <TextField
            label="Motivo"
            fullWidth
            margin="normal"
            onChange={(e) => handleChange("motivo", e.target.value)}
            value={form.motivo}
            error={!!errors.nro}
            helperText={errors.nro}
            />
          <TextField
            label="Número de Acta"
            fullWidth
            margin="normal"
            value={form.nro}
            onChange={(e) => handleChange("nro", e.target.value)}
            error={!!errors.nro}
            helperText={errors.nro}
            />

          {/* Infractor */}
            <Typography variant="h6" sx={{ mt: 3 }}>Infractor</Typography>
            <TextField label="Nombre" fullWidth margin="normal" value={form.infractor.nombre} onChange={(e) => handleChange("infractor.nombre", e.target.value)} error={!!errors["infractor.nombre"]} helperText={errors["infractor.nombre"]} />
            <TextField label="Apellido" fullWidth margin="normal" value={form.infractor.apellido} onChange={(e) => handleChange("infractor.apellido", e.target.value)} error={!!errors["infractor.apellido"]} helperText={errors["infractor.apellido"]} />
            <TextField label="DNI" fullWidth margin="normal" value={form.infractor.dni} onChange={(e) => handleChange("infractor.dni", e.target.value)} error={!!errors["infractor.dni"]} helperText={errors["infractor.dni"]} />
            <TextField label="Lugar" fullWidth margin="normal" value={form.infractor.lugar} onChange={(e) => handleChange("infractor.lugar", e.target.value)} error={!!errors["infractor.lugar"]} helperText={errors["infractor.lugar"]} />


            <FormControlLabel
            control={<Checkbox checked={propietario} onChange={(e) => { setPropietario(e.target.checked); if (!e.target.checked) setErrors((er) => { const c = { ...er }; delete c["vehiculo.propietario.nombre"]; delete c["vehiculo.propietario.apellido"]; delete c["vehiculo.propietario.dni"]; delete c["vehiculo.propietario.direccion"]; return c; }); }} />}
            label="¿Es propietario?"
            />
          {/* Vehículo */}
          <Typography variant="h6" sx={{ mt: 3 }}>Vehículo</Typography>
          <TextField label="Marca" fullWidth margin="normal" value={form.vehiculo.marca} onChange={(e) => handleChange("vehiculo.marca", e.target.value)} error={!!errors["vehiculo.marca"]} helperText={errors["vehiculo.marca"]} />
          <TextField label="Modelo" fullWidth margin="normal" value={form.vehiculo.modelo} onChange={(e) => handleChange("vehiculo.modelo", e.target.value)} error={!!errors["vehiculo.modelo"]} helperText={errors["vehiculo.modelo"]} />
          <TextField label="Año" type="number" fullWidth margin="normal" value={form.vehiculo.año as any} onChange={(e) => handleChange("vehiculo.año", e.target.value ? Number(e.target.value) : "")} error={!!errors["vehiculo.año"]} helperText={errors["vehiculo.año"]} />
          <TextField label="Dominio" fullWidth margin="normal" value={form.vehiculo.dominio} onChange={(e) => handleChange("vehiculo.dominio", e.target.value)} error={!!errors["vehiculo.dominio"]} helperText={errors["vehiculo.dominio"]} />
          <TextField label="Motor" fullWidth margin="normal" value={form.vehiculo.motor} onChange={(e) => handleChange("vehiculo.motor", e.target.value)} error={!!errors["vehiculo.motor"]} helperText={errors["vehiculo.motor"]} />
          <TextField label="Cuadro" fullWidth margin="normal" value={form.vehiculo.cuadro} onChange={(e) => handleChange("vehiculo.cuadro", e.target.value)} error={!!errors["vehiculo.cuadro"]} helperText={errors["vehiculo.cuadro"]} />

          {/* Propietario: se muestra sólo si propietario === true */}
            {!propietario && (
            <Box>
            <Typography variant="h6" sx={{ mt: 3 }}>Propietario</Typography>
            <TextField label="Nombre" fullWidth margin="normal" value={form.vehiculo.propietario?.nombre} onChange={(e) => handleChange("vehiculo.propietario.nombre", e.target.value)} error={!!errors["vehiculo.propietario.nombre"]} helperText={errors["vehiculo.propietario.nombre"]} />
            <TextField label="Apellido" fullWidth margin="normal" value={form.vehiculo.propietario?.apellido} onChange={(e) => handleChange("vehiculo.propietario.apellido", e.target.value)} error={!!errors["vehiculo.propietario.apellido"]} helperText={errors["vehiculo.propietario.apellido"]} />
            <TextField label="DNI" fullWidth margin="normal" value={form.vehiculo.propietario?.dni} onChange={(e) => handleChange("vehiculo.propietario.dni", e.target.value)} error={!!errors["vehiculo.propietario.dni"]} helperText={errors["vehiculo.propietario.dni"]} />
            <TextField label="Dirección" fullWidth margin="normal" value={form.vehiculo.propietario?.direccion} onChange={(e) => handleChange("vehiculo.propietario.direccion", e.target.value)} error={!!errors["vehiculo.propietario.direccion"]} helperText={errors["vehiculo.propietario.direccion"]} />
            </Box>
            )}

          {/* Ley */}
            <FormControl fullWidth margin="normal" error={!!errors.ley}>
            <InputLabel id="ley-select-label">Seleccione una Ley</InputLabel>
            <Select labelId="ley-select-label" id="ley-select" value={selectedLey.toString()} label="Seleccione una Ley" onChange={(e) => handleLeyChange(e as any)}>
            <MenuItem value="">Seleccione una opción</MenuItem>
            {leyes.map((ley) => (
            <MenuItem key={ley.idLey} value={ley.idLey}>
            {ley.nro}
            </MenuItem>
            ))}
            </Select>
            {!!errors.ley && <FormHelperText>{errors.ley}</FormHelperText>}
            </FormControl>


            {/* Artículos checklist */}
            {articulos.length > 0 && (
            <Box mt={3}>
            <Typography variant="h6">Artículos</Typography>
            <FormGroup>
            {articulos.map((articulo) => (
            <FormControlLabel
            key={articulo.idArt}
            control={<Checkbox checked={articulosSeleccionados.includes(articulo.idArt)} onChange={() => handleCheck(articulo.idArt)} />}
            label={`${articulo.nro}: ${articulo.detalle}`}
            />
            ))}
            </FormGroup>
            {!!errors.articulos && <FormHelperText error>{errors.articulos}</FormHelperText>}
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