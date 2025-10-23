import React, { useState } from "react";

interface FilterValues {
  infractor: string;
  nro: string;
}

interface FilterFormProps {
  onFilter: (filters: FilterValues) => void;
}

const FilterForm: React.FC<FilterFormProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterValues>({ infractor: "", nro: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const cleared = { infractor: "", nro: "" };
    setFilters(cleared);
    onFilter(cleared);
  };

  return (
    <form
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        name="infractor"
        placeholder="Nombre del infractor"
        value={filters.infractor}
        onChange={handleChange}
      />

      <input
        type="text"
        name="nro"
        placeholder="Número de acta PDA o serie B"
        value={filters.nro}
        onChange={handleChange}
      />

      <div>
        <button
          type="submit"
        >
          Filtrar
        </button>
        <button
          type="button"
          onClick={handleReset}
        >
          Limpiar
        </button>
      </div>
    </form>
  );
};

export default FilterForm;

