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
import type { ActaRequestValidated } from "../validations/ValidacionActa";

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

export default function ActaFormDebug() {
  console.log("ActaFormDebug -> render inicio"); // confirma render
  const [articulos, setArticulos] = useState<any[]>([]);
  const [tipoActa, setTipoActa] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [selectedLey, setSelectedLey] = useState<number | "">("");
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<number[]>([]);
  const [leyes, setLeyes] = useState<any[]>([]);
  const [propietario, setPropietario] = useState(false);

  // OJO: paso userId 1 como ejemplo
  const { control, handleSubmit, register, formState: { errors }, isSubmitting, submitActa } = useActaForm(1, {
    onSuccess: (created) => { console.log("Acta creada OK", created); },
    onError: (err) => { console.error("Error guardando acta", err); }
  });

  useEffect(() => {
    // logs para confirmar el hook y el estado
    console.log("useEffect inicial ActaFormDebug");
    (async () => {
      try {
        const t = await getAllTipoActas(); setTipoActa(t);
        const g = await getGrupos(); setGrupos(g);
        const l = await getLeyes(); setLeyes(l);
        console.log("fetch inicial completado", { t, g, l });
      } catch (e) {
        console.error("fetch inicial fallo", e);
      }
    })();
  }, []);

  const handleLeyChange = async (event: any) => {
    const leyId = Number(event.target.value);
    setSelectedLey(leyId);
    try {
      const a = await getArticulosByLey(leyId);
      setArticulos(a);
      console.log("articulos por ley:", a);
    } catch (e) {
      console.error("error al obtener articulos", e);
    }
  };

  const handleCheck = (id: number) => {
    setArticulosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // función que realmente queremos que se ejecute al submit
  const onSubmit = async (values: any) => {
    console.log("=> onSubmit: entró handleSubmit", values);
    try {
      // FORZAMOS el uso de submitActa para ver logs
      const created = await submitActa(values);
      console.log("=> onSubmit: respuesta de submitActa:", created);
    } catch (err) {
      console.error("=> onSubmit: error submitActa:", err);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Crear Acta de Infracción (DEBUG)</Typography>

        {/* Cambio clave: uso <form> nativo para descartar forward props */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          onClick={() => console.log("form clicked")}
          style={{ padding: 8 }}
        >
          <FormControl fullWidth margin="normal" error={!!errors.idTipo}>
            <InputLabel id="tipo-acta-label">Tipo de Acta</InputLabel>
            <Controller
              name="idTipo"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Select {...field} labelId="tipo-acta-label" label="Tipo de acta">
                    <MenuItem value={0}>Seleccione...</MenuItem>
                    {tipoActa.map((ta) => <MenuItem key={ta.idTipo} value={ta.idTipo}>{ta.detalle}</MenuItem>)}
                  </Select>
                  <FormHelperText>{fieldState.error?.message || (errors.idTipo?.message as string)}</FormHelperText>
                </>
              )}
            />
          </FormControl>

          <TextField label="Observacion" fullWidth margin="normal" {...register("motivo")} error={!!errors.motivo} helperText={errors.motivo?.message} />
          <TextField label="Nro acta" fullWidth margin="normal" {...register("nro")} error={!!errors.nro} helperText={errors.nro?.message} />

          <Typography variant="h6" sx={{ mt: 3 }}>Infractor</Typography>
          <TextField label="Nombre" fullWidth margin="normal" {...register("infractor.nombre")} />
          <TextField label="Apellido" fullWidth margin="normal" {...register("infractor.apellido")} />

          <FormControlLabel
            control={<Checkbox checked={propietario} onChange={(e) => setPropietario(e.target.checked)} />}
            label="¿Es propietario?"
          />

          {/* Propietario del vehículo (si NO es propietario) */}
          {!propietario && (
            <div>
              <Typography variant="h6" sx={{ mt: 3 }}>Propietario</Typography>
              {/* NOTA: estos register usan paths profundos; asegurate que defaultValues no sean null */}
              <TextField label="Nombre" fullWidth margin="normal" {...register("vehiculo.propietario.nombre")} />
              <TextField label="Apellido" fullWidth margin="normal" {...register("vehiculo.propietario.apellido")} />
            </div>
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel id="ley-select-label">Seleccione una Ley</InputLabel>
            <Select labelId="ley-select-label" id="ley-select" value={String(selectedLey)} label="Seleccione una Ley" onChange={handleLeyChange}>
              <MenuItem value="">Seleccione una opción</MenuItem>
              {leyes.map((ley) => <MenuItem key={ley.idLey} value={ley.idLey}>{ley.nro}</MenuItem>)}
            </Select>
          </FormControl>

          {articulos.length > 0 && (
            <div style={{ marginTop: 12 }}>
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
            </div>
          )}

          {/* 2 formas de submit: normal y forzado */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>Enviar (submit)</Button>

            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                console.log("Botón forzar -> invocando handleSubmit manualmente");
                handleSubmit(onSubmit)(); // ejecuta handleSubmit explícitamente
              }}
            >
              Forzar submit
            </Button>
          </div>

          <pre style={{ marginTop: 12 }}>errors: {JSON.stringify(errors, null, 2)}</pre>
        </form>
      </Paper>
    </Container>
  );
}