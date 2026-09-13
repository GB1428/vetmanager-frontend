import type { Solicitud } from "@/lib/types";

// Esto guarda todo en localStorage como parche mientras no hay backend.
// Solo persiste en este navegador. Cuando esté la API, cambiar las funciones
// de acá abajo por fetch.

const STORAGE_KEY = "vetmanager:solicitudes";

function leerTodas(): Solicitud[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Solicitud[]) : [];
  } catch {
    return [];
  }
}

function guardarTodas(solicitudes: Solicitud[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
}

export function getSolicitudes(): Solicitud[] {
  return leerTodas().sort(
    (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
  );
}

export function getSolicitudesPendientesCount(): number {
  return leerTodas().filter((s) => s.estado === "pendiente").length;
}

export function getSolicitud(id: string): Solicitud | undefined {
  return leerTodas().find((s) => s.id === id);
}

export function addSolicitud(
  datos: Omit<Solicitud, "id" | "estado" | "fechaCreacion">
): Solicitud {
  const nueva: Solicitud = {
    ...datos,
    id: crypto.randomUUID(),
    estado: "pendiente",
    fechaCreacion: new Date().toISOString(),
  };
  guardarTodas([...leerTodas(), nueva]);
  return nueva;
}

export function updateSolicitudEstado(id: string, estado: Solicitud["estado"]) {
  guardarTodas(leerTodas().map((s) => (s.id === id ? { ...s, estado } : s)));
}
