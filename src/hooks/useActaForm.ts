import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actaRequestSchema, type ActaRequestValidated } from "../validations/ValidacionActa";

export function useActaForm(defaultUserId: number) {
  return useForm<ActaRequestValidated>({
    defaultValues: {
      idGrupo: 0,
      idTipo: 0,
      idUser: defaultUserId,
      motivo: "",
      nro: "",
      articulos: [],
      infractor: { nombre: "", apellido: "", dni: "", lugar: "", propietario: false },
      vehiculo: { marca: "", modelo: "", año: new Date().getFullYear(), dominio: "", motor: "", cuadro: "", propietario: null },
    },
    resolver: zodResolver(actaRequestSchema) as unknown as Resolver<ActaRequestValidated, any>,
    mode: "onBlur",
    shouldUnregister: true,
  });
}