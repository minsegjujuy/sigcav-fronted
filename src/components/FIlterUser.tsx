import React, { useState } from "react";

interface FilterValues {
  nombre: string;
  nro: string;
}

interface FilterFormProps {
  onFilter: (filters: FilterValues) => void;
}

const FilterForm: React.FC<FilterFormProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterValues>({ nombre: "", nro: "" });

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
    const cleared = { nombre: "", nro: "" };
    setFilters(cleared);
    onFilter(cleared);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 items-center p-3 bg-gray-50 rounded-lg shadow"
    >
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={filters.nombre}
        onChange={handleChange}
        className="border p-2 rounded w-full sm:w-1/2"
      />

      <input
        type="text"
        name="nro"
        placeholder="Número"
        value={filters.nro}
        onChange={handleChange}
        className="border p-2 rounded w-full sm:w-1/2"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Filtrar
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
};

export default FilterForm;

