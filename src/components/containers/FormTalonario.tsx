import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { useEffect, useState } from "react";
import type { Puesto } from "../../models/Puesto";
import type { TalonarioRequest } from "../../models/TalonarioRequest";
import { getPuestos } from "../../services/PuestoService";
import { SnackbarUtilities } from "../../utilities/SnackbarUtilities";
import { TalonarioService } from "../../services/TalonarioService";


const FormTalonario = () => {
    const [nroInicial, setNroInicial] = useState<number>(0);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState<Number>(0);
  const [puestos, setPuestos] = useState<Puesto[]>([]);

  const fetchPuestos = async () => {
    const data = await getPuestos();
    setPuestos(data)
  }

  useEffect(() => {
    fetchPuestos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const puesto = puestos.find(p => p.idPuesto === puestoSeleccionado)!;
    const request: TalonarioRequest = {
    nroInicial,
    puesto
    };
    console.log('request ', request)
    const resp = await TalonarioService.crearTalonario(request);
    SnackbarUtilities.success("Talonario creado exitosamente")
  };
  return (
    <form onSubmit={handleSubmit} style={{ width: 350, display: "flex", flexDirection: "column", gap: 16 }}>
      <TextField
        label="Número Inicial"
        type="number"
        value={nroInicial}
        onChange={(e) => setNroInicial(Number(e.target.value))}
        required
      />

      <FormControl fullWidth>
        <InputLabel>Puesto</InputLabel>
        <Select
          value={puestoSeleccionado}
          label="Puesto"
          onChange={(e) => setPuestoSeleccionado(Number(e.target.value))}
          required
        >
          {puestos.map(p => (
            <MenuItem key={p.idPuesto} value={p.idPuesto}>
              {p.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button type="submit" variant="contained">
        Crear Talonario
      </Button>
    </form>
  )
}

export default FormTalonario