import type { HechoVialListDto } from "../models/HechoVialListDto";

const siNo = (valor?: boolean): string =>
  valor === true ? "SI" : valor === false ? "NO" : "SD";

export const generarTextoHechoVial = (hecho: HechoVialListDto): string => {
  let texto = `
DESTACAMENTO: ${hecho.puesto}

INFORME DE HECHO VIAL

FECHA Y HORA: ${hecho.fecha}
RUTA / UBICACIÓN: ${hecho.ubicacionReq.descripcion}
COORDENADAS: ${hecho.ubicacionReq.lat} , ${hecho.ubicacionReq.lng}
UNIDAD REGIONAL: ${hecho.ubicacionReq.unidadRegional}
DEPARTAMENTO: ${hecho.ubicacionReq.departamento}
CIUDAD: ${hecho.ubicacionReq.localidad}
ZONA: ${hecho.zona}
TIPO DE VÍA: ${hecho.tipoVia} ${hecho.tipoViaOtro ?? ""}

VÍCTIMA FATAL: ${hecho.victimaFatal}
DAÑOS MATERIALES: ${hecho.danosMateriales}

INVOLUCRADOS:
${hecho.involucrados.join(" - ")}

CONFIGURACIÓN DE VÍA: ${hecho.configuracionVia}
ESTADO CALZADA: ${hecho.estadoCalzada}
MATERIAL CALZADA: ${hecho.materialCalzada}
ESTADO AMBIENTAL: ${hecho.estadoAmbiental}
LUZ ARTIFICIAL: ${hecho.luzArtificial}
SEMÁFORO: ${hecho.semaforo}

TIPO SINIESTRO: ${hecho.tipoSiniestro}
TIPO COLISIÓN: ${hecho.tipoColision || 'N/A'}

POSIBLES CAUSAS:
${hecho.posiblesCausas.join(" - ")}

${buildPersonalIntervinienteText(hecho)}


SÍNTESIS:
${hecho.sintesis}

-----------------------------------
PROTAGONISTAS
-----------------------------------
`;

  hecho.protagonistas?.forEach((p, index) => {
    texto += `
${index + 1}º PROTAGONISTA - ${p.tipoRodado}
DOMINIO: ${p.dominio}
MARCA / MODELO: ${p.marca} ${p.modelo}
COLOR: ${p.color}
ASEGURADO: ${siNo(p.asegurado)}
RTO: ${siNo(p.rto)}
CÉDULA: ${siNo(p.cedula)}
AIRBAG: ${siNo(p.airbagActivado)}
USO SEGURIDAD: ${siNo(p.usoSeguridad)}


CONDUCTOR:
Nombre: ${p.conductorNombre}
Género: ${p.conductorGenero}
DNI: ${p.conductorDni}
Nacionalidad: ${p.conductorNacionalidad}
Domicilio: ${p.domicilio}
Localidad: ${p.localidad}
Provincia: ${p.provincia}
Edad: ${p.conductorEdad}
${p.licenciaRequest ? `
Licencia: ${p.licenciaRequest.numero} clase: ${p.licenciaRequest.clase}
Expedición: ${p.licenciaRequest.autoridadExpedicion}
Vencimiento: ${p.licenciaRequest.fechaVencimiento}`
: `NO PRESENTÓ LICENCIA O NO APLICA` }

Traslado: ${p.trasladoConductor}
Alcohol: ${p.graduacionAlcoholica || 'N/A'}
Fuerza de seguridad: ${siNo(p.esFuerzaSeguridad)}
${p.esFuerzaSeguridad && `
Legajo: ${p.legajo}
Situación de revista: ${p.situacion}
Jerarquía: ${p.jerarquia}
  `}

`;

    if (p.actasNoCargadas?.length) {
      texto += `ACTAS REALIZADAS:\n`;
      p.actasNoCargadas.forEach((acta, actaIndex) => {
        texto += `${actaIndex + 1}. Nro: ${acta.nroActa} | ${acta.articulado} \n`;
      });
    }

    if (p.acompanantes?.length) {
      texto += `\nACOMPAÑANTES:\n`;
      p.acompanantes.forEach((a, i) => {
        texto += `
${i + 1}º Acompañante
Nombre: ${a.nombre}
Documento: ${a.tipo} ${a.numeroDocumento}
Nacionalidad: ${a.nacionalidad}
Provincia: ${a.provincia}
Localidad: ${a.localidad}
Domicilio: ${a.domicilio}
Fecha de nacimiento: ${a.fechaNacimiento}
Edad: ${a.edad}
Cinturón/Casco: ${siNo(a.usoCinturonCasco)}
Traslado: ${a.trasladado}
`;
      });
    }

    texto += `\n-----------------------------------\n`;
  });

  if (hecho.peatones?.length) {
    texto += `
-----------------------------------
PEATONES
-----------------------------------
`;

    hecho.peatones.forEach((peaton, index) => {
      texto += `
${index + 1}º PEATÓN
Nombre: ${peaton.nombre}
Género: ${peaton.genero}
Nacionalidad: ${peaton.nacionalidad}
Provincia: ${peaton.provincia}
Domicilio: ${peaton.domicilio}
Localidad: ${peaton.localidad}
Documento: ${peaton.tipo} ${peaton.numeroDocumento}
Fecha de nacimiento: ${peaton.fechaNacimiento}
Edad: ${peaton.edad}
Dispositivo de retención: ${siNo(peaton.dispositivoRetencion)}
Traslado: ${peaton.trasladado}
Estado de salud: ${peaton.estadoSalud}
`;
    });
  }

  return texto;
};


const buildPersonalIntervinienteText = (hecho?: HechoVialListDto) => {
  if (!hecho?.unidades?.length) return "PERSONAL INTERVINIENTE: Sin datos";

  const textoUnidades = hecho.unidades
    .map((unidad) => {
      const personalTexto = unidad.personal
        ?.map(
          (p) =>
            `   • ${p.jerarquia} ${p.nombre}${
              p.observacion ? ` (${p.observacion})` : ""
            }`
        )
        .join("\n");

      return `${unidad.unidad}\n${personalTexto ?? ""}`;
    })
    .join("\n\n");

  return `PERSONAL INTERVINIENTE:\n${textoUnidades}`;
};
