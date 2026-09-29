
const PREFIJO = "[VetManager]";

export const esDesarrollo = process.env.NODE_ENV !== "production";

function parsearBody(body: unknown): unknown {
  if (typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export function logInfo(mensaje: string, datos?: unknown) {
  if (!esDesarrollo) return;
  if (datos === undefined) console.info(`${PREFIJO} ${mensaje}`);
  else console.info(`${PREFIJO} ${mensaje}`, datos);
}

export function logWarn(mensaje: string, datos?: unknown) {
  if (datos === undefined) console.warn(`${PREFIJO} ${mensaje}`);
  else console.warn(`${PREFIJO} ${mensaje}`, datos);
}

export function logError(contexto: string, err: unknown, datos?: Record<string, unknown>) {
  console.error(`${PREFIJO} ${contexto}:`, err);

  if (err instanceof Error) {
    console.error("Detalle del error:", err.message);
  }

  if (esDesarrollo && datos) {
    console.error("Datos con los que se intentó:", datos);
  }
}

export function logApiOk(datos: {
  metodo: string;
  path: string;
  status: number;
  ms: number;
  body?: unknown;
}) {
  if (!esDesarrollo) return;
  const linea = `${PREFIJO}[API] ${datos.metodo} ${datos.path} -> ${datos.status} (${datos.ms}ms)`;
  if (datos.body !== undefined && datos.metodo !== "GET") {
    console.info(linea, { enviado: parsearBody(datos.body) });
  } else {
    console.info(linea);
  }
}

export function logApiFallo(datos: {
  metodo: string;
  url: string;
  status: number;
  ms: number;
  mensaje: string;
  respuesta: string;
  pista: string;
  body?: unknown;
}) {
  const estado = datos.status === 0 ? "SIN RESPUESTA" : String(datos.status);
  console.error(`${PREFIJO}[API] ${datos.metodo} ${datos.url} -> ${estado} (${datos.ms}ms)`, {
    mensaje: datos.mensaje,
    respuestaBackend: datos.respuesta || "(vacía)",
    ...(esDesarrollo && datos.body !== undefined ? { enviado: parsearBody(datos.body) } : {}),
    pista: datos.pista,
  });
}
