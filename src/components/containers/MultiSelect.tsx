import { useState } from "react";
import {
  Checkbox,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  OutlinedInput,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// 🔹 Opción genérica para permitir string o number sin conflictos de tipos
export interface FullscreenMultiSelectOption<T extends string | number> {
  id: T;
  label: string;
  description?: string;
}

interface FullscreenMultiSelectProps<T extends string | number> {
  label: string;
  value: T[];
  onChange: (value: T[]) => void;
  options: FullscreenMultiSelectOption<T>[];
  placeholder?: string;
}

function FullscreenMultiSelect<T extends string | number>({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
}: FullscreenMultiSelectProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);

  const selectedText = options
    .filter((o) => value.includes(o.id))
    .map((o) => o.label)
    .join(", ");

  const toggleValue = (id: T) => {
    const newValues = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];

    onChange(newValues);
  };

  return (
    <>
      {isMobile ? (
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setOpen(true)}
          sx={{ justifyContent: "flex-start", textTransform: "none" }}
        >
          {selectedText || placeholder}
        </Button>
      ) : (
        <FormControl fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select
            multiple
            value={value}
            onChange={(e) => onChange(e.target.value as T[])}
            input={<OutlinedInput label={label} />}
            renderValue={() => selectedText}
          >
            {options.map((opt) => (
              <MenuItem key={String(opt.id)} value={opt.id}>
                <Checkbox checked={value.includes(opt.id)} />
                <ListItemText primary={opt.label} secondary={opt.description} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {isMobile && (
        <Dialog fullScreen open={open} onClose={() => setOpen(false)}>
          <AppBar sx={{ position: "relative" }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>

              <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                {label}
              </Typography>

              <Button color="inherit" onClick={() => setOpen(false)}>
                Hecho
              </Button>
            </Toolbar>
          </AppBar>

          <List>
            {options.map((opt) => (
              <ListItemButton key={String(opt.id)} onClick={() => toggleValue(opt.id)}>
                <Checkbox checked={value.includes(opt.id)} />
                <ListItemText primary={opt.label} secondary={opt.description} />
              </ListItemButton>
            ))}
          </List>
        </Dialog>
      )}
    </>
  );
}

export default FullscreenMultiSelect;

