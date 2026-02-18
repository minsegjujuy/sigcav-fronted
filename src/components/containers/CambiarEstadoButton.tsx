import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import { cambiarEstado } from "../../services/ActaSalienteService";
import { SnackbarUtilities } from "../../utilities/SnackbarUtilities";
import AdjustIcon from '@mui/icons-material/Adjust';

// estados posibles según tu máquina
export type EstadoActaSaliente =
  | "ENVIADA"
  | "DEVUELTA"
  | "REENVIADA"
  | "ARCHIVADA";

interface Props {
  actaId: number;
  onSuccess?: () => void;
}

export const CambiarEstadoButton: React.FC<Props> = ({ actaId, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [estado, setEstado] = useState<EstadoActaSaliente>("DEVUELTA");
  const [motivo, setMotivo] = useState("");

  const handleSubmit = async () => {
    await cambiarEstado(estado, motivo, actaId);

    setOpen(false);
    setMotivo("");
    onSuccess?.();
    SnackbarUtilities.success('Se cambio el estado del acta')
  };

  return (
    <>
      <Button
        size="small"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <AdjustIcon />
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar estado del acta</DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            select
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoActaSaliente)}
            fullWidth
          >
            <MenuItem value="DEVUELTA">Devuelta</MenuItem>
            <MenuItem value="REENVIADA">Reenviada</MenuItem>
            <MenuItem value="ARCHIVADA">Archivada</MenuItem>
          </TextField>

          <TextField
            label="Motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!motivo.trim()}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
