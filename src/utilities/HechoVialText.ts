import type { HechoVialListDto } from "../models/HechoVialListDto";

export const generarTextoHechoVial = (hecho: HechoVialListDto): string => {
  let texto = `
DESTACAMENTO: ${hecho.dependencia}

INFORME DE HECHO VIAL

FECHA Y HORA: ${hecho.fecha}
RUTA / UBICACIÓN: ${hecho.ruta}
ZONA: ${hecho.zona}
TIPO DE VÍA: ${hecho.tipoVia} ${hecho.tipoViaOtro ?? ''}

VÍCTIMA FATAL: ${hecho.victimaFatal}
DAÑOS MATERIALES: ${hecho.danosMateriales}

INVOLUCRADOS:
${hecho.involucrados.join(' - ')}

CONFIGURACIÓN DE VÍA: ${hecho.configuracionVia}
ESTADO CALZADA: ${hecho.estadoCalzada}
MATERIAL CALZADA: ${hecho.materialCalzada}
ESTADO AMBIENTAL: ${hecho.estadoAmbiental}
LUZ ARTIFICIAL: ${hecho.luzArtificial}
SEMÁFORO: ${hecho.semaforo}

TIPO SINIESTRO: ${hecho.tipoSiniestro}
TIPO COLISIÓN: ${hecho.tipoColision}

POSIBLES CAUSAS:
${hecho.posiblesCausas.join(' - ')}

SÍNTESIS:
${hecho.sintesis}

-----------------------------------
PROTAGONISTAS
-----------------------------------
`;

  hecho.protagonistas.forEach((p, index) => {
    texto += `
${index + 1}º PROTAGONISTA – ${p.tipoRodado}
DOMINIO: ${p.dominio}
MARCA / MODELO: ${p.marca} ${p.modelo}
COLOR: ${p.color}
ASEGURADO: ${p.asegurado}
RTO: ${p.rto}
CÉDULA: ${p.cedula}
AIRBAG: ${p.airbagActivado}
USO SEGURIDAD: ${p.usoSeguridad}

CONDUCTOR:
Nombre: ${p.conductorNombre}
Género: ${p.conductorGenero}
DNI: ${p.conductorDni}
Nacionalidad: ${p.conductorNacionalidad}
Edad: ${p.conductorEdad}
Licencia: ${p.licenciaNro} (${p.licenciaClase}) - ${p.licenciaEstado}

Traslado: ${p.trasladoConductor}
Alcohol: ${p.graduacionAlcoholica}
Acta: ${p.actaComprobacionNro}
`;

    if (p.acompanantes?.length) {
      texto += `\nACOMPAÑANTES:\n`;
      p.acompanantes.forEach((a, i) => {
        texto += `
${i + 1}º Acompañante
Nombre: ${a.nombre}
Documento: ${a.tipo} ${a.numeroDocumento}
Edad: ${a.edad}
Cinturón/Casco: ${a.usoCinturonCasco}
Traslado: ${a.trasladado}
Estado Salud: ${a.estadoSalud}
`;
      });
    }

    texto += `\n-----------------------------------\n`;
  });

  return texto;
};
