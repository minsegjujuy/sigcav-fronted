import { useEffect, useState } from "react";
import { keyframes } from "@emotion/react";
import { useRef } from "react";
import type { StepIconProps } from "@mui/material/StepIcon";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import type { ActaRequest } from "../models/ActaRequest";
import { Box, Button, Checkbox, Container, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, Step, StepLabel, Stepper, Tab, Tabs, TextField, Typography, type SelectChangeEvent } from "@mui/material";
import type { Articulo } from "../models/Articulo";
import { getArticulosByLey } from "../services/ArticuloService";
import { SnackbarUtilities } from "../utilities/SnackbarUtilities";
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
import type { Localidad } from "../models/Localidad";
import { DateInput } from "../components/ui/datetime/FechaPicker.styles";
import { TIPO_RODADO } from "../utilities/tipoRodado";
import FullscreenMultiSelect from "../components/containers/MultiSelect";
import type { VehiculoSolicitud } from "../models/VehiculoSolicitud";
import type { InfractorSolicitud } from "../models/InfractorSolicitud";
import type { Propietario } from "../models/Propietario";
import type { OcrDocumentType } from "../services/OcrService";
import DocumentDataCapture from "../components/modules/DocumentDataCapture";
import FirmaCapture, { type FirmaCaptureHandle } from "../components/modules/FirmaCapture";
import type { FirmaDTO, TestigoRequest } from "../models/FirmaDTO";
import type { Juzgado } from "../models/Juzgado";
import { useGetGruposQuery, useGetjuzgadosQuery, useGetLeyesQuery, useGetPuestosQuery, useGetTiposQuery } from "../redux/api/puestoApi";
const tabPulse = keyframes`
  0%, 100% {
    opacity: 1;
    filter: drop-shadow(0 0 0 rgba(25, 118, 210, 0));
  }
  50% {
    opacity: 0.75;
    filter: drop-shadow(0 0 8px rgba(25, 118, 210, 0.45));
  }
`;

