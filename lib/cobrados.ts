// servicios (vacunas y medicamentos de recetas) que ya se cobraron en una boleta.
// fuente principal: el back (GET /boletas/items-cobrados). si el back todavia no tiene ese
// endpoint, se usa un respaldo en el navegador (no se comparte entre computadores).
import { listarClavesCobradas } from "@/lib/api";
import { logWarn } from "@/lib/logger";

const CLAVE = "vetmanager:servicios-cobrados";

function leerLocal(): Set<string> {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const lista: unknown = crudo ? JSON.parse(crudo) : [];
    return new Set(Array.isArray(lista) ? lista.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

// lee lo cobrado de una mascota: back si existe, si no el respaldo local
export async function obtenerCobrados(idMascota: string): Promise<Set<string>> {
  try {
    const claves = await listarClavesCobradas(idMascota);
    if (claves) return new Set(claves);
  } catch (err) {
    logWarn("no se pudo leer lo cobrado desde el back, se usa el respaldo local", err);
  }
  return leerLocal();
}

// solo se usa cuando el back no guardo el detalle de la boleta
export function marcarCobradosLocal(uids: string[]): void {
  if (uids.length === 0) return;
  try {
    const actuales = leerLocal();
    uids.forEach((u) => actuales.add(u));
    window.localStorage.setItem(CLAVE, JSON.stringify(Array.from(actuales)));
  } catch (err) {
    console.warn("no se pudo guardar el registro local de servicios cobrados", err);
  }
}
