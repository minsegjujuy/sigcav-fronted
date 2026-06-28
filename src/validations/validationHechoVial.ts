import { z } from "zod";

const requiredText = (message: string, maxLength?: number) => {
  const base = z.string().trim().min(1, message);
  return maxLength ? base.max(maxLength, message) : base;
};

const optionalText = (maxLength?: number) => {
  const base = z.string().trim();
  const withMax = maxLength ? base.max(maxLength, "El campo supera la cantidad máxima permitida") : base;
  return withMax.optional().nullable().or(z.literal(""));
};

const optionalNumericText = (message: string) => z.string().regex(/^\d{1,3}$/, message).optional().nullable().or(z.literal(""));

export const ubicacionReqSchema = z
  .object({
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    departamento: requiredText("La ubicación es obligatoria"),
    unidadRegional: z.coerce.number().optional().nullable(),
    localidad: z.coerce.number().optional().nullable(),
    descripcion: z.string().optional().nullable().or(z.literal("")),
    unidadRegionalNombre: z.string().optional().nullable().or(z.literal("")),
    localidadNombre: z.string().optional().nullable().or(z.literal("")),
  })
  .passthrough();

export const involucradoSchema = z
  .object({
    tipo: requiredText("Debe seleccionar un tipo"),
    cantidad: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
    especificarOtro: z.string().optional().nullable().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "OTRO" && !data.especificarOtro) {
      ctx.addIssue({
        path: ["especificarOtro"],
        message: "Debe especificar el tipo cuando selecciona OTRO",
        code: z.ZodIssueCode.custom,
      });
    }
  })
  .passthrough();

export const acompananteSchema = z
  .object({
    id: z.coerce.number().optional().nullable(),
    nombre: requiredText("El nombre del acompañante es obligatorio", 30),
    genero: z
      .string()
      .trim()
      .min(1, "El género es obligatorio")
      .regex(/^[A-Za-z]$/, "El género debe contener una única letra"),
    nacionalidad: requiredText("La nacionalidad es obligatoria", 30),
    provincia: optionalText(30),
    localidad: requiredText("La localidad es obligatoria", 30),
    domicilio: requiredText("El domicilio es obligatorio", 30),
    tipo: z.enum(["DNI", "LC", "LE", "CI"]),
    numeroDocumento: z
      .string()
      .trim()
      .min(1, "El DNI es obligatorio")
      .regex(/^\d{1,8}$/, "El DNI debe contener hasta 8 dígitos"),
    fechaNacimiento: z.string().optional().nullable().or(z.literal("")),
    edad: optionalNumericText("La edad debe ser numérica"),
    usoCinturonCasco: z.boolean(),
    dispositivoRetencion: z.boolean(),
    trasladado: z.string().optional().nullable().or(z.literal("")),
    estadoSalud: requiredText("El estado de salud es obligatorio", 20),
  })
  .passthrough();

export const protagonistaSchema = z
  .object({
    id: z.coerce.number().optional().nullable(),
    tipoRodado: requiredText("El tipo de rodado es obligatorio", 30),
    dominio: optionalText(15),
    marca: optionalText(15),
    modelo: optionalText(35),
    color: requiredText("El color es obligatorio", 15),
    asegurado: z.boolean(),
    rto: z.boolean(),
    cedula: z.boolean(),
    airbagActivado: z.boolean(),
    usoSeguridad: z.boolean(),
    conductorNombre: requiredText("El nombre del conductor es obligatorio", 30),
    conductorGenero: z
      .string()
      .trim()
      .min(1, "El género es obligatorio")
      .regex(/^[A-Za-z]$/, "El género debe contener una única letra"),
    conductorDni: z
      .string()
      .trim()
      .min(1, "El DNI es obligatorio")
      .regex(/^\d{1,8}$/, "El DNI debe contener hasta 8 dígitos"),
    conductorNacionalidad: requiredText("La nacionalidad es obligatoria"),
    conductorEdad: optionalNumericText("La edad debe ser numérica"),
    conductorFechaNacimiento: z.string().optional().nullable().or(z.literal("")),
    municipio: requiredText("El municipio es obligatorio", 30),
    domicilio: requiredText("El domicilio es obligatorio", 30),
    localidad: requiredText("La localidad es obligatoria", 30),
    provincia: requiredText("La provincia es obligatoria", 30),
    licenciaEstado: z.string().trim().max(15, "Estado licencia del conductor no puede superar los 15 caracteres").optional().nullable().or(z.literal("")),
    esFuerzaSeguridad: z.boolean(),
    situacion: optionalText(30),
    jerarquia: optionalText(30),
    legajo: optionalText(10),
    trasladoConductor: z.string().optional().nullable().or(z.literal("")),
    graduacionAlcoholica: z.number().nullable(),
    estadoSalud: requiredText("El estado de salud es obligatorio", 20),
    licenciaRequest: z.object({}).passthrough().optional().nullable(),
    acompanantes: z.array(acompananteSchema).optional().default([]),
    actasNoCargadas: z.array(z.object({}).passthrough()).optional().default([]),
  })
  .passthrough();

export const hechoVialFormSchema = z
  .object({
    id: z.coerce.number().optional().nullable(),
    destacamento: z.coerce.number().int().refine((value) => value > 0, {
      message: "El destacamento es obligatorio",
    }),
    grupo: z.coerce.number().int().refine((value) => value > 0, {
      message: "El grupo es obligatorio",
    }),
    fecha: requiredText("La fecha es obligatoria"),
    hora: requiredText("La hora es obligatoria"),
    comisaria: z.string().optional().nullable().or(z.literal("")),
    ubicacionReq: ubicacionReqSchema,
    victimaFatal: z.string().refine((value) => value === "SI" || value === "NO", {
      message: "Víctima fatal solo puede ser SI o NO",
    }),
    danosMateriales: z.string().refine((value) => value === "SI" || value === "NO", {
      message: "Daños materiales solo puede ser SI o NO",
    }),
    zona: requiredText("La zona es obligatoria", 10),
    tipoVia: requiredText("El tipo de vía es obligatorio", 15),
    tipoViaOtro: optionalText(15),
    involucrados: z.array(involucradoSchema).min(1, "Debe cargar al menos un involucrado"),
    configuracionVia: requiredText("La configuración de vía es obligatoria", 15),
    estadoCalzada: requiredText("El estado de la calzada es obligatorio", 20),
    materialCalzada: requiredText("El material de la calzada es obligatorio", 20),
    estadoFisicoCalzada: requiredText("El estado físico de la calzada es obligatorio", 20),
    estadoAmbiental: requiredText("El estado ambiental es obligatorio", 20),
    luzArtificial: requiredText("Debe indicar si hay luz artificial", 20),
    semaforo: requiredText("Debe indicar si hay semáforo", 20),
    tipoSiniestro: requiredText("El tipo de siniestro es obligatorio", 20),
    tipoColision: optionalText(20),
    posiblesCausas: z.array(z.string()).min(1, "Debe cargar al menos una posible causa"),
    sintesis: z.string().trim().min(10, "La síntesis es obligatoria"),
    protagonistas: z.array(protagonistaSchema).min(1, "Debe cargar al menos un protagonista"),
    unidades: z.array(z.object({}).passthrough()).optional().default([]),
    peatones: z.array(z.object({}).passthrough()).optional().default([]),
  })
  .passthrough();

export type HechoVialFormValidated = z.infer<typeof hechoVialFormSchema>;