const tabPulseSx = {
  animation: `${tabPulse} 1.6s ease-in-out infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    filter: 'none',
  },
} as const;

const getOrCreateDeviceId = (): string => {
  const storageKey = "sv_device_id";
  try {
    const existing = localStorage.getItem(storageKey);
    if (existing) return existing;

    const next = crypto.randomUUID();
    localStorage.setItem(storageKey, next);
    return next;
  } catch {
    return "unknown";
  }
};
function ProgressStepIcon(props: StepIconProps) {
  const { active, completed, icon } = props;

  const size = active ? 34 : 24;
  const color = active
    ? "primary.main"
    : completed
      ? "success.main"
      : "text.secondary";

  const iconNode = (() => {
    switch (String(icon)) {
      case "1":
        return <DescriptionOutlinedIcon sx={{ fontSize: size, color }} />;
      case "2":
        return <PersonOutlinedIcon sx={{ fontSize: size, color }} />;
      case "3":
        return <DirectionsCarOutlinedIcon sx={{ fontSize: size, color }} />;
      case "4":
        return <BorderColorOutlinedIcon sx={{ fontSize: size, color }} />;
      default:
        return null;
    }
  })();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 160ms ease",
        transform: active ? "scale(1.08)" : "scale(1)",
      }}
    >
      {iconNode}
    </Box>
  );
}
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
  graduacionAlcoholica: 0,
  infractorFugado: false,
  juzgado: 0,
  retencionVehiculo: false,
  ubicacionRequest: {lat:0,lng:0,departamento:'', unidadRegional:0, descripcion:'', localidad: 0},
  articulos: [],
  infractor: {
    idInfrac: null,
    nombre: "",
    apellido: "",
    domicilio:"",
    fechaNacimiento:"",
    localidad:"",
    dni: "",
    nacionalidad: "",
    provincia: '',
    clase: "",
    numero: "",
    autoridadExpedicion: "",
    fechaExpedicion: "",
    fechaVencimiento: "",
    propietario: true,
  },
  vehiculo: {
    marca: "",
    modelo: "",
    dominio: "",
    motor: "",
    cuadro: "",
    tipoRodado: "",
    propietario: {
      nombre: "",
      dni: "",
      direccion: "",
    },
  },
};

export default function ActaForm() {
  const [form, setForm] = useState<ActaRequest>(initialState);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [selectedPuesto, setSelectedPuesto] = useState<number | ''>('');
  const [selectedTipoActa, setSelectedTipoActa] = useState<number | ''>('');
  const [selectedGrupo, setSelectedGrupo] = useState<number | ''>('');
  const [selectedLey, setSelectedLey] = useState<number | ''>('');
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<number[]>([]);
  const [propietario, setPropietario] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehiculo | null>(null);
  const [unidadesRegionales, setUnidadesRegionales] = useState<UnidadRegional[]>();
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const { actaSeleccionada, limpiarActa } = useActa();
  const { data: puesto = []} = useGetPuestosQuery();
  const { data: grupo = []} = useGetGruposQuery();
  const { data: ley = []} = useGetLeyesQuery();
  const { data: juzgado = []} = useGetjuzgadosQuery();
  const { data: tipoActa = []} = useGetTiposQuery();
  const isEditingActa = Boolean(actaSeleccionada?.idActa);
  const firmaInfractorRef = useRef<FirmaCaptureHandle | null>(null);
  const firmaOficialRef = useRef<FirmaCaptureHandle | null>(null);
  const createEmptyTestigo = (): TestigoRequest => ({
    nombre: "",
    apellido: "",
    dni: "",
    domicilio: "",
  });

  const ensureTwoTestigos = (
    value: TestigoRequest[] | null | undefined,
  ): TestigoRequest[] => {
    const next = Array.isArray(value) ? [...value] : [];
    while (next.length < 2) next.push(createEmptyTestigo());
    return next.slice(0, 2);
  };

  const handleTestigoChange = (
    index: number,
    field: keyof TestigoRequest,
    value: string,
  ) => {
    setFirma((prev) => {
      const nextTestigos = ensureTwoTestigos(prev.testigos);
      nextTestigos[index] = {
        ...nextTestigos[index],
        [field]: value,
      };
      return { ...prev, testigos: nextTestigos };
    });

    setErrors((er) => {
      const key = `testigos.${index}.${String(field)}`;
      if (!er[key]) return er;
      const c = { ...er };
      delete c[key];
      return c;
    });
  };
  const [firma, setFirma] = useState<FirmaDTO>(() => ({
    actaId: actaSeleccionada?.idActa ?? 0,
    firmaInfractorBase64: null,
    firmaOficialBase64: "",
    latitud: "",
    longitud: "",
    deviceId: getOrCreateDeviceId(),
    seNegoAFirmar: false,
    testigos: [],
  }));
  const [selected, setSelected] = useState<string[]>([]);
  const [otroTexto, setOtroTexto] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const usesTestigosOnly = Boolean(form.infractorFugado);
  const hasValidInfractorDni = /^[0-9]{8}$/.test(form.infractor.dni || "");
  const tipoRodadoActual = form.vehiculo.tipoRodado ?? "";
  const tipoRodadoFueraDeLista = Boolean(tipoRodadoActual) && !TIPO_RODADO.includes(tipoRodadoActual);
  const tipoActaDetalleSeleccionado =
    tipoActa.find((t) => t.idTipo === Number(selectedTipoActa))?.detalle?.toUpperCase() ?? "";
  const isTipoActaAutomatico = tipoActaDetalleSeleccionado === "AUTOMATICO";
  const navigate = useNavigate();
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue >= 2 && !hasValidInfractorDni) return;
    if (newValue === 3 && isEditingActa) return;
    setActiveTab(newValue);
  };

  const goPrevTab = () => {
    setActiveTab((prev) => Math.max(0, prev - 1));
  };

  const goNextTab = () => {
    setActiveTab((prev) => {
      const maxTab = isEditingActa ? 2 : 3;
      const next = Math.min(maxTab, prev + 1);
      if (next >= 2 && !hasValidInfractorDni) {
        SnackbarUtilities.error("Ingresa un DNI valido para avanzar");
        return prev;
      }
      return next;
    });
  };  const handleCountryChange = (e: SelectChangeEvent) => {
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

  useEffect(() => {
    if (!actaSeleccionada?.idActa) return;
    setFirma((prev) => ({ ...prev, actaId: actaSeleccionada.idActa }));
  }, [actaSeleccionada?.idActa]);

  useEffect(() => {
    if (!isEditingActa) return;
    setActiveTab((prev) => (prev === 3 ? 0 : prev));
  }, [isEditingActa]);

  useEffect(() => {
    if (!isTipoActaAutomatico) return;
    setForm((prev) => ({ ...prev, nro: "" }));
    setErrors((er) => {
      if (!er.nro) return er;
      const c = { ...er };
      delete c.nro;
      return c;
    });
  }, [isTipoActaAutomatico]);

  useEffect(() => {
    const lat = form.ubicacionRequest?.lat;
    const lng = form.ubicacionRequest?.lng;
    setFirma((prev) => ({
      ...prev,
      latitud: typeof lat === "number" && lat !== 0 ? String(lat) : "",
      longitud: typeof lng === "number" && lng !== 0 ? String(lng) : "",
    }));
  }, [form.ubicacionRequest?.lat, form.ubicacionRequest?.lng]);


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
          const { direccion, nombre, dni, idProp } =
            await PropietarioService.obtenerPorDni(value);

          setForm((prev) => ({
            ...prev,
            vehiculo: {
              ...prev.vehiculo,
              propietario: {
                idProp,
                nombre,
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


  const refreshLocalidadesForUr = (
    unidadRegionalId: number | null | undefined,
    departamento: string | null | undefined,
  ) => {
    if (!unidadRegionalId || !departamento || !unidadesRegionales?.length) {
      setLocalidades([]);
      return;
    }

    const depto = unidadesRegionales
      .find((u) => u.idUr === unidadRegionalId)
      ?.departamentos.find((d) => d.nombre === departamento);

    setLocalidades(depto?.localidades ?? []);
  };

  const splitApellidoNombrePorComa = (
    value: string | null | undefined,
  ): { apellido: string; nombre: string } | null => {
    const raw = (value ?? "").trim();
    const commaIndex = raw.indexOf(",");
    if (commaIndex === -1) return null;

    const apellido = raw.slice(0, commaIndex).trim();
    const nombre = raw.slice(commaIndex + 1).trim();
    if (!apellido && !nombre) return null;

    return { apellido, nombre };
  };

  const normalizeInfractorNombreApellido = (
    infractor: InfractorSolicitud,
  ): InfractorSolicitud => {
    const parsedFromNombre = splitApellidoNombrePorComa(infractor.nombre);
    if (parsedFromNombre) {
      return {
        ...infractor,
        apellido: parsedFromNombre.apellido || infractor.apellido,
        nombre: parsedFromNombre.nombre || infractor.nombre,
      };
    }

    const parsedFromApellido = splitApellidoNombrePorComa(infractor.apellido);
    if (parsedFromApellido) {
      return {
        ...infractor,
        apellido: parsedFromApellido.apellido || infractor.apellido,
        nombre: parsedFromApellido.nombre || infractor.nombre,
      };
    }

    return infractor;
  };
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(validate()){
        const actaToSend: ActaRequest = structuredClone(form);

        if(propietario){
          actaToSend.vehiculo.propietario = null;
        }
        console.log('propietario ', actaToSend.vehiculo.propietario)
        actaToSend.infractor = normalizeInfractorNombreApellido(actaToSend.infractor);
        actaToSend.infractor.propietario = propietario;
        actaToSend.idTipo = Number(selectedTipoActa);
        actaToSend.idGrupo = Number(selectedGrupo);
        actaToSend.idPuesto = Number(selectedPuesto);
        actaToSend.articulos = articulosSeleccionados;

        if (actaToSend.infractorFugado) {
          const nextTestigos = ensureTwoTestigos(firma.testigos);
          const witnessErrors: Record<string, string> = {};

          nextTestigos.forEach((t, i) => {
            if (!t.nombre || t.nombre.trim() === "") witnessErrors[`testigos.${i}.nombre`] = "Nombre obligatorio";
            if (!t.apellido || t.apellido.trim() === "") witnessErrors[`testigos.${i}.apellido`] = "Apellido obligatorio";
            if (!/^[0-9]{8}$/.test(t.dni || "")) witnessErrors[`testigos.${i}.dni`] = "DNI debe tener 8 digitos";
          });

          if (Object.keys(witnessErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...witnessErrors }));
            setActiveTab(3);
            SnackbarUtilities.error("Debe completar los 2 testigos");
            return;
          }

          actaToSend.testigos = nextTestigos;
          delete (actaToSend as Partial<ActaRequest>).firma;
        } else if (!isEditingActa) {
          const capturedFirmaInfractorBase64 =
            firmaInfractorRef.current?.getDataUrl() ?? firma.firmaInfractorBase64;
          const capturedFirmaOficialBase64 =
            firmaOficialRef.current?.getDataUrl() ?? (firma.firmaOficialBase64 || null);

          if (!capturedFirmaOficialBase64) {
            setErrors((prev) => ({ ...prev, firmaOficialBase64: "La firma del personal es obligatoria" }));
            setActiveTab(3);
            SnackbarUtilities.error("La firma del personal es obligatoria");
            return;
          }

          const firmaToSend: FirmaDTO = {
            ...firma,
            actaId: actaToSend.idActa ?? actaSeleccionada?.idActa ?? firma.actaId ?? 0,
            latitud:
              typeof actaToSend.ubicacionRequest?.lat === "number" && actaToSend.ubicacionRequest.lat !== 0
                ? String(actaToSend.ubicacionRequest.lat)
                : "",
            longitud:
              typeof actaToSend.ubicacionRequest?.lng === "number" && actaToSend.ubicacionRequest.lng !== 0
                ? String(actaToSend.ubicacionRequest.lng)
                : "",
            firmaInfractorBase64: firma.seNegoAFirmar ? null : capturedFirmaInfractorBase64,
            firmaOficialBase64: capturedFirmaOficialBase64,
          };

          if (firmaToSend.seNegoAFirmar) {
            const nextTestigos = ensureTwoTestigos(firmaToSend.testigos);
            const witnessErrors: Record<string, string> = {};
            nextTestigos.forEach((t, i) => {
              if (!t.nombre || t.nombre.trim() === "") witnessErrors[`testigos.${i}.nombre`] = "Nombre obligatorio";
              if (!t.apellido || t.apellido.trim() === "") witnessErrors[`testigos.${i}.apellido`] = "Apellido obligatorio";
              if (!/^[0-9]{8}$/.test(t.dni || "")) witnessErrors[`testigos.${i}.dni`] = "DNI debe tener 8 digitos";
            });

            if (Object.keys(witnessErrors).length > 0) {
              setErrors((prev) => ({ ...prev, ...witnessErrors }));
              setActiveTab(3);
              SnackbarUtilities.error("Debe completar los 2 testigos");
              return;
            }

            firmaToSend.testigos = nextTestigos;
          } else {
            firmaToSend.testigos = [];
          }

          actaToSend.firma = firmaToSend;
        } else {
          delete (actaToSend as Partial<ActaRequest>).firma;
        }
        
        console.log('acta ', actaToSend);
        let response: ActaRequest | null = null;
        if(actaSeleccionada){
          response = await actualizarActa(actaToSend);
          {
            const nextActaId = response?.idActa;
            if (typeof nextActaId === "number") setFirma((prev) => ({ ...prev, actaId: nextActaId }));
          }
          limpiarActa();
          SnackbarUtilities.success('Acta modificada exitasomente')
        }else{
          response = await crearActa(actaToSend);
          {
            const nextActaId = response?.idActa;
            if (typeof nextActaId === "number") setFirma((prev) => ({ ...prev, actaId: nextActaId }));
          }
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
          setForm((prevForm) => ({...prevForm, vehiculo:{dominio: '',
            cuadro: '', marca: '', modelo: '', idVeh: null
          }}));
          return;
        }

        const vehiculo = vehiculos.find((v) => v.idVeh === id) || null;
        console.log('vehiculo seleccionado ',vehiculo)
        setSelectedVehicle(vehiculo);
        setForm({...form, vehiculo: {dominio: vehiculo?.dominio!, //aÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±o: vehiculo?.aÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±o,
          cuadro: vehiculo?.cuadro!, marca: vehiculo?.marca, modelo: vehiculo?.modelo, idVeh: vehiculo?.idVeh
        }});
        if (!vehiculo?.propietario) {
          setPropietario(true);
        } else {
          setPropietario(!vehiculo.propietario); 
        }
    };
    const handleUnidadRegionalChange = (id: number) => {
      refreshLocalidadesForUr(id, form.ubicacionRequest.departamento);

      setForm((prevForm) => ({
        ...prevForm,
        ubicacionRequest: {
          ...prevForm.ubicacionRequest,
          unidadRegional: id,
          localidad: undefined,
        },
      }));

    }

    useEffect(() => {
      refreshLocalidadesForUr(form.ubicacionRequest.unidadRegional, form.ubicacionRequest.departamento);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unidadesRegionales, form.ubicacionRequest.unidadRegional, form.ubicacionRequest.departamento]);
    const validate = () => {
      const e: Record<string, string> = {};

      // selects
      if (!selectedTipoActa) e.tipoActa = "El tipo de acta es obligatorio";
      if (!selectedGrupo) e.grupo = "El grupo es obligatorio";
      if (!selectedPuesto) e.puesto = "El puesto es obligatorio";
      if (!form.juzgado || form.juzgado <= 0) e.juzgado = "Debe seleccionar un juzgado";


      // campos generales
      if (!form.motivo || form.motivo.trim().length === 0) e.motivo = "El motivo es obligatorio";
      if (!isTipoActaAutomatico && (!form.nro || form.nro.trim().length === 0)) e.nro = "El nº de acta es obligatorio";
      if (!form.fecha || form.fecha.trim().length === 0) e.fecha = "La fecha es obligatoria";

      // infractor
      if (!form.infractor.nombre || form.infractor.nombre.trim() === "") e["infractor.nombre"] = "Nombre del infractor obligatorio";
      //if (!form.infractor.apellido || form.infractor.apellido.trim() === "") e["infractor.apellido"] = "Apellido del infractor obligatorio";
      if (!/^[0-9]{8}$/.test(form.infractor.dni || "")) e["infractor.dni"] = "DNI del infractor debe tener 8 digitos";
      if (!form.infractor.nacionalidad || form.infractor.nacionalidad.trim() === "") e["infractor.nacionalidad"] = "Nacionalidad obligatoria";


      // vehiculo
      const v = form.vehiculo;
      //if (!v.marca || String(v.marca).trim() === "") e["vehiculo.marca"] = "Marca obligatoria";
      //if (!v.modelo || String(v.modelo).trim() === "") e["vehiculo.modelo"] = "Modelo obligatorio";
    
      if (!v.dominio || String(v.dominio).trim() === "") e["vehiculo.dominio"] = "Dominio obligatorio";
      //if (!v.motor || String(v.motor).trim() === "") e["vehiculo.motor"] = "Motor obligatorio";
      //if (!v.cuadro || String(v.cuadro).trim() === "") e["vehiculo.cuadro"] = "Cuadro obligatorio";


      // propietario: si checkbox propietario === true => validar propietario dentro de vehiculo
      if (!propietario) {
      const p = form.vehiculo.propietario!;
      if (!p.nombre || p.nombre.trim() === "") e["vehiculo.propietario.nombre"] = "Nombre del propietario obligatorio";
      //if (!p.apellido || p.apellido.trim() === "") e["vehiculo.propietario.apellido"] = "Apellido del propietario obligatorio";
      if (!/^[0-9]{8}$/.test(p.dni || "")) e["vehiculo.propietario.dni"] = "DNI del propietario debe tener 8 di­gitos";
      if (!p.direccion || p.direccion.trim() === "") e["vehiculo.propietario.direccion"] = "Direccion del propietario obligatoria";
      }

      if (!form.ubicacionRequest.unidadRegional) e.ubicacionRequest = "Debe seleccionar una unidad regional";
      // ley
      if (!selectedLey) e.ley = "Debe seleccionar una ley";


      // articulos seleccionados
      if (articulosSeleccionados.length === 0) e.articulos = "Debe seleccionar al menos un articulo";


      setErrors(e);
      return Object.keys(e).length === 0;
      };

  const fetchArticulosPorLey = async (ley: number) => {
    const data = await getArticulosByLey(ley);
    setArticulos(data);
    console.log('articulo por ley ', data)
  }

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
        const isInfractorOwner = data.propietario ?? true;
        const vehiculosFromBackend = data.vehiculos || [];
        if(data.idInfrac){
          setForm((prev) => {
            const updatedInfractor = normalizeInfractorNombreApellido({
              ...prev.infractor,
              idInfrac: data.idInfrac || null,
              nombre: data.nombre || "",
              apellido: data.apellido || "",
              autoridadExpedicion: data.licencias[0]?.autoridadExpedicion || "",
              clase: data.licencias[0]?.clase,
              domicilio: data.domicilio,
              fechaExpedicion: data.licencias[0]?.fechaExpedicion,
              fechaVencimiento: data.licencias[0]?.fechaVencimiento,
              numero: data.licencias[0]?.numero,
              dni: data.dni,
              propietario: isInfractorOwner,
            });

            const defaultVehicle = vehiculosFromBackend.length === 1 ? vehiculosFromBackend[0] : null;

            return {
              ...prev,
              infractor: updatedInfractor,
              vehiculo: defaultVehicle
                ? {
                    ...prev.vehiculo,
                    idVeh: defaultVehicle.idVeh,
                    dominio: defaultVehicle.dominio ?? prev.vehiculo.dominio,
                    marca: defaultVehicle.marca ?? prev.vehiculo.marca,
                    modelo: defaultVehicle.modelo ?? prev.vehiculo.modelo,
                    motor: defaultVehicle.motor ?? prev.vehiculo.motor,
                    cuadro: defaultVehicle.cuadro ?? prev.vehiculo.cuadro,
                    propietario: !isInfractorOwner
                      ? (defaultVehicle.propietario ?? prev.vehiculo.propietario ?? null)
                      : prev.vehiculo.propietario,
                  }
                : prev.vehiculo,
            };
          });

          setPropietario(isInfractorOwner);
          setVehiculos(vehiculosFromBackend);

          const defaultVehicle = vehiculosFromBackend.length === 1 ? vehiculosFromBackend[0] : null;
          if (defaultVehicle) {
            setSelectedVehicle(defaultVehicle);
            return;
          }

          setSelectedVehicle(null);

          if (!isInfractorOwner) {
            const vehiculoConPropietario = vehiculosFromBackend.find((v) => v.propietario);
            if (vehiculoConPropietario?.propietario) {
              setForm((prev) => ({
                ...prev,
                vehiculo: {
                  ...prev.vehiculo,
                  propietario: prev.vehiculo.propietario?.dni
                    ? prev.vehiculo.propietario
                    : vehiculoConPropietario.propietario,
                },
              }));
            }
          }
        }else{
          clearInfractor();
          setSelectedVehicle(null);
          setVehiculos([]);
        }
      } catch (error) {
        SnackbarUtilities.info('Infractor no encontrado, continue completando los datos')
      }
    }else{
      clearInfractor()
    }
  };

  
  const handleVehiculoDetected = (vehiculo: VehiculoSolicitud) => {
    const normalizeDni = (dni?: string | null) => (dni ?? '').replace(/\D/g, '').slice(0, 8);

    setForm((prev) => ({
      ...prev,
      vehiculo: {
        ...prev.vehiculo,
        marca: vehiculo.marca ?? prev.vehiculo.marca,
        modelo: vehiculo.modelo ?? prev.vehiculo.modelo,
        dominio: vehiculo.dominio ?? prev.vehiculo.dominio,
        motor: vehiculo.motor ?? prev.vehiculo.motor,
        cuadro: vehiculo.cuadro ?? prev.vehiculo.cuadro,
        tipoRodado: vehiculo.tipoRodado ?? prev.vehiculo.tipoRodado,
        propietario: vehiculo.propietario
          ? {
              ...prev.vehiculo.propietario,
              nombre: vehiculo.propietario.nombre ?? prev.vehiculo.propietario?.nombre ?? '',
              //apellido: vehiculo.propietario.apellido ?? prev.vehiculo.propietario?.apellido ?? '',
              dni: normalizeDni(vehiculo.propietario.dni) || prev.vehiculo.propietario?.dni || '',
              direccion: vehiculo.propietario.direccion ?? prev.vehiculo.propietario?.direccion ?? '',
            }
          : prev.vehiculo.propietario,
      },
    }));

    setErrors((prevErrors) => {
      const cleaned = { ...prevErrors };
      delete cleaned['vehiculo.dominio'];
      delete cleaned['vehiculo.propietario.apellido'];
      delete cleaned['vehiculo.propietario.dni'];
      return cleaned;
    });
  };


  const handleLicenciaNacional = (data: unknown, tipo: OcrDocumentType) => {
    if (tipo !== "licNacFrente" && tipo !== "licNacDorso") return;

    const licenciaData = data as Partial<InfractorSolicitud> | null;
    if (!licenciaData) return;

    const normalizeDni = (dni?: string | null) => (dni ?? '').replace(/\D/g, '').slice(0, 8);

    setForm((prev) => ({
      ...prev,
      infractor: {
        ...prev.infractor,
        nombre: licenciaData.nombre ?? prev.infractor.nombre,
        apellido: licenciaData.apellido ?? prev.infractor.apellido,
        dni: normalizeDni(licenciaData.dni) || prev.infractor.dni,
        nacionalidad: licenciaData.nacionalidad ?? prev.infractor.nacionalidad,
        domicilio: licenciaData.domicilio ?? prev.infractor.domicilio,
        provincia: licenciaData.provincia ?? prev.infractor.provincia,
        clase: licenciaData.clase ?? prev.infractor.clase,
        numero: licenciaData.numero ?? prev.infractor.numero,
        autoridadExpedicion: licenciaData.autoridadExpedicion ?? prev.infractor.autoridadExpedicion,
        fechaExpedicion: licenciaData.fechaExpedicion ?? prev.infractor.fechaExpedicion,
        fechaVencimiento: licenciaData.fechaVencimiento ?? prev.infractor.fechaVencimiento,
      },
    }));

    setErrors((prevErrors) => {
      const cleaned = { ...prevErrors };
      delete cleaned['infractor.nombre'];
      delete cleaned['infractor.apellido'];
      delete cleaned['infractor.dni'];
      delete cleaned['infractor.nacionalidad'];
      return cleaned;
    });
  };
  const handleDocumentDataCaptured = (data: unknown, tipo: OcrDocumentType) => {
    if (tipo !== "cedulaDorso") return;

    const propietarioData = data as Partial<Propietario> | null;
    if (!propietarioData) return;

    const normalizeDni = (dni?: string | null) => (dni ?? '').replace(/\D/g, '').slice(0, 8);
    setPropietario(false);

    setForm((prev) => ({
      ...prev,
      vehiculo: {
        ...prev.vehiculo,
        propietario: {
          ...prev.vehiculo.propietario,
          nombre: propietarioData.nombre ?? prev.vehiculo.propietario?.nombre ?? '',
          apellido: propietarioData.apellido ?? prev.vehiculo.propietario?.apellido ?? '',
          dni: normalizeDni(propietarioData.dni) || prev.vehiculo.propietario?.dni || '',
          direccion: propietarioData.direccion ?? prev.vehiculo.propietario?.direccion ?? '',
        },
      },
    }));

    setErrors((prevErrors) => {
      const cleaned = { ...prevErrors };
      delete cleaned['vehiculo.propietario.nombre'];
      delete cleaned['vehiculo.propietario.apellido'];
      delete cleaned['vehiculo.propietario.dni'];
      delete cleaned['vehiculo.propietario.direccion'];
      return cleaned;
    });
  };
  
  const clearInfractor = () => {
    setForm((prev) => ({
          ...prev,
          infractor: {
            ...prev.infractor,
            idInfrac: null,
            nombre: "",
            apellido: "",
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
      //actaSeleccionada.
      const articulos = actaSeleccionada.articulos.map(a => a.idArt)
      setSelectedTipoActa(actaSeleccionada.idTipo);
      setSelectedGrupo(actaSeleccionada.idGrupo)
      setSelectedPuesto(actaSeleccionada.idPuesto ?? '');
      const mappedActa = actaResumenToActaRequest(actaSeleccionada);

      setForm({
        ...mappedActa,
        ubicacionRequest: {
          ...mappedActa.ubicacionRequest,
          localidad:
            actaSeleccionada.ubicacionResponse.localidad ?? mappedActa.ubicacionRequest.localidad,
          descripcion:
            actaSeleccionada.ubicacionResponse.descripcion ?? mappedActa.ubicacionRequest.descripcion,
        },
        infractor: {
          ...mappedActa.infractor,
          fechaNacimiento:
            actaSeleccionada.infractor.fechaNacimiento ??
            mappedActa.infractor.fechaNacimiento ??
            "",
          localidad:
            actaSeleccionada.infractor.localidad ?? mappedActa.infractor.localidad ?? "",
        },
        vehiculo: {
          ...mappedActa.vehiculo,
          tipoRodado:
            actaSeleccionada.vehiculo.tipoRodado ?? mappedActa.vehiculo.tipoRodado ?? "",
        },
      });
      setArticulosSeleccionados(articulos);
      setSelectedLey(1);
      fetchArticulosPorLey(1);
      const unidadRegional = actaSeleccionada.ubicacionResponse.urId ?? actaSeleccionada.ubicacionResponse.idUr;
      const unidadRegionalText = String(actaSeleccionada.ubicacionResponse.unidadRegional ?? "");
      const unidadRegionalNumberMatch = unidadRegionalText.match(/\d+/);
      const unidadRegionalParsed = unidadRegionalNumberMatch ? Number(unidadRegionalNumberMatch[0]) : NaN;
      console.log('ur seteada ', unidadRegional, '   ' , unidadRegionalParsed)
      const ubicacion : UbicacionRequest = {
        departamento: actaSeleccionada.ubicacionResponse.departamento,
        lat: actaSeleccionada.ubicacionResponse.lat,
        lng: actaSeleccionada.ubicacionResponse.lng,
        descripcion: actaSeleccionada.ubicacionResponse.descripcion,
        localidad: actaSeleccionada.ubicacionResponse.localidad,
        unidadRegional: typeof unidadRegional === "number"
          ? unidadRegional
          : Number.isFinite(unidadRegionalParsed)
            ? unidadRegionalParsed
            : undefined,
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
  }, [])
  return (
    <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 2 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          Formulario de actas
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>Los campos con (*) son obligatorios</Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Stepper
            activeStep={activeTab}
            alternativeLabel
            sx={{
              mb: 1.5,
              '& .MuiStepConnector-line': { borderTopWidth: 3 },
            }}
          >
            <Step><StepLabel StepIconComponent={ProgressStepIcon} /></Step>
            <Step><StepLabel StepIconComponent={ProgressStepIcon} /></Step>
            <Step><StepLabel StepIconComponent={ProgressStepIcon} /></Step>
            <Step><StepLabel StepIconComponent={ProgressStepIcon} /></Step>
          </Stepper>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
            <Tab label="Acta" sx={activeTab !== 0 ? tabPulseSx : undefined} />
            <Tab label="Infractor" sx={activeTab !== 1 ? tabPulseSx : undefined} />
            <Tab label="Vehiculo" disabled={!hasValidInfractorDni} sx={activeTab !== 2 && hasValidInfractorDni ? tabPulseSx : undefined} />
            <Tab label={usesTestigosOnly ? "Testigos" : "Firmas"} disabled={!hasValidInfractorDni || isEditingActa} sx={activeTab !== 3 && hasValidInfractorDni ? tabPulseSx : undefined} />
          </Tabs>

          {activeTab === 0 && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
                  columnGap: 3,
                  rowGap: 2,
                  gridColumn: "1 / -1",
                }}
              >
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
                <DateInput type="datetime-local" value={form.fecha ? form.fecha.slice(0, 16) : ""} onChange={(e) => {
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
                  {puesto.map((puesto) => (
                  <MenuItem key={puesto.idPuesto} value={puesto.idPuesto}>
                  {puesto.nombre}
                  </MenuItem>
                  ))}
                </Select>
                {!!errors.puesto && <FormHelperText>{errors.puesto}</FormHelperText>}
              </FormControl>

              {/* Datos generales */}
                <FormControl sx={{ display: 'flex', alignItems: 'flex-start', gridColumn: '1 / -1' }} error={!!errors.motivo}>
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
                    {grupo.map((g) => (
                    <MenuItem key={g.idGrupo} value={g.idGrupo}>
                    {g.nombre}
                    </MenuItem>
                    ))}
                  </Select>
                  {!!errors.grupo && <FormHelperText>{errors.grupo}</FormHelperText>}
                  </FormControl>
                
              <FormControl sx={{ display: 'flex', alignItems: 'flex-start' }} error={!!errors.nro}>
                <TextField
                  label="Nº de Acta *"
                  fullWidth
                  margin="normal"
                  value={form.nro}
                  disabled={isTipoActaAutomatico}
                  onChange={(e) => {
                    handleChange("nro", e.target.value);

                    setErrors((er) => {
                      const c = { ...er };
                      delete c.nro;
                      return c;
                    });
                  }}
                  error={!!errors.nro && !isTipoActaAutomatico}
                  helperText={isTipoActaAutomatico ? "Se asigna automáticamente" : errors.nro}
                  />
              </FormControl>

                <TextField
                label="Nº de Acta de retencion"
                fullWidth
                margin="normal"
                value={form.retencion}
                onChange={(e) => handleChange("retencion", e.target.value)}
                />

              {/* Juzgado */}
              <FormControl fullWidth margin="normal" error={!!errors.juzgado}>
                <InputLabel id="juzgado-label">Juzgado *</InputLabel>
                <Select
                  labelId="juzgado-label"
                  id="juzgado"
                  value={form.juzgado ? String(form.juzgado) : ""}
                  label="Juzgado"
                  onChange={(e) => {
                    const raw = String(e.target.value ?? "");
                    const juzgadoId = raw ? Number(raw) : 0;
                    handleChange("juzgado", juzgadoId);
                    setErrors((er) => {
                      const c = { ...er };
                      delete c.juzgado;
                      return c;
                    });
                  }}
                >
                  <MenuItem value="">Seleccione un juzgado</MenuItem>
                  {(juzgado ?? [])
                    .filter((j): j is Juzgado & { id: number } => typeof j.id === "number" && Number.isFinite(j.id))
                    .map((j) => (
                      <MenuItem key={j.id} value={String(j.id)}>
                        {j.nombre}
                      </MenuItem>
                    ))}
                </Select>
                {!!errors.juzgado && <FormHelperText>{errors.juzgado}</FormHelperText>}
              </FormControl>

              {/* Graduación alcohólica */}
              <TextField
                label="Graduación alcohólica"
                fullWidth
                margin="normal"
                type="number"
                inputProps={{ min: 0, step: "0.01" }}
                value={Number.isFinite(form.graduacionAlcoholica) ? form.graduacionAlcoholica : 0}
                onChange={(e) => {
                  const raw = e.target.value;
                  const next = raw === "" ? 0 : Number(raw);
                  handleChange("graduacionAlcoholica", Number.isFinite(next) ? next : 0);
                }}
              />

              {/* Checks */}
              <FormControl component="fieldset" sx={{ gridColumn: "1 / -1" }}>
                <FormLabel component="legend">Opciones</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(form.retencionVehiculo)}
                        onChange={(e) => handleChange("retencionVehiculo", e.target.checked)}
                      />
                    }
                    label="Retención de vehículo"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(form.infractorFugado)}
                        onChange={(e) => handleChange("infractorFugado", e.target.checked)}
                      />
                    }
                    label="Infractor fugado"
                  />
                </FormGroup>
              </FormControl>

              {/*Seleccionar ubicacion */}
              <Box sx={{ gridColumn: "1 / -1" }}><MapaJujuy onSelect={handleMapSelect} initialValue={form.ubicacionRequest.lat ? form.ubicacionRequest : null} /></Box>
              {unidadesRegionales ? (
                <>
                  <FormControl error={!!errors.ubicacionRequest} sx={{ gridColumn: "1 / -1" }}>
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
                  {!!form.ubicacionRequest.unidadRegional && (
                    <FormControl fullWidth margin="normal" sx={{ gridColumn: "1 / -1" }}>
                      <InputLabel id="localidad-label">Localidad</InputLabel>
                      <Select
                        labelId="localidad-label"
                        id="localidad"
                        value={form.ubicacionRequest.localidad ?? ""}
                        label="Localidad"
                        onChange={(e) => {
                          const raw = String(e.target.value ?? "");
                          const localidadId = raw ? Number(raw) : undefined;
                          setForm((prev) => ({
                            ...prev,
                            ubicacionRequest: {
                              ...prev.ubicacionRequest,
                              localidad: localidadId,
                            },
                          }));
                        }}
                        disabled={!localidades.length}
                      >
                        <MenuItem value="">Seleccione una localidad</MenuItem>
                        {localidades.map((loc) => (
                          <MenuItem key={loc.id} value={loc.id}>
                            {loc.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <TextField
                    label="Descripcion"
                    fullWidth
                    margin="normal"
                    sx={{ gridColumn: "1 / -1" }}
                    value={form.ubicacionRequest.descripcion ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        ubicacionRequest: {
                          ...prev.ubicacionRequest,
                          descripcion: value,
                        },
                      }));
                    }}
                  />
                </>
              ) : (
                <Typography variant="h6" sx={{ gridColumn: "1 / -1" }}>No se ha seleccionado ninguna ubicacion</Typography>
              )}

              {/* Ley */}
                <FormControl fullWidth margin="normal" error={!!errors.ley}>
                <InputLabel id="ley-select-label">Seleccione una Ley *</InputLabel>
                <Select labelId="ley-select-label" id="ley-select" value={selectedLey.toString()} label="Seleccione una Ley" onChange={(e) => handleLeyChange(e as any)}>
                <MenuItem value="">Seleccione una opcion</MenuItem>
                {ley.map((l) => (
                <MenuItem key={l.idLey} value={l.idLey}>
                {l.nro}
                </MenuItem>
                ))}
                </Select>
                {!!errors.ley && <FormHelperText>{errors.ley}</FormHelperText>}
                </FormControl>

                {articulos.length > 0 && (
                <Grid size={{ xs: 12, md: 6, sm: 4 }}>
                  <FullscreenMultiSelect
                    label="Arti­culos"
                    value={articulosSeleccionados}
                    onChange={setArticulosSeleccionados}
                    placeholder="Seleccionar arti­culos"
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
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, columnGap: 3, rowGap: 2, gridColumn: "1 / -1" }}>
              {/* Infractor */}
              <FormControl component="fieldset" sx={{ gridColumn: "1 / -1" }}>
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
              <Box sx={{ gridColumn: "1 / -1" }}>
                <DocumentDataCapture titulo="Lic. Nacional de conducir" tipo="licNacFrente" onDataCaptured={handleLicenciaNacional} />
              </Box>
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
              
              <TextField label="Nombre *" fullWidth margin="normal" value={form.infractor.nombre} onChange={(e) => {
                handleChange("infractor.nombre", e.target.value);

                setErrors((er) => {
                  const c = { ...er };
                  delete c["infractor.nombre"];
                  return c;
                });
              }}
              error={!!errors["infractor.nombre"]}
              helperText={errors["infractor.nombre"]} />
              <TextField
                label="Apellido"
                fullWidth
                margin="normal"
                value={form.infractor.apellido}
                onChange={(e) => handleChange("infractor.apellido", e.target.value)}
                error={!!errors["infractor.apellido"]}
                helperText={errors["infractor.apellido"]}
              />
              <TextField
                label="Domicilio"
                fullWidth
                margin="normal"
                sx={{ gridColumn: "1 / -1" }}
                value={form.infractor.domicilio}
                onChange={(e) => handleChange("infractor.domicilio", e.target.value)}
                error={!!errors["infractor.domicilio"]}
                helperText={errors["infractor.domicilio"]}
              />
              <TextField
                label="Fecha de Nacimiento"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={form.infractor.fechaNacimiento ?? ""}
                onChange={(e) => handleChange("infractor.fechaNacimiento", e.target.value)}
              />
              <TextField
                label="Localidad"
                fullWidth
                margin="normal"
                value={form.infractor.localidad ?? ""}
                onChange={(e) => handleChange("infractor.localidad", e.target.value)}
              />
              <TextField
                label="Clase de licencia"
                fullWidth
                margin="normal"
                value={form.infractor.clase ?? ""}
                onChange={(e) => handleChange("infractor.clase", e.target.value)}
              />
              <TextField
                label="Numero de licencia"
                fullWidth
                margin="normal"
                value={form.infractor.numero ?? ""}
                onChange={(e) => handleChange("infractor.numero", e.target.value)}
              />
              <TextField
                label="Autoridad de expedicion"
                fullWidth
                margin="normal"
                sx={{ gridColumn: "1 / -1" }}
                value={form.infractor.autoridadExpedicion ?? ""}
                onChange={(e) => handleChange("infractor.autoridadExpedicion", e.target.value)}
              />
              <TextField
                label="Fecha de expedicion"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={form.infractor.fechaExpedicion ?? ""}
                onChange={(e) => handleChange("infractor.fechaExpedicion", e.target.value)}
              />
              <TextField
                label="Fecha de vencimiento"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={form.infractor.fechaVencimiento ?? ""}
                onChange={(e) => handleChange("infractor.fechaVencimiento", e.target.value)}
              />
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
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, columnGap: 3, rowGap: 2, gridColumn: "1 / -1" }}>
              <FormControlLabel
              control={<Checkbox checked={propietario} onChange={(e) => { setPropietario(e.target.checked); if (!e.target.checked) setErrors((er) => { const c = { ...er }; delete c["vehiculo.propietario.nombre"]; delete c["vehiculo.propietario.apellido"]; delete c["vehiculo.propietario.dni"]; delete c["vehiculo.propietario.direccion"]; return c; }); }} />}
              label="¿El infractor es propietario del vehiculo?"
              />
            
            {/* Vehi­culo */}
            {vehiculos && (
              <FormControl component="fieldset" fullWidth sx={{ gridColumn: "1 / -1" }}>
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  Selecciona un vehhiculo *
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
            
            
              <Typography variant="h6" sx={{ mt: 1, gridColumn: "1 / -1" }}>Vehi­culo</Typography>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <DocumentDataCapture titulo="cedula (frente)" tipo="cedulaFrente" onVehiculoDetected={handleVehiculoDetected} />
              </Box>
              <TextField label="Marca" fullWidth margin="normal" value={form.vehiculo.marca} onChange={(e) => handleChange("vehiculo.marca", e.target.value)} error={!!errors["vehiculo.marca"]} helperText={errors["vehiculo.marca"]} />
              <TextField label="Modelo" fullWidth margin="normal" value={form.vehiculo.modelo} onChange={(e) => handleChange("vehiculo.modelo", e.target.value)} error={!!errors["vehiculo.modelo"]} helperText={errors["vehiculo.modelo"]} />
              <FormControl fullWidth>
              <InputLabel>Tipo rodado</InputLabel>
              <Select
                value={tipoRodadoActual}
                label="Tipo rodado"
                onChange={(e)=>handleChange("vehiculo.tipoRodado", e.target.value)}
              >
                {tipoRodadoFueraDeLista && (
                  <MenuItem value={tipoRodadoActual}>
                    {`OTRO (${tipoRodadoActual})`}
                  </MenuItem>
                )}
                {TIPO_RODADO.map((tr) => (
                  <MenuItem key={tr} value={tr}>
                    {tr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
              <TextField label="Dominio *" fullWidth margin="normal" value={form.vehiculo.dominio} onChange={(e) => {
                handleChange("vehiculo.dominio", e.target.value);
                setErrors(({ ["vehiculo.dominio"]: _, ...rest }) => rest);
              }}
              error={!!errors["vehiculo.dominio"]}
              helperText={errors["vehiculo.dominio"]}
              />
              <TextField label="Motor" fullWidth margin="normal" value={form.vehiculo.motor} onChange={(e) => handleChange("vehiculo.motor", e.target.value)} error={!!errors["vehiculo.motor"]} helperText={errors["vehiculo.motor"]} />
              <TextField label="Cuadro" fullWidth margin="normal" value={form.vehiculo.cuadro} onChange={(e) => handleChange("vehiculo.cuadro", e.target.value)} error={!!errors["vehiculo.cuadro"]} helperText={errors["vehiculo.cuadro"]} />
            

            {/* Propietario: se muestra si propietario === true */}
              {!propietario && (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, columnGap: 3, rowGap: 2, gridColumn: "1 / -1" }}>
              <Typography variant="h6" sx={{ mt: 3, gridColumn: "1 / -1" }}>Propietario</Typography>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <DocumentDataCapture titulo="cedula (dorso)" tipo="cedulaDorso" onDataCaptured={handleDocumentDataCaptured} />
              </Box>
              <TextField label="DNI *" fullWidth margin="normal" value={form.vehiculo.propietario?.dni} onChange={(e) => handleChange("vehiculo.propietario.dni", e.target.value)} error={!!errors["vehiculo.propietario.dni"]} helperText={errors["vehiculo.propietario.dni"]} />
              <TextField label="Nombre *" fullWidth margin="normal" value={form.vehiculo.propietario?.nombre} onChange={(e) => handleChange("vehiculo.propietario.nombre", e.target.value)} error={!!errors["vehiculo.propietario.nombre"]} helperText={errors["vehiculo.propietario.nombre"]} />
              <TextField
                label="Direccion *"
                fullWidth
                margin="normal"
                sx={{ gridColumn: "1 / -1" }}
                value={form.vehiculo.propietario?.direccion}
                onChange={(e) => handleChange("vehiculo.propietario.direccion", e.target.value)}
                error={!!errors["vehiculo.propietario.direccion"]}
                helperText={errors["vehiculo.propietario.direccion"]}
              />
              </Box>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                columnGap: 3,
                rowGap: 2,
                gridColumn: "1 / -1",
              }}
            >
              {usesTestigosOnly ? (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, gridColumn: "1 / -1" }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Testigos
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    El infractor se fug&oacute;, por lo que no se cargan firmas. Completa los dos testigos obligatorios.
                  </Typography>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                    <Box sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Testigo 1
                      </Typography>
                      <TextField
                        label="Nombre *"
                        fullWidth
                        margin="normal"
                        value={firma.testigos?.[0]?.nombre ?? ""}
                        onChange={(e) => handleTestigoChange(0, "nombre", e.target.value)}
                        error={!!errors["testigos.0.nombre"]}
                        helperText={errors["testigos.0.nombre"]}
                      />
                      <TextField
                        label="Apellido *"
                        fullWidth
                        margin="normal"
                        value={firma.testigos?.[0]?.apellido ?? ""}
                        onChange={(e) => handleTestigoChange(0, "apellido", e.target.value)}
                        error={!!errors["testigos.0.apellido"]}
                        helperText={errors["testigos.0.apellido"]}
                      />
                      <TextField
                        label="DNI *"
                        fullWidth
                        margin="normal"
                        value={firma.testigos?.[0]?.dni ?? ""}
                        onChange={(e) => handleTestigoChange(0, "dni", e.target.value)}
                        error={!!errors["testigos.0.dni"]}
                        helperText={errors["testigos.0.dni"]}
                      />
                      <TextField
                        label="Domicilio"
                        fullWidth
                        margin="normal"
                        value={firma.testigos?.[0]?.domicilio ?? ""}
                        onChange={(e) => handleTestigoChange(0, "domicilio", e.target.value)}
                      />
                    </Box>

                    <Box sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Testigo 2
                      </Typography>
                      <TextField
                        label="Nombre *"
                        fullWidth
                        margin="normal"
                        value={firma.testigos?.[1]?.nombre ?? ""}
                        onChange={(e) => handleTestigoChange(1, "nombre", e.target.value)}
                        error={!!errors["testigos.1.nombre"]}
                        helperText={errors["testigos.1.nombre"]}
                      />
                      <TextField
                        label="Apellido *"
                        fullWidth
                        margin="normal"
                        value={firma.testigos?.[1]?.apellido ?? ""}
                        onChange={(e) => handleTestigoChange(1, "apellido", e.target.value)}
                        error={!!errors["testigos.1.apellido"]}
                        helperText={errors["testigos.1.apellido"]}
                      />
                      <TextField
                        label="DNI *"
                        fullWidth
                        margin="normal"
                        value={firma.testigos?.[1]?.dni ?? ""}
                        onChange={(e) => handleTestigoChange(1, "dni", e.target.value)}
                        error={!!errors["testigos.1.dni"]}
                        helperText={errors["testigos.1.dni"]}
                      />
                      <TextField
                        label="Domicilio"
                        fullWidth
                        margin="normal"
                        value={firma.testigos?.[1]?.domicilio ?? ""}
                        onChange={(e) => handleTestigoChange(1, "domicilio", e.target.value)}
                      />
                    </Box>
                  </Box>
                </Paper>
              ) : (
                <>
                  {/* Bloque original de firmas, se conserva para actas sin infractor fugado */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Firma del infractor
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={firma.seNegoAFirmar}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFirma((prev) => ({
                          ...prev,
                          seNegoAFirmar: checked,
                          firmaInfractorBase64: checked ? null : prev.firmaInfractorBase64,
                          testigos: checked ? ensureTwoTestigos(prev.testigos) : [],
                        }));
                      }}
                    />
                  }
                  label="Se negó a firmar"
                />

                <FirmaCapture
                  ref={firmaInfractorRef}
                  value={firma.firmaInfractorBase64}
                  onChange={(dataUrl) => {
                    setFirma((prev) => ({ ...prev, firmaInfractorBase64: dataUrl }));
                  }}
                  disabled={firma.seNegoAFirmar}
                />

                {firma.seNegoAFirmar && (
                  <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ gridColumn: "1 / -1" }}>
                      Testigos (obligatorio 2)
                    </Typography>

                    <Box sx={{ gridColumn: "1 / -1", p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Testigo 1
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                        <TextField
                          label="Nombre *"
                          value={firma.testigos?.[0]?.nombre ?? ""}
                          onChange={(e) => handleTestigoChange(0, "nombre", e.target.value)}
                          error={!!errors["testigos.0.nombre"]}
                          helperText={errors["testigos.0.nombre"]}
                        />
                        <TextField
                          label="Apellido *"
                          value={firma.testigos?.[0]?.apellido ?? ""}
                          onChange={(e) => handleTestigoChange(0, "apellido", e.target.value)}
                          error={!!errors["testigos.0.apellido"]}
                          helperText={errors["testigos.0.apellido"]}
                        />
                        <TextField
                          label="DNI *"
                          value={firma.testigos?.[0]?.dni ?? ""}
                          onChange={(e) => handleTestigoChange(0, "dni", e.target.value)}
                          error={!!errors["testigos.0.dni"]}
                          helperText={errors["testigos.0.dni"]}
                        />
                        <TextField
                          label="Domicilio"
                          sx={{ gridColumn: "1 / -1" }}
                          value={firma.testigos?.[0]?.domicilio ?? ""}
                          onChange={(e) => handleTestigoChange(0, "domicilio", e.target.value)}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ gridColumn: "1 / -1", p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Testigo 2
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                        <TextField
                          label="Nombre *"
                          value={firma.testigos?.[1]?.nombre ?? ""}
                          onChange={(e) => handleTestigoChange(1, "nombre", e.target.value)}
                          error={!!errors["testigos.1.nombre"]}
                          helperText={errors["testigos.1.nombre"]}
                        />
                        <TextField
                          label="Apellido *"
                          value={firma.testigos?.[1]?.apellido ?? ""}
                          onChange={(e) => handleTestigoChange(1, "apellido", e.target.value)}
                          error={!!errors["testigos.1.apellido"]}
                          helperText={errors["testigos.1.apellido"]}
                        />
                        <TextField
                          label="DNI *"
                          value={firma.testigos?.[1]?.dni ?? ""}
                          onChange={(e) => handleTestigoChange(1, "dni", e.target.value)}
                          error={!!errors["testigos.1.dni"]}
                          helperText={errors["testigos.1.dni"]}
                        />
                        <TextField
                          label="Domicilio"
                          sx={{ gridColumn: "1 / -1" }}
                          value={firma.testigos?.[1]?.domicilio ?? ""}
                          onChange={(e) => handleTestigoChange(1, "domicilio", e.target.value)}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Firma del personal
                </Typography>

                <FirmaCapture
                  ref={firmaOficialRef}
                  value={firma.firmaOficialBase64 || null}
                  onChange={(dataUrl) => {
                    setFirma((prev) => ({ ...prev, firmaOficialBase64: dataUrl ?? "" }));
                    setErrors((er) => {
                      if (!er.firmaOficialBase64) return er;
                      const c = { ...er };
                      delete c.firmaOficialBase64;
                      return c;
                    });
                  }}
                />

                {!!errors.firmaOficialBase64 && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {errors.firmaOficialBase64}
                  </FormHelperText>
                )}
              </Paper>
                </>
              )}
            </Box>
          )}
                    <Box
            sx={{
              mt: 4,
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Button
              variant="outlined"
              onClick={goPrevTab}
              disabled={activeTab === 0}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Atras
            </Button>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="outlined"
                onClick={goNextTab}
                disabled={(isEditingActa ? activeTab === 2 : activeTab === 3) || (activeTab === 1 && !hasValidInfractorDni)}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Siguiente
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Enviar
              </Button>
            </Box>
          </Box>
        </Box>
        <ScrollButton />
      </Paper>
    </Container>
  );
}















































