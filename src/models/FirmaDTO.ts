export interface FirmaDTO {
  /** ID del acta a la que pertenece */
  actaId: number;

  /** Coordenadas geográficas del momento de la firma */
  latitud: string;
  longitud: string;

  /** Identificador único del celular/tablet (UUID o similar) */
  deviceId: string;

  /** Indica si el infractor rechazó realizar la rúbrica */
  seNegoAFirmar: boolean;

  /**
   * Imagen de la firma del infractor en formato Base64.
   * Puede ser null si seNegoAFirmar es true.
   */
  firmaInfractorBase64: string | null;

  /**
   * Imagen de la firma del oficial en formato Base64.
   * Es obligatoria para la validez legal del acta.
   */
  firmaOficialBase64: string;
}

