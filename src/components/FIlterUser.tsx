import React, { useCallback,  useRef, useState } from "react";
import { TextField } from "@mui/material";

interface FilterValues {
  infractor: string;
  nro: string;
  dni:string;
}

interface FilterFormProps {
  onFilter: (filters: FilterValues) => void;
}

interface FilterValues { infractor: string; nro: string, dni: string; }
interface FilterFormProps { onFilter: (filters: FilterValues) => void; }

function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, wait = 1000) {
  const timeoutRef = useRef<number | null>(null);
  const fnRef = useRef(fn);

  // keep latest fn
  fnRef.current = fn;

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const debounced = useCallback((...args: Parameters<T>) => {
    cancel();
    timeoutRef.current = window.setTimeout(() => {
      fnRef.current(...args);
      timeoutRef.current = null;
    }, wait);
  }, [wait]);

  return { debounced, cancel };
}

const FilterForm: React.FC<FilterFormProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterValues>({ infractor: "", nro: "", dni:"" });

  const { debounced } = useDebouncedCallback(onFilter, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    debounced(updated); // usamos la misma referencia siempre
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <TextField placeholder="Nombre del infractor" name="infractor" value={filters.infractor} onChange={handleChange} />
      <TextField placeholder="Numero de acta" name="nro" value={filters.nro} onChange={handleChange} />
      <TextField placeholder="Dni del infractor" name="dni" value={filters.dni} onChange={handleChange} />
    </form>
  );
};

export default FilterForm;