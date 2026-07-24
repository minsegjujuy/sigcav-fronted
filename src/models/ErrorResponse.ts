// src/models/ErrorResponse.ts

export interface ErrorResponse {
  path: string;           // ruta de la request (/api/usuarios)
  status: number;         // código HTTP (400, 409, 422, 500)
  error: string;          // "Bad Request", "Conflict", etc.
  message: string;        // mensaje legible para el usuario
  code: string;           // código técnico (ej: "PG_23505", "VALIDATION_BODY")
  details?: FieldError[]; // lista de errores de campos (opcional)
  timestamp: string;      // fecha/hora ISO
}

export interface FieldError {
  field: string;
  message: string;
}
