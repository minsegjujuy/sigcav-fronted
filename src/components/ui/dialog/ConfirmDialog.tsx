import { Dialog, DialogTitle, Button } from "@mui/material";

import { StyledDialogContent, StyledDialogActions } from "./ConfirmDialog.styles";
import type { ConfirmDialogProps } from "./ConfirmDialog.types";

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Confirmar acción",
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      {title && <DialogTitle>{title}</DialogTitle>}

      <StyledDialogContent>
        {message}
      </StyledDialogContent>

      <StyledDialogActions>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button variant="contained" onClick={onConfirm}>
          {confirmText}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
