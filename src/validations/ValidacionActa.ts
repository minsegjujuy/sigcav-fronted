// validation.ts
import { z } from "zod";

// Patentes AR: viejo ABC123 o nuevo AA123AA
export const dominioAR =
  /^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;

export const dni8 = /^\d{8}$/;

const currentYear = new Date().getFullYear();

export const propietarioSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre del propietario es obligatorio"),
  apellido: z.string().trim().min(1, "El apellido del propietario es obligatorio"),
  dni: z.string().trim().regex(dni8, "El DNI del propietario debe tener 8 dígitos"),
  direccion: z.string().trim().min(1, "La dirección del propietario es obligatoria"),
});

export const actaRequestSchema = z.object({
  idGrupo: z.coerce.number().int().positive("Seleccione un grupo"),
  idTipo: z.coerce.number().int().positive("Seleccione un tipo de acta"),
  idUser: z.coerce.number().int().positive("El usuario es requerido"),

  motivo: z.string().trim().min(1, "El motivo es obligatorio"),
  nro: z.string().trim().min(1, "El número de acta es obligatorio"),

  articulos: z.array(z.number().int()).min(1, "Seleccione al menos un artículo"),

  infractor: z.object({
    idInfrac: z.number().int().optional(),
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    apellido: z.string().trim().min(1, "El apellido es obligatorio"),
    dni: z.string().trim().regex(dni8, "El DNI debe tener 8 dígitos numéricos"),
    lugar: z.string().trim().min(1, "El lugar es obligatorio"),
    propietario: z.boolean(), // << clave para la regla condicional
  }),

  vehiculo: z.object({
    marca: z.string().trim().min(1, "La marca es obligatoria"),
    modelo: z.string().trim().min(1, "El modelo es obligatorio"),
    año: z.coerce
      .number()
      .int("El año debe ser entero")
      .gte(1960, "El año debe ser ≥ 1960")
      .lte(currentYear, `El año no puede ser mayor a ${currentYear}`),
    dominio: z.string().trim().regex(dominioAR, "Dominio inválido (ABC123 o AA123AA)"),

    // Si querés hacerlos obligatorios, quitá el `.optional().or(z.literal(""))`
    motor: z.string().trim().optional().or(z.literal("")),
    cuadro: z.string().trim().optional().or(z.literal("")),

    // Condicional: puede ser objeto o null (según infractor.propietario)
    propietario: propietarioSchema.nullable(),
  }),
})
.superRefine((data, ctx) => {
  // Regla: si el infractor ES propietario -> vehiculo.propietario debe ser null
  // Si NO es propietario -> vehiculo.propietario debe ser objeto válido
  if (data.infractor.propietario) {
    if (data.vehiculo.propietario !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No debe cargar datos de propietario si el infractor es el propietario",
        path: ["vehiculo", "propietario"],
      });
    }
  } else {
    if (data.vehiculo.propietario === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe completar los datos del propietario",
        path: ["vehiculo", "propietario"],
      });
    }
  }
});

export type ActaRequestValidated = z.infer<typeof actaRequestSchema>;
