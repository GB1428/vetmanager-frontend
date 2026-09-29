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
    return (
      `No hubo respuesta del servidor. Revisa: (1) que el backend esté corriendo en ${API_URL}; ` +
      "(2) que NEXT_PUBLIC_API_URL en .env sea correcta (al cambiarla hay que reiniciar `npm run dev`); " +
      "(3) si el error sale en el navegador y no en la terminal, que el backend tenga CORS habilitado para este origen."
    );
  }
  if (status === 400 || status === 422) {
    return (
      "El backend rechazó los datos (validación). Compara el body enviado con el DTO del backend: " +
      "nombres de campos, tipos (número vs. texto) y campos obligatorios. El mensaje del backend suele decir cuál falla."
    );
  }
  if (status === 401 || status === 403) {
    return "Sin permisos o sesión no válida para este endpoint.";
  }
  if (status === 404) {
    return esEscritura
      ? "Ruta o registro no encontrado. Si es una actualización, confirma que el backend expone ese endpoint (PATCH /recurso/:id) y que el id existe. Un id `undefined` en la URL suele indicar que faltó el dato en el frontend."
      : "Ruta no encontrada. Revisa que el path coincida con el controlador del backend.";
  }
  if (status === 405) {
    return "El backend no acepta este método en esa ruta. Si el endpoint de actualización usa PUT en vez de PATCH, cámbialo en lib/api.ts.";
  }
  if (status === 409) {
    return "Conflicto: probablemente un dato único ya existe (RUT, microchip, correo).";
  }
  if (status >= 500) {
    return (
      "Error interno del backend. Mira la terminal del backend para ver el stack trace. " +
      "Causas comunes: relación (FK) inexistente, valor null en columna NOT NULL, o un tipo de dato que no calza con la entidad."
    );
  }
  return "Respuesta inesperada del backend. Revisa el detalle en la consola.";
}

export function mensajeParaUsuario(err: unknown, porDefecto: string): string {
  if (err instanceof Error && err.message) return err.message;
  return porDefecto;
}
