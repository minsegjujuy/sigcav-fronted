import z from "zod";

export const ubicacionRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  localidad: z.number().optional(),
  unidadRegional: z.number().optional(),
  departamento: z.string()
});

export const involucradoSchema = z.object({
  tipo: z.string().min(1, 'Debe seleccionar un tipo'),
  cantidad: z.coerce
    .number()
    .min(1, 'La cantidad debe ser mayor a 0'),
  especificarOtro: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.tipo === 'OTRO' && !data.especificarOtro) {
    ctx.addIssue({
      path: ['especificarOtro'],
      message: 'Debe especificar el tipo cuando selecciona OTRO',
      code: z.ZodIssueCode.custom,
    });
  }
});

export const acompananteSchema = z.object({
  nombre: z.string().min(1),
  genero: z.string().min(1),
  nacionalidad: z.string().min(1),
  provincia: z.string().min(1),
  tipo: z.enum(['DNI', 'LC', 'LE', 'CI']),
  numeroDocumento: z.string().min(1),
  fechaNacimiento: z.string().optional(),
  edad: z.string().optional(),
  usoCinturonCasco: z.boolean(),
  dispositivoRetencion: z.boolean(),
  trasladado: z.string(),
  estadoSalud: z.string(),
});

export const protagonistaSchema = z.object({
  tipoRodado: z.string().min(1),
  dominio: z.string().min(1),
  marca: z.string().min(1),
  modelo: z.string().min(1),
  color: z.string().min(1),

  asegurado: z.boolean(),
  rto: z.boolean(),
  cedula: z.boolean(),
  airbagActivado: z.boolean(),
  usoSeguridad: z.boolean(),

  // Conductor
  conductorNombre: z.string().min(3),
  conductorGenero: z.string().min(1),
  conductorDni: z.string().min(1),
  conductorNacionalidad: z.string().min(1),
  conductorEdad: z.string().optional(),
  conductorFechaNacimiento: z.string().optional(),

  licenciaNro: z.string().min(1),
  licenciaClase: z.string().min(1),
  licenciaEstado: z.enum(['VIGENTE', 'VENCIDA', 'NO POSEE', 'SD']),

  // Fuerza seguridad
  esFuerzaSeguridad: z.boolean(),
  jerarquia: z.string().optional(),
  legajo: z.string().optional(),

  // Salud / alcohol
  trasladoConductor: z.string(),
  graduacionAlcoholica: z.number(),

  actaComprobacionNro: z.string().optional(),

  // Artículos (IDs)
  articuladoRef: z.array(z.number()).optional(),

  acompanantes: z.array(acompananteSchema).optional(),
}).refine(
  data =>
    !data.esFuerzaSeguridad ||
    (data.jerarquia && data.legajo),
  {
    message: 'Debe completar jerarquía y legajo',
    path: ['legajo'],
  }
);

export const hechoVialSchema = z.object({
  destacamento: z.number({
    error: 'Destacamento obligatorio',
  }),

  fecha: z.string().min(1, 'Fecha obligatoria'),
  hora: z.string().min(1, 'Hora obligatoria'),

  ruta: z.string().min(1),
  dependencia: z.string().min(1),

  ubicacionReq: ubicacionRequestSchema,

  victimaFatal: z.enum(['SI', 'NO']),
  danosMateriales: z.string().min(1),

  zona: z.string().min(1),
  tipoVia: z.string().min(1),
  tipoViaOtro: z.string().optional(),

  involucrados: z.array(involucradoSchema).min(1),

  configuracionVia: z.string().min(1),
  estadoCalzada: z.string().min(1),
  materialCalzada: z.string().min(1),
  estadoFisicoCalzada: z.string().min(1),
  estadoAmbiental: z.string().min(1),
  luzArtificial: z.string().min(1),
  semaforo: z.string().min(1),

  tipoSiniestro: z.string().min(1),
  tipoColision: z.string().optional(),

  posiblesCausas: z.array(z.string()).min(1),

  sintesis: z.string().min(10, 'La síntesis es obligatoria'),

  protagonistas: z.array(protagonistaSchema).min(1),
});

export type HechoVialForm = z.infer<typeof hechoVialSchema>;
