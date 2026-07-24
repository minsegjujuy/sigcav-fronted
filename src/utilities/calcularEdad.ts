export const calcularEdad = (fechaNacimiento: string): number => {
  if (!fechaNacimiento) return 0;

  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  const mes = hoy.getMonth() - nacimiento.getMonth();
  const dia = hoy.getDate() - nacimiento.getDate();

  // Si todavía no cumplió años este año, restamos 1
  if (mes < 0 || (mes === 0 && dia < 0)) {
    edad--;
  }

  return edad;
};
