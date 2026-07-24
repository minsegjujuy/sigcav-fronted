export const processCedulaImage = async (
  file: File,
  crop: { x: number; y: number; width: number; height: number }
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error("No se pudo crear el contexto del canvas"));
          return;
        }

        // Ajustamos el canvas al tamaño del recorte
        canvas.width = crop.width;
        canvas.height = crop.height;

        // Aplicamos los filtros antes de dibujar
        // Contrast(200%) elimina el azul de la marca de agua
        // Grayscale al 100% ayuda a Tesseract a leer letras negras sobre fondo gris
        ctx.filter = 'grayscale(100%) contrast(200%) brightness(120%)';
        
        // Dibujamos la parte recortada
        ctx.drawImage(
          img,
          crop.x, crop.y, crop.width, crop.height, // Fuente
          0, 0, crop.width, crop.height             // Destino
        );

        // Convertimos el resultado a un nuevo objeto File
        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], "cedula_processed.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(processedFile);
          } else {
            reject(new Error("Error al procesar el blob"));
          }
        }, 'image/jpeg', 0.95); // Calidad alta
      };
    };
    
    reader.onerror = (error) => reject(error);
  });
};