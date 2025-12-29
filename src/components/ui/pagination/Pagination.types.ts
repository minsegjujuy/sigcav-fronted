export interface PaginationProps {
  page: number;             // página actual (0-based o 1-based)
  totalPages: number;       // total de páginas del backend
  onChange: (page: number) => void;  // callback al cambiar de página
  zeroBased?: boolean;      // opcional, por si usas 0-based en backend
}
