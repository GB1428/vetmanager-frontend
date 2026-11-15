import { API_URL } from "@/lib/config";

export class ApiError extends Error {
  readonly status: number;
  readonly method: string;
  readonly url: string;
  readonly respuesta: string;
  readonly pista: string;

  constructor(
    mensaje: string,
    datos: {
      status: number;
      method: string;
      url: string;
      respuesta?: string;
      pista?: string;
    },
  ) {
    super(mensaje);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "ApiError";
    this.status = datos.status;
    this.method = datos.method;
    this.url = datos.url;
    this.respuesta = datos.respuesta ?? "";
    this.pista = datos.pista ?? "";
  }
}

export function extraerMensajeBackend(cuerpo: string): string | null {
  const texto = cuerpo.trim();
  if (!texto) return null;

  try {
    const json = JSON.parse(texto) as { message?: unknown; error?: unknown };
    if (Array.isArray(json.message)) return json.message.join("; ");
    if (typeof json.message === "string" && json.message) return json.message;
    if (typeof json.error === "string" && json.error) return json.error;
  } catch {
  }

  if (texto.startsWith("<")) return null;
  return texto.length > 300 ? `${texto.slice(0, 300)}…` : texto;
}

export function pistaParaError(status: number, method: string): string {
  const esEscritura = method !== "GET";

  if (status === 0) {
    return `no hubo respuesta del servidor, puede que el backend esté apagado o que la dirección (${API_URL}) no sea la correcta. si cambiaste el .env, reinicia el front. y si solo falla en el navegador, puede ser el cors`;
  }
  if (status === 400 || status === 422) {
    return "el back no aceptó los datos que le mandamos, puede que falte un campo, que sobre uno o que venga con otro tipo. el mensaje de arriba suele decir cuál";
  }
  if (status === 401 || status === 403) {
    return "parece que la sesión se venció o no hay permiso para esto, prueba iniciando sesión de nuevo";
  }
  if (status === 404) {
    return esEscritura
      ? "no encontré esa ruta o ese registro, puede que el id no exista o que el back no tenga ese endpoint. si el id sale como undefined, el dato no llegó desde el front"
      : "no encontré esa ruta, puede que el nombre no coincida con el del controlador del back";
  }
  if (status === 405) {
    return "el back no acepta ese método en esa ruta, quizás usa put en vez de patch";
  }
  if (status === 409) {
    return "ya existe algo igual, probablemente un rut, un correo o un microchip repetido";
  }
  if (status >= 500) {
    return "se cayó algo adentro del back, en su terminal debería aparecer el detalle. suele ser una relación que no existe o un campo vacío que no puede serlo";
  }
  return "el back respondió algo raro, el detalle debería estar en la consola";
}

export function mensajeParaUsuario(err: unknown, porDefecto: string): string {
  if (err instanceof Error && err.message) return err.message;
  return porDefecto;
}
