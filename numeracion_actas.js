import http from "k6/http";
import { check, fail } from "k6";
import exec from "k6/execution";

export const options = {
  scenarios: {
    numeracion_concurrente: {
      executor: "per-vu-iterations",
      vus: 25,
      iterations: 1,
      maxDuration: "2m",
    },
  },

  thresholds: {
    http_req_failed: ["rate==0"],
    http_req_duration: [
      "p(95)<15000",
      "p(99)<30000",
    ],
    checks: ["rate==1"],
  },
};

const BASE_URL = __ENV.BASE_URL;
const TOKEN = __ENV.TOKEN;

function crearPayload(indice) {
  const dni = String(90000000 + indice);

  return {
    "idActa": null,
    "idGrupo": 1,
    "fecha": "2026-07-12T11:42:00",
    "infractor": {
        "idInfrac": null,
        "nombre": "EMANUEL ROLANDO",
        "apellido": "SOSA PEREZ",
        "dni": dni,
        "email": null,
        "telefono": null,
        "domicilio": "ECUADOR 433 BARRIO SANTA ROSA",
        "nacionalidad": "ARGENTINA",
        "localidad": "SAN PEDRO",
        "provincia": "JUJUY",
        "fechaNacimiento": "1999-07-20",
        "licencia": {
            "id": null,
            "clase": "A1",
            "numero": "42045742",
            "autoridadExpedicion": "LICENCIA NACIONAL DE CONDUCIR",
            "fechaExpedicion": "2020-07-20",
            "fechaVencimiento": "2028-07-20"
        },
        "propietario": true
    },
    "vehiculo": {
        "idVeh": null,
        "marca": "FIAT",
        "modelo": "SIENA",
        "año": null,
        "dominio": `ASD-${dni}`,
        "motor": "",
        "cuadro": "",
        "tipoRodado": "AUTOMOVIL",
        "propietario": null
    },
    "idTipo": 3,
    "motivo": "CONTROL RUTINARIO",
    "nro": null,
    "idPuesto": 2,
    "adjunta": "LICENCIA NACIONAL DE CONDUCIR",
    "ubicacionRequest": {
        "lat": -23.804994143405548,
        "lng": -64.79214477119967,
        "departamento": "LEDESMA",
        "unidadRegional": 4,
        "localidad": 11,
        "descripcion": "RUTA X ALTURA X"
    },
    "testigos": [],
    "retencionVehiculo": false,
    "graduacionAlcoholica": 0,
    "infractorFugado": false,
    "juzgado": 2,
    "retencion": "",
    "articulos": [
        55
    ]
  };
}

function generarDominio(indice) {
  return `K6${String(indice).padStart(5, "0")}`;
}

export default function () {
  const indice = exec.scenario.iterationInTest + 1;

  const payload = crearPayload(indice);

  const response = http.post(
    `${BASE_URL}/api/acta/nueva`,
    JSON.stringify(payload),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      timeout: "60s",
      tags: {
        endpoint: "guardar-acta",
      },
    }
  );

  const exitoso = check(response, {
    "status 200 o 201": (r) =>
      r.status === 200 || r.status === 201,

    "respuesta contiene nro": (r) => {
      try {
        const body = r.json();

        return (
          typeof body.nro === "string" &&
          /^AA-\d{8}$/.test(body.nro)
        );
      } catch {
        return false;
      }
    },
  });

  if (!exitoso) {
    console.error(
      `Índice=${indice} ` +
      `status=${response.status} ` +
      `body=${response.body}`
    );

    fail(`Falló la creación del acta ${indice}`);
  }

  const body = response.json();

  console.log(
    `Índice=${indice} número=${body.nro}`
  );
}