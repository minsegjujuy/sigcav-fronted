import type { TypeWithKey } from "../types/TypeWithKey";

export const getValidationError = (errorCode: any) => {
    const codeMatcher: TypeWithKey<string> = {
        400: 'Los datos ingresados son incorrectos, revise que sean validos',
        401: 'No autorizado. Por favor, inicia sesión nuevamente.',
        403: 'Acceso denegado. No tienes permiso para realizar esta acción.',
        404: 'Recurso no encontrado. Por favor, verifica la URL o intenta más tarde.',
        500: 'Error del servidor. Intenta nuevamente más tarde.',
    }
    return codeMatcher[errorCode];
}