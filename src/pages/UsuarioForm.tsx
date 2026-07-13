import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import type { Jerarquia, Role, Usuario } from "../models/User";

interface UsuarioFormProps {
  usuario: Usuario;
  jerarquias: Jerarquia[];
  roles: Role[];
  loading?: boolean;
  onSubmit: (usuario: Usuario) => void | Promise<void>;
  onCancelar?: () => void;
}

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,12}$/;

export default function UsuarioForm({
  usuario,
  jerarquias,
  roles,
  loading = false,
  onSubmit,
  onCancelar,
}: UsuarioFormProps) {
  const esEdicion = usuario.idUser != null;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Usuario>({
    defaultValues: usuario,
  });

  useEffect(() => {
    reset({
      ...usuario,
      password: "",
      email: usuario.email ?? "",
      nameRaw: usuario.nameRaw ?? "",
      registroDiario: usuario.registroDiario ?? false,
    });
  }, [usuario, reset]);

  const handleFormSubmit = async (data: Usuario) => {
    const request: Usuario = {
      ...data,
      idUser: usuario.idUser,
      username: data.username.trim(),
      dni: data.dni.trim(),
      nombreCompleto: data.nombreCompleto.trim(),
      email: data.email?.trim() || undefined,
      nameRaw: data.nameRaw?.trim() || undefined,
      password: data.password?.trim() || undefined,
      jerarquia: Number(data.jerarquia),
      role: Number(data.role),
    };

    await onSubmit(request);
  };

  useEffect(() => {
      console.log('jerarquias', jerarquias);
      console.log('roles', roles)
    }, [])

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
    >
      <Typography variant="h5" mb={3}>
        {esEdicion ? "Modificar usuario" : "Crear usuario"}
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Nombre de usuario"
          fullWidth
          error={Boolean(errors.username)}
          helperText={errors.username?.message}
          inputProps={{ maxLength: 10 }}
          {...register("username", {
            required: "El nombre de usuario es obligatorio",
            maxLength: {
              value: 10,
              message:
                "El nombre de usuario no puede superar los 10 caracteres",
            },
          })}
        />

        <TextField
          label="DNI"
          fullWidth
          error={Boolean(errors.dni)}
          helperText={errors.dni?.message}
          inputProps={{
            maxLength: 10,
            inputMode: "numeric",
          }}
          {...register("dni", {
            required: "El DNI es obligatorio",
            maxLength: {
              value: 10,
              message: "El DNI no puede superar los 10 caracteres",
            },
            pattern: {
              value: /^\d+$/,
              message: "El DNI solo puede contener números",
            },
          })}
        />

        <TextField
          label="Nombre completo"
          fullWidth
          error={Boolean(errors.nombreCompleto)}
          helperText={errors.nombreCompleto?.message}
          inputProps={{ maxLength: 40 }}
          {...register("nombreCompleto", {
            required: "El nombre completo es obligatorio",
            maxLength: {
              value: 40,
              message:
                "El nombre completo no puede superar los 40 caracteres",
            },
          })}
        />

        <TextField
          label="Correo electrónico"
          type="email"
          fullWidth
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register("email", {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message:
                "El formato del correo electrónico no es válido",
            },
          })}
        />

        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          autoComplete="new-password"
          error={Boolean(errors.password)}
          helperText={
            errors.password?.message ??
            (esEdicion
              ? "Dejar vacío para conservar la contraseña actual"
              : "Entre 8 y 12 caracteres, con mayúscula, número y carácter especial")
          }
          inputProps={{ maxLength: 12 }}
          {...register("password", {
            validate: (value) => {
              if (esEdicion && !value) {
                return true;
              }

              if (!esEdicion && !value) {
                return "La contraseña es obligatoria";
              }

              return (
                passwordRegex.test(value ?? "") ||
                "La contraseña debe tener entre 8 y 12 caracteres, una mayúscula, un número y un carácter especial"
              );
            },
          })}
        />

        <Controller
          name="jerarquia"
          control={control}
          rules={{
            validate: (value) =>
              Number(value) > 0 || "La jerarquía es obligatoria",
          }}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={Boolean(errors.jerarquia)}
            >
              <InputLabel id="jerarquia-label">
                Jerarquía
              </InputLabel>

              <Select
                {...field}
                labelId="jerarquia-label"
                label="Jerarquía"
                value={field.value || ""}
                onChange={(event) =>
                  field.onChange(Number(event.target.value))
                }
              >
                <MenuItem value="">
                  <em>Seleccione una jerarquía</em>
                </MenuItem>

                {jerarquias.map((jerarquia) => (
                  <MenuItem
                    key={jerarquia.idJer}
                    value={jerarquia.idJer}
                  >
                    {jerarquia.nombre}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                {errors.jerarquia?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="role"
          control={control}
          rules={{
            validate: (value) =>
              Number(value) > 0 || "El rol es obligatorio",
          }}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={Boolean(errors.role)}
            >
              <InputLabel id="role-label">Rol</InputLabel>

              <Select
                {...field}
                labelId="role-label"
                label="Rol"
                value={field.value || ""}
                onChange={(event) =>
                  field.onChange(Number(event.target.value))
                }
              >
                <MenuItem value="">
                  <em>Seleccione un rol</em>
                </MenuItem>

                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.nombre}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                {errors.role?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="registroDiario"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              label="Registro diario"
              control={
                <Switch
                  checked={Boolean(field.value)}
                  onChange={(_, checked) =>
                    field.onChange(checked)
                  }
                />
              }
            />
          )}
        />

        <Controller
          name="resetVerify"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              label="Quitar verificacion de dos pasos"
              control={
                <Switch
                  checked={Boolean(field.value)}
                  onChange={(_, checked) =>
                    field.onChange(checked)
                  }
                />
              }
            />
          )}
        />

        <Controller
          name="enabled"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              label="Bloquear cuenta"
              control={
                <Switch
                  checked={Boolean(field.value)}
                  onChange={(_, checked) =>
                    field.onChange(checked)
                  }
                />
              }
            />
          )}
        />

        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          pt={1}
        >
          {onCancelar && (
            <Button
              type="button"
              variant="outlined"
              disabled={loading}
              onClick={onCancelar}
            >
              Cancelar
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : esEdicion
                ? "Guardar cambios"
                : "Crear usuario"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}