import { useEffect, useState } from "react";
import type { ActaRequest } from "../models/ActaRequest";
import { Box, Button, Checkbox, Container, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, TextField, Typography, type SelectChangeEvent } from "@mui/material";
import type { Articulo } from "../models/Articulo";
import type { Tipo } from "../models/Tipo";
import type { Grupo } from "../models/Grupo";
import type { Ley } from "../models/Ley";
import { getAllTipoActas } from "../services/TipoActaService";
import { getGrupos } from "../services/GrupoService";
import { getLeyes } from "../services/LeyService";
import { getArticulosByLey } from "../services/ArticuloService";
import { SnackbarUtilities } from "../utilities/SnackbarUtilities";
import type { Puesto } from "../models/Puesto";
import { getPuestos } from "../services/PuestoService";
import ScrollButton from "../components/ScrollFilter";
import { findByDni } from "../services/InfractorService";
import type { Vehiculo } from "../models/Vehiculo";
import { actualizarActa, crearActa } from "../services/ActaService";
import { PropietarioService } from "../services/PropietarioService";
import { southAmericanCountries } from "../utilities/Paises";
import { argentinaProvinces } from "../utilities/Provincias";
import { actaResumenToActaRequest } from "../utilities/actaResumenToActaRequest";
import { useActa } from "../context/ActaResumenContext";
import { useNavigate } from "react-router-dom";
import { ADJUNTA } from "../utilities/adjunta";
import MapaJujuy from "../components/containers/MapaJujuy";
import type { UbicacionRequest } from "../models/UbicacionRequest";
import { obtenerUnidadesRegionalesPorDepartamento } from "../services/UnidadRegionalService";
import type { UnidadRegional } from "../models/UnidadRegional";
import { DateInput } from "../components/ui/datetime/FechaPicker.styles";
import { TIPO_RODADO } from "../utilities/tipoRodado";
import FullscreenMultiSelect from "../components/containers/MultiSelect";
//Quitar estado inicial
const initialState: ActaRequest = {
  idGrupo: 1,
  idTipo: 2,
  idUser: 1,
  idPuesto:1,
  motivo: "",
  fecha: "",
  nro: "",
  adjunta:"",
  retencion:"",
  ubicacionRequest: {lat:0,lng:0,departamento:'', unidadRegional:0},
  articulos: [],
  infractor: {
    idInfrac: null,
    nombre: "",
    apellido: "",
    dni: "",
    nacionalidad: "",
    provincia: '',
    propietario: true
  },
  vehiculo: {
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    dominio: "",
    motor: "",
    cuadro: "",
    tipoRodado: "",
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
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehiculo | null>(null);
  const [unidadesRegionales, setUnidadesRegionales] = useState<UnidadRegional[]>();
  const { actaSeleccionada, limpiarActa } = useActa();
  const [selected, setSelected] = useState<string[]>([]);
  const [otroTexto, setOtroTexto] = useState("");
  const navigate = useNavigate();
  const handleCountryChange = (e: SelectChangeEvent) => {
    const pais = e.target.value;

    setForm((prev) => ({
      ...prev,
      infractor: {
        ...prev.infractor,
        nacionalidad: pais,
        provincia: pais === "ARGENTINA" ? prev.infractor.provincia : "" // si no es Argentina, provincia en blanco
      }
    }));
  };

  const handleProvinceChange = (e: SelectChangeEvent) => {
    const provincia = e.target.value;

    setForm((prev) => ({
      ...prev,
      infractor: {
        ...prev.infractor,
        provincia
      }
    }));
  };

  const joinSelected = (updatedSelected: string[]): string => {
    return updatedSelected.join(", ");
  };


  const handleToggle = (value: string) => {
    setSelected(prev => {
      const updatedSelected = prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value];

      // Si se desmarca "Otro", limpiamos texto
      if (!updatedSelected.includes("Otro")) {
        setOtroTexto("");
      }

      // Actualizamos adjunta con el array ya actualizado
      setForm(prevForm => ({
        ...prevForm,
        adjunta: joinSelected(updatedSelected)
      }));

      return updatedSelected;
    });
  };



  const handleChange = async (path: string, value: any) => {
    const keys = path.split(".");
    if (path === "vehiculo.propietario.dni" && value.length === 8) {
        try {
          const { apellido, direccion, nombre, dni, idProp } =
            await PropietarioService.obtenerPorDni(value);

          setForm((prev) => ({
            ...prev,
            vehiculo: {
              ...prev.vehiculo,
              propietario: {
                idProp,
                nombre,
                apellido,
                dni,
                direccion,
              },
            },
          }));
        } catch (err) {
          console.error("Propietario no encontrado");
        }
      }else if (path === "vehiculo.propietario.dni" && value.length === 7){
        limpiarPropietario();
      }

    setForm(prev => {
      const updated = structuredClone(prev); // copia profunda segura
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        if (current[key] === undefined || current[key] === null) {
          current[key] = {};
        }

        current = current[key];
      }

      current[keys[keys.length - 1]] = value;

      return updated;
    });
  };

  const limpiarPropietario = () => {
    setForm((prev) => ({
            ...prev,
            vehiculo: {
              ...prev.vehiculo,
              propietario: {
                idProp: undefined,
                nombre : '',
                apellido: '',
                dni : '',
                direccion : '',
              },
            },
          }));
  }


  const handleLeyChange = (event: SelectChangeEvent) => {
    const leyId = Number(event.target.value);
    setSelectedLey(leyId);
    fetchArticulosPorLey(leyId);
  };

  /*const handleCheck = (idArt: number) => {
    const alreadySelected = articulosSeleccionados.includes(idArt);
    const updated = alreadySelected
      ? articulosSeleccionados.filter((id) => id !== idArt)
      : [...articulosSeleccionados, idArt];

    // actualizamos tanto el estado local como el form
    setArticulosSeleccionados(updated);
    setForm({
      ...form,
      articulos: updated,
    });
  };*/

  const fetchUnidadesRegionales = async (departamento: string) => {
    const data = await obtenerUnidadesRegionalesPorDepartamento(departamento);
    console.log('unidades regionales ', data);
    setUnidadesRegionales(data);
  }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(validate()){
        if(propietario){
          form.vehiculo.propietario = null;
        }
        console.log('propietario ', form.vehiculo.propietario)
        form.infractor.propietario = propietario;
        form.idTipo = Number(selectedTipoActa);
        form.articulos = articulosSeleccionados;
        console.log('acta ', form);
        let response = null;
        if(actaSeleccionada){
          response = await actualizarActa(form);
          limpiarActa();
          SnackbarUtilities.success('Acta modificada exitasomente')
        }else{
          response = await crearActa(form);
          SnackbarUtilities.success('Acta creada exitasomente')
          console.log('Acta creada:', response);
        }
        navigate('/dashboard/mis-actas')
      }else{
        SnackbarUtilities.error("Datos incorrectos, verificar que se hayan ingresado correctamente")
      }
      
    };

    const handleVehicleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = Number(event.target.value);
        console.log('estado vehiculo ',event.target.value);
        if (!id) {
          console.log('estado if ',event.target.value);
          setSelectedVehicle(null);
          setForm((prevForm) => ({...prevForm, vehiculo:{dominio: '', año: 2025,
            cuadro: '', marca: '', modelo: '', idVeh: null
          }}));
          return;
        }

        const vehiculo = vehiculos.find((v) => v.idVeh === id) || null;
        console.log('vehiculo seleccionado ',vehiculo)
        setSelectedVehicle(vehiculo);
        setForm({...form, vehiculo: {dominio: vehiculo?.dominio!, año: vehiculo?.año,
          cuadro: vehiculo?.cuadro!, marca: vehiculo?.marca, modelo: vehiculo?.modelo, idVeh: vehiculo?.idVeh
        }});
        if (!vehiculo?.propietario) {
          setPropietario(true);
        } else {
          setPropietario(!vehiculo.propietario); 
        }
    };

    const handleUnidadRegionalChange = (id: number) => {
      setForm(prevForm => ({
        ...prevForm,
        ubicacionRequest: {
          ...prevForm.ubicacionRequest,
          unidadRegional: id
        }
      }));

    }
  
    const validate = () => {
      const e: Record<string, string> = {};

      // selects
      if (!selectedTipoActa) e.tipoActa = "El tipo de acta es obligatorio";
      if (!selectedGrupo) e.grupo = "El grupo es obligatorio";
      if (!selectedPuesto) e.puesto = "El puesto es obligatorio";


      // campos generales
      if (!form.motivo || form.motivo.trim().length === 0) e.motivo = "El motivo es obligatorio";
      if (!form.nro || form.nro.trim().length === 0) e.nro = "El número de acta es obligatorio";
      if (!form.fecha || form.fecha.trim().length === 0) e.fecha = "La fecha es obligatoria";

      // infractor
      if (!form.infractor.nombre || form.infractor.nombre.trim() === "") e["infractor.nombre"] = "Nombre del infractor obligatorio";
      //if (!form.infractor.apellido || form.infractor.apellido.trim() === "") e["infractor.apellido"] = "Apellido del infractor obligatorio";
      if (!/^[0-9]{8}$/.test(form.infractor.dni || "")) e["infractor.dni"] = "DNI del infractor debe tener 8 dígitos";
      if (!form.infractor.nacionalidad || form.infractor.nacionalidad.trim() === "") e["infractor.nacionalidad"] = "Nacionalidad obligatoria";


      // vehiculo
      const v = form.vehiculo;
      //if (!v.marca || String(v.marca).trim() === "") e["vehiculo.marca"] = "Marca obligatoria";
      //if (!v.modelo || String(v.modelo).trim() === "") e["vehiculo.modelo"] = "Modelo obligatorio";
      //f (!v.año) e["vehiculo.año"] = "Año obligatorio";
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

      if (!form.ubicacionRequest.unidadRegional) e.ubicacionRequest = "Debe seleccionar una unidad regional";
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

  const handleMapSelect = async (point: UbicacionRequest) => {
    console.log('ubicacion ', point);
    await fetchUnidadesRegionales(point.departamento);
    //const ubicacion : UbicacionRequest = {...point, unidadRegional: 1};
    setForm((prevData) => ({...prevData, ubicacionRequest: point}));
  }

  const fetchInfractorByDni = async () => {
    const dni = form.infractor.dni;

    if (dni.length === 8) {
      try {
        const data = await findByDni(dni);
        console.log("infractor encontrado", data);
        if(data.idInfrac){
          setForm((prev) => ({
                    ...prev,
                    infractor: {
                      ...prev.infractor,
                      idInfrac: data.idInfrac || null,
                      nombre: data.nombre || "",
                      apellido: data.apellido || "",
                      dni: data.dni,
                      lugar: data.lugar || "",
                      propietario: data.propietario ?? true,
                    },
                  }));
                  setPropietario(true)
        }else{
          clearInfractor();
        }
        // Si el backend también devuelve los vehículos del infractor
        setVehiculos(data.vehiculos || []);
      } catch (error) {
        SnackbarUtilities.info('Infractor no encontrado, continue completando los datos')
      }
    }else{
      clearInfractor()
    }
  };

  const clearInfractor = () => {
    setForm((prev) => ({
          ...prev,
          infractor: {
            ...prev.infractor,
            idInfrac: null,
            nombre: "",
            apellido: "",
            lugar: "",
            propietario: false,
          }
        }));
      setVehiculos([]);
  }

  const handleFechaChange = (fecha: string) => {
    setForm((prevForm) => ({...prevForm, fecha: fecha}));
    console.log('fecha ', fecha)
  }

  useEffect(()=> {
    if (actaSeleccionada?.idActa) {
      console.log('acta para editar ', actaSeleccionada);
      const articulos = actaSeleccionada.articulos.map(a => a.idArt)
      setSelectedTipoActa(actaSeleccionada.idTipo);
      setSelectedGrupo(actaSeleccionada.idGrupo)
      setForm(actaResumenToActaRequest(actaSeleccionada));
      setArticulosSeleccionados(articulos);
      setSelectedLey(1);
      fetchArticulosPorLey(1);
      const ubicacion : UbicacionRequest = {
        departamento: actaSeleccionada.ubicacionResponse.departamento,
        lat: actaSeleccionada.ubicacionResponse.lat,
        lng: actaSeleccionada.ubicacionResponse.lng,
        //unidadRegional: actaSeleccionada.ubicacionResponse.unidadRegional
      }
      handleMapSelect(ubicacion);
      if(actaSeleccionada.adjunta){
        let partes = actaSeleccionada.adjunta?.split(',').map(item => item.trim());
        console.log('partes ', partes);
        setSelected(partes);
      }else{
        setSelected([]);
      }
      if(!actaSeleccionada.vehiculo.propietario){
        setPropietario(true);
      }
    }
    fetchTipo();
    fetchGrupo();
    fetchLeyes();
    fetchPuestos();
  }, [])

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Formulario de actas
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>Los campos con (*) son obligatorios</Typography>

        <Box component="form" onSubmit={handleSubmit}>

          {/* Tipo de Acta */}
          <FormControl fullWidth margin="normal" error={!!errors.tipoActa}>
            <InputLabel id="tipo-acta-label">Tipo de Acta *</InputLabel>
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

          {/* Fecha */}
          <FormControl sx={{ display: 'flex', alignItems: 'flex-start' }} error={!!errors.fecha}>
            <DateInput type="datetime-local" onChange={(e) => {
              handleFechaChange(e.target.value);
              setErrors(({ fecha: _, ...rest }) => rest);
            }}
            />
            {!!errors.fecha && <FormHelperText>{errors.fecha}</FormHelperText>}
          </FormControl>
          
          {/* Puesto */}
          <FormControl fullWidth margin="normal" error={!!errors.puesto}>
            <InputLabel id="puesto-label">Puesto *</InputLabel>
            <Select
              labelId="puesto-label"
              id="puesto"
              value={selectedPuesto}
              label="Puesto"
              onChange={(e) => {setSelectedPuesto(e.target.value as any); setErrors((er) => { const c = { ...er }; delete c.puesto; return c; }); }}
              >
              {puestos.map((puesto) => (
              <MenuItem key={puesto.idPuesto} value={puesto.idPuesto}>
              {puesto.nombre}
              </MenuItem>
              ))}
            </Select>
            {!!errors.puesto && <FormHelperText>{errors.puesto}</FormHelperText>}
          </FormControl>

          {/* Datos generales */}
            <FormControl sx={{ display: 'flex', alignItems: 'flex-start' }} error={!!errors.motivo}>
              <FormLabel id="demo-radio-buttons-group-label">Observacion *</FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="ALCOHOTEST"
                name="radio-buttons-group"
                onChange={(e) => {handleChange("motivo", e.target.value); setErrors((er) => { const c = { ...er }; delete c.motivo; return c; }); }}
                value={form.motivo}
              >
                <FormControlLabel value="POR HECHO VIAL" control={<Radio />} label="POR HECHO VIAL" />
                <FormControlLabel value="CONTROL RUTINARIO" control={<Radio />} label="CONTROL RUTINARIO" />
                <FormControlLabel value="CAMION VARADO" control={<Radio />} label="CAMION VARADO" />
                <FormControlLabel value="CONTROL DE VELOCIDAD" control={<Radio />} label="CONTROL DE VELOCIDAD" />
                <FormControlLabel value="ALCOHOTEST" control={<Radio />} label="ALCOHOTEST" />
              </RadioGroup>
              {!!errors.motivo && <FormHelperText>{errors.motivo}</FormHelperText>}
            </FormControl>
            {/* Grupo */}
              <FormControl fullWidth margin="normal" error={!!errors.grupo}>
              <InputLabel id="grupo-label">Grupo *</InputLabel>
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
            <FormControl component="fieldset">
            <FormLabel component="legend">Adjunta lo siguiente</FormLabel>

            <FormGroup sx={{ display: 'flex', alignItems: 'flex-start' }}>
              {ADJUNTA.map((opcion) => (
                <FormControlLabel
                  key={opcion}
                  control={
                    <Checkbox
                      checked={selected.includes(opcion)}
                      onChange={() => handleToggle(opcion)}
                      value={form.adjunta}
                    />
                  }
                  label={opcion}
                />
              ))}
            </FormGroup>
            {selected.includes("Otro") && (
              <TextField
                label="Especifique otro motivo"
                size="small"
                fullWidth
                sx={{ mt: 1 }}
                value={otroTexto}
                onChange={(e) => setOtroTexto(e.target.value)}
              />
            )}

          </FormControl>
          <FormControl sx={{ display: 'flex', alignItems: 'flex-start' }} error={!!errors.nro}>
            <TextField
              label="Número de Acta *"
              fullWidth
              margin="normal"
              value={form.nro}
              onChange={(e) => {
                handleChange("nro", e.target.value);

                setErrors((er) => {
                  const c = { ...er };
                  delete c.nro;
                  return c;
                });
              }}
              error={!!errors.nro}
              helperText={errors.nro}
              />
          </FormControl>

            <TextField
            label="Número de Acta de retencion"
            fullWidth
            margin="normal"
            value={form.retencion}
            onChange={(e) => handleChange("retencion", e.target.value)}
            />

          {/* Infractor */}
            <Typography variant="h6" sx={{ mt: 3 }}>Infractor</Typography>
            <TextField label="DNI *" fullWidth margin="normal" value={form.infractor.dni} onChange={(e) => {
              handleChange("infractor.dni", e.target.value);

              setErrors((er) => {
                const c = { ...er };
                delete c["infractor.dni"];
                return c;
              });
            }}
            error={!!errors["infractor.dni"]}
            helperText={errors["infractor.dni"]}
            />
              <Button onClick={fetchInfractorByDni}>Buscar</Button>
            <TextField label="Apellido y Nombre *" fullWidth margin="normal" value={form.infractor.nombre} onChange={(e) => {
              handleChange("infractor.nombre", e.target.value);

              setErrors((er) => {
                const c = { ...er };
                delete c["infractor.nombre"];
                return c;
              });
            }}
            error={!!errors["infractor.nombre"]}
            helperText={errors["infractor.nombre"]} />
            <FormControl fullWidth  error={!!errors["infractor.nacionalidad"]}>
            <InputLabel>Pais *</InputLabel>
            <Select
              value={form.infractor.nacionalidad}
              label="Pais"
              onChange={(e) => {
              handleCountryChange(e);
                setErrors(({ country: _, ...rest }) => rest);
                }}
            >
              {southAmericanCountries.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
            {!!errors.nacionalidad && <FormHelperText>{errors.nacionalidad}</FormHelperText>}
          </FormControl>

          {form.infractor.nacionalidad === "ARGENTINA" && (
            <FormControl fullWidth>
              <InputLabel>Provincia</InputLabel>
              <Select
                value={form.infractor.provincia}
                label="Provincia"
                onChange={handleProvinceChange}
              >
                {argentinaProvinces.map((prov) => (
                  <MenuItem key={prov} value={prov}>
                    {prov}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
            <FormControlLabel
            control={<Checkbox checked={propietario} onChange={(e) => { setPropietario(e.target.checked); if (!e.target.checked) setErrors((er) => { const c = { ...er }; delete c["vehiculo.propietario.nombre"]; delete c["vehiculo.propietario.apellido"]; delete c["vehiculo.propietario.dni"]; delete c["vehiculo.propietario.direccion"]; return c; }); }} />}
            label="¿Es propietario?"
            />
          
          {/* Vehículo */}
          {vehiculos && (
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 2 }}>
                Selecciona un vehículo *
              </FormLabel>

              <RadioGroup
                name="vehicle"
                value={selectedVehicle?.idVeh ?? ""}
                onChange={handleVehicleChange}
              >
                {vehiculos.map((vehicle) => (
                  <FormControlLabel
                    key={vehicle.idVeh}
                    value={vehicle.idVeh}
                    control={<Radio />}
                    label={`DOMINIO ${vehicle.dominio}`}
                  />
                ))}

                <FormControlLabel value="" control={<Radio />} label="Otro" />
              </RadioGroup>
            </FormControl>
          )}
          
          
            <Typography variant="h6" sx={{ mt: 3 }}>Vehículo</Typography>
            <TextField label="Marca" fullWidth margin="normal" value={form.vehiculo.marca} onChange={(e) => handleChange("vehiculo.marca", e.target.value)} error={!!errors["vehiculo.marca"]} helperText={errors["vehiculo.marca"]} />
            <TextField label="Modelo" fullWidth margin="normal" value={form.vehiculo.modelo} onChange={(e) => handleChange("vehiculo.modelo", e.target.value)} error={!!errors["vehiculo.modelo"]} helperText={errors["vehiculo.modelo"]} />
            <FormControl fullWidth>
            <InputLabel>Tipo rodado</InputLabel>
            <Select
              value={form.vehiculo.tipoRodado}
              label="Tipo rodado"
              onChange={(e)=>handleChange("vehiculo.tipoRodado", e.target.value)}
            >
              {TIPO_RODADO.map((tr) => (
                <MenuItem key={tr} value={tr}>
                  {tr}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
            <TextField label="Año" type="number" fullWidth margin="normal" value={form.vehiculo.año as any} onChange={(e) => handleChange("vehiculo.año", e.target.value ? Number(e.target.value) : "")} error={!!errors["vehiculo.año"]} helperText={errors["vehiculo.año"]} />
            <TextField label="Dominio *" fullWidth margin="normal" value={form.vehiculo.dominio} onChange={(e) => {
              handleChange("vehiculo.dominio", e.target.value);
              setErrors(({ ["vehiculo.dominio"]: _, ...rest }) => rest);
            }}
            error={!!errors["vehiculo.dominio"]}
            helperText={errors["vehiculo.dominio"]}
            />
            <TextField label="Motor" fullWidth margin="normal" value={form.vehiculo.motor} onChange={(e) => handleChange("vehiculo.motor", e.target.value)} error={!!errors["vehiculo.motor"]} helperText={errors["vehiculo.motor"]} />
            <TextField label="Cuadro" fullWidth margin="normal" value={form.vehiculo.cuadro} onChange={(e) => handleChange("vehiculo.cuadro", e.target.value)} error={!!errors["vehiculo.cuadro"]} helperText={errors["vehiculo.cuadro"]} />
          

          {/* Propietario: se muestra sólo si propietario === true */}
            {!propietario && (
            <Box>
            <Typography variant="h6" sx={{ mt: 3 }}>Propietario</Typography>
            <TextField label="DNI *" fullWidth margin="normal" value={form.vehiculo.propietario?.dni} onChange={(e) => handleChange("vehiculo.propietario.dni", e.target.value)} error={!!errors["vehiculo.propietario.dni"]} helperText={errors["vehiculo.propietario.dni"]} />
            <TextField label="Nombre *" fullWidth margin="normal" value={form.vehiculo.propietario?.nombre} onChange={(e) => handleChange("vehiculo.propietario.nombre", e.target.value)} error={!!errors["vehiculo.propietario.nombre"]} helperText={errors["vehiculo.propietario.nombre"]} />
            <TextField label="Apellido *" fullWidth margin="normal" value={form.vehiculo.propietario?.apellido} onChange={(e) => handleChange("vehiculo.propietario.apellido", e.target.value)} error={!!errors["vehiculo.propietario.apellido"]} helperText={errors["vehiculo.propietario.apellido"]} />
            <TextField label="Dirección *" fullWidth margin="normal" value={form.vehiculo.propietario?.direccion} onChange={(e) => handleChange("vehiculo.propietario.direccion", e.target.value)} error={!!errors["vehiculo.propietario.direccion"]} helperText={errors["vehiculo.propietario.direccion"]} />
            </Box>
            )}
            {/*Seleccionar ubicacion */}
            <MapaJujuy onSelect={handleMapSelect} />
            {unidadesRegionales ? (
              <>
                <FormControl error={!!errors.ubicacionRequest}>
                  <FormLabel component="legend" sx={{ mb: 2 }}>
                    Selecciona una unidad regional *
                  </FormLabel>
                  <RadioGroup
                    value={form.ubicacionRequest.unidadRegional}
                    onChange={(e) => {handleUnidadRegionalChange(Number(e.target.value)); setErrors((er) => { const c = { ...er }; delete c.ubicacionRequest; return c; }); }}
                  >
                    {unidadesRegionales.map((unidad) => (
                      <FormControlLabel
                        key={unidad.idUr}
                        value={unidad.idUr}
                        control={<Radio />}
                        label={unidad.nombre}
                      />
                    ))}
                  </RadioGroup>
                  {!!errors.ubicacionRequest && <FormHelperText>{errors.ubicacionRequest}</FormHelperText>}
                </FormControl>
                
              </>
            ) : (
              <Typography variant="h6">No se ha seleccionado ninguna ubicación</Typography>
            )}

          {/* Ley */}
            <FormControl fullWidth margin="normal" error={!!errors.ley}>
            <InputLabel id="ley-select-label">Seleccione una Ley *</InputLabel>
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

            {articulos.length > 0 && (
            <Grid size={{ xs: 12, md: 6, sm: 4 }}>
              <FullscreenMultiSelect
                label="Artículos"
                value={articulosSeleccionados}
                onChange={setArticulosSeleccionados}
                placeholder="Seleccionar artículos"
                options={articulos.map((art) => ({
                  id: art.idArt,
                  label: `${art.nro}: ${art.detalle}`,
                }))}
              />

              {!!errors.articulos && (
                <FormHelperText error>{errors.articulos}</FormHelperText>
              )}
            </Grid>
          )}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4 }}>
            Enviar
          </Button>
        </Box>
        <ScrollButton />
      </Paper>
    </Container>
  );
}