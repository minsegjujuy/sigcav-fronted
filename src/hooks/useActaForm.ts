import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actaRequestSchema, type ActaRequestValidated } from "../validations/ValidacionActa";
import type { AxiosError } from "axios";
import { crearActa } from "../services/ActaService";
import { useCallback, useState } from "react";
import type { ActaRequest } from "../models/ActaRequest";


type UseActaFormOptions = {
  onSuccess?: (created: ActaRequestValidated) => void;
  onError?: (err: unknown) => void;
};

export function useActaForm(defaultUserId: number, options?: UseActaFormOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ActaRequestValidated>({
  defaultValues: {
    idGrupo: 0,
    idTipo: 0,
    idUser: defaultUserId,
    motivo: "",
    nro: "",
    articulos: [],
    infractor: { nombre: "", apellido: "", dni: "", lugar: "", propietario: false },
    vehiculo: {
      marca: "",
      modelo: "",
      año: new Date().getFullYear(),
      dominio: "",
      motor: "",
      cuadro: "",
      // <-- cambiado de null a objeto con campos vacíos
      propietario: { nombre: "", apellido: "", dni: "", direccion: "" }
    },
  },
  resolver: zodResolver(actaRequestSchema) as unknown as Resolver<ActaRequestValidated, any>,
  mode: "onBlur",
  shouldUnregister: true,
});

  //const { setError, clearErrors } = form;

  const submitActa = (
    async (values: ActaRequestValidated) => {
      const created = await crearActa(values as ActaRequest);
      console.log('created ',created)}
  );

  return {
    ...form,
    isSubmitting,
    submitActa, // función que podés pasar a handleSubmit
  };
}