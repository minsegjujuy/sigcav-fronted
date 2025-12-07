import React, { useState, useEffect, useCallback } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import type { UserFilter } from "../../models/UserFilter";
import { findUsersByNombreOrDni } from "../../services/UserService";



interface AutocompleteApiProps {
  onSelect: (option: UserFilter | null) => void;
}

const AutocompleteApi: React.FC<AutocompleteApiProps> = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<UserFilter[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Debounce ---
  const debounce = (func: Function, delay: number) => {
    let timer: any;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchData = async (query: string) => {
    if (!query.trim()) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      console.log('input value ',query)
      const res = await findUsersByNombreOrDni(query);
      setOptions(res);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchData, 500), []);

  useEffect(() => {
    debouncedFetch(inputValue);
  }, [inputValue, debouncedFetch]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.nombreCompleto}
      loading={loading}
      onChange={(e, value) => onSelect(value)}
      noOptionsText="No se encontraron resultados"
      renderOption={(props, option) => (
            <li {...props}>
            <strong>{option.username} - {option.nombreCompleto}</strong> - {option.dni}
            </li>
        )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Buscar por dni o nombre del personal policial..."
          variant="outlined"
          onChange={(e) => setInputValue(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AutocompleteApi;
