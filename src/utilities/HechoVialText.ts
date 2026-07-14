import type { HechoVialListDto } from "../models/HechoVialListDto";

const siNo = (valor?: boolean): string =>
  valor === true ? "SI" : valor === false ? "NO" : "SD";

const textoSiExiste = (label: string, value?: string | number | null): string => {
  if (value === null || value === undefined) return "";
  const texto = String(value).trim();
  if (!texto) return "";
  if (texto === "0") return "";
  return `${label}: ${texto}\n`;
};

const textoDescripcion = (value?: string | null): string => {
  const texto = String(value ?? "").trim();
  return texto ? `Descripción: ${texto}\n` : "-\n";
};

export const generarTextoHechoVial = (hecho: HechoVialListDto): string => {
  const extras = hecho as unknown as { nota?: string; deLosHechos?: string };

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
SEMAFORO: ${hecho.semaforo}

TIPO SINIESTRO: ${hecho.tipoSiniestro}
TIPO COLISIÓN: ${hecho.tipoColision || "N/A"}

POSIBLES CAUSAS:
${hecho.posiblesCausas.join(" - ")}

${buildPersonalIntervinienteText(hecho)}

${textoSiExiste("NOTA", extras.nota)}
${textoSiExiste("DE LOS HECHOS", extras.deLosHechos)}

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
${textoSiExiste("Nombre", p.conductorNombre)}${textoSiExiste("Género", p.conductorGenero)}${textoSiExiste("DNI", p.conductorDni)}${textoSiExiste("Nacionalidad", p.conductorNacionalidad)}${textoSiExiste("Domicilio", p.domicilio)}${textoSiExiste("Localidad", p.localidad)}${textoSiExiste("Provincia", p.provincia)}${textoSiExiste("Edad", p.conductorEdad)}
${p.licenciaRequest ? `
Licencia: ${p.licenciaRequest.numero} clase: ${p.licenciaRequest.clase}
Expedición: ${p.licenciaRequest.autoridadExpedicion}
Vencimiento: ${p.licenciaRequest.fechaVencimiento}`
: `NO PRESENTÓ LICENCIA O NO APLICA` }

${textoSiExiste("Traslado", p.trasladoConductor)}${textoDescripcion(p.descripcion)}Alcohol: ${p.graduacionAlcoholica || "N/A"}
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
${textoSiExiste("Nombre", a.nombre)}${textoSiExiste("Documento", `${a.tipo ?? ""} ${a.numeroDocumento ?? ""}`.trim())}${textoSiExiste("Nacionalidad", a.nacionalidad)}${textoSiExiste("Provincia", a.provincia)}${textoSiExiste("Localidad", a.localidad)}${textoSiExiste("Domicilio", a.domicilio)}${textoSiExiste("Fecha de nacimiento", a.fechaNacimiento)}${textoSiExiste("Edad", a.edad)}
Cinturón/Casco: ${siNo(a.usoCinturonCasco)}
${textoSiExiste("Traslado", a.trasladado)}${textoDescripcion(a.descripcion)}
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
${textoSiExiste("Nombre", peaton.nombre)}${textoSiExiste("Género", peaton.genero)}${textoSiExiste("Nacionalidad", peaton.nacionalidad)}${textoSiExiste("Provincia", peaton.provincia)}${textoSiExiste("Domicilio", peaton.domicilio)}${textoSiExiste("Localidad", peaton.localidad)}${textoSiExiste("Documento", `${peaton.tipo ?? ""} ${peaton.numeroDocumento ?? ""}`.trim())}${textoSiExiste("Fecha de nacimiento", peaton.fechaNacimiento)}${textoSiExiste("Edad", peaton.edad)}
Dispositivo de retención: ${siNo(peaton.dispositivoRetencion)}
${textoSiExiste("Traslado", peaton.trasladado)}${textoDescripcion(peaton.descripcion)}Estado de salud: ${peaton.estadoSalud}
`;
    });
  }

  texto += `

INFORMA: ${hecho.usuario || "-"}
`;

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
