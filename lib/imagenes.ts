// reduce el peso de las imagenes antes de subirlas (supabase tiene poco espacio).
// jpg/png -> webp, con lado maximo de 2000px. si el resultado no pesa menos, se deja el original.
// los pdf no se tocan.
const LADO_MAXIMO = 2000;
const CALIDAD = 0.8;
const TIPOS_CONVERTIBLES = ["image/jpeg", "image/png"];

export type ResultadoOptimizacion = {
  archivo: File;
  convertido: boolean;
  pesoOriginal: number;
  pesoFinal: number;
};

export function formatearBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function aBlobWebp(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", CALIDAD));
}

export async function optimizarImagen(original: File): Promise<ResultadoOptimizacion> {
  const sinCambios: ResultadoOptimizacion = {
    archivo: original,
    convertido: false,
    pesoOriginal: original.size,
    pesoFinal: original.size,
  };

  if (!TIPOS_CONVERTIBLES.includes(original.type)) return sinCambios;

  try {
    const bitmap = await createImageBitmap(original);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const ancho = Math.max(1, Math.round(bitmap.width * escala));
    const alto = Math.max(1, Math.round(bitmap.height * escala));

    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    if (!ctx) return sinCambios;
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close();

    const blob = await aBlobWebp(canvas);
    if (!blob || blob.type !== "image/webp" || blob.size >= original.size) return sinCambios;

    const base = original.name.replace(/\.[^.]+$/, "");
    const archivo = new File([blob], `${base}.webp`, { type: "image/webp" });
    return { archivo, convertido: true, pesoOriginal: original.size, pesoFinal: archivo.size };
  } catch {
    // si el navegador no puede decodificar la imagen, se sube tal cual
    return sinCambios;
  }
}
