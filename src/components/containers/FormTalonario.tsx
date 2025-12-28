import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { useState } from "react";
import type { Puesto } from "../../models/Puesto";
import type { TalonarioRequest } from "../../models/TalonarioRequest";
import { SnackbarUtilities } from "../../utilities/SnackbarUtilities";
import { TalonarioService } from "../../services/TalonarioService";
import ConfirmDialog from "../ui/dialog/ConfirmDialog";
import type { Talonario } from "../../models/Talonario";


interface FormTalonarioProps {
  talonarios: Talonario[];
  setTalonarios: React.Dispatch<React.SetStateAction<Talonario[]>>;
  puestos: Puesto[]
}

const FormTalonario: React.FC<FormTalonarioProps> = ({ setTalonarios, puestos }) => {
  const [nroInicial, setNroInicial] = useState<number>(0);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState<Number>(0);
  const [open, setOpen] = useState(false);

  const handleOpenDialog = () => setOpen(true);
  const handleCancel = () => setOpen(false);

  const obtenerPuesto = () => {
    return puestos.find(p => p.idPuesto === puestoSeleccionado)!;
  }

  const handleSubmit = async () => {
    const puesto = obtenerPuesto();
    const request: TalonarioRequest = {
    nroInicial,
    puesto
    };
    console.log('request ', request)
    const resp = await TalonarioService.crearTalonario(request);
    setTalonarios(prev => [...prev, resp]);
    setOpen(false);
    SnackbarUtilities.success("Talonario creado exitosamente")
  };
  return (
    <>
      <ConfirmDialog
          open={open}
          title="Confirmar acción"
          message={`Verificar datos antes de confirmar la carga de talonarios:

            • Puesto: ${obtenerPuesto()?.nombre}
            • Número inicial: ${nroInicial}

          ¿Desea continuar con la creación del talonario?`}
          confirmText="Sí, continuar"
          cancelText="Cancelar"
          onConfirm={handleSubmit}
          onCancel={handleCancel}
        />
      <div style={{ width: 350, display: "flex", flexDirection: "column", gap: 16 }}>
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

        <Button onClick={handleOpenDialog} type="submit" variant="contained">
          Crear Talonario
        </Button>
      </div>
    </>
  )
}

export default FormTalonario