import { Button, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';
import type { HechoVialListDto } from '../../models/HechoVialListDto';
import { generarTextoHechoVial } from '../../utilities/HechoVialText';

interface Props {
  hechoVial: HechoVialListDto;
}

export const BotonCopiarHechoVial = ({ hechoVial }: Props) => {
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    const texto = generarTextoHechoVial(hechoVial);
    await navigator.clipboard.writeText(texto);
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<ContentCopyIcon />}
        onClick={handleCopy}
      >
        Copiar Informe
      </Button>

      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={() => setOpen(false)}
        message="Informe copiado al portapapeles"
      />
    </>
  );
};
