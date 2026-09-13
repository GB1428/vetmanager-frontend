import type { Solicitud } from "@/lib/types";

<<<<<<< HEAD
// URL base de tu backend NestJS
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
=======
// Esto guarda todo en localStorage como parche mientras no hay backend.
// Solo persiste en este navegador. Cuando esté la API, cambiar las funciones
// de acá abajo por fetch.
>>>>>>> 9c2c2a8f9d63d21e21c9b0f76faf5646842b243d

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

<<<<<<< HEAD
// Opción Backend (Descomentar para usar con NestJS):
// export async function getSolicitudes(): Promise<Solicitud[]> {
//   const res = await fetch(`${API_URL}/contacto-emergencia`);
//   return res.json();
// }

=======
>>>>>>> 9c2c2a8f9d63d21e21c9b0f76faf5646842b243d
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

<<<<<<< HEAD
export async function updateSolicitudEstado(id: string, estado: Solicitud["estado"]) {
  // 1. Actualizar en localStorage
  guardarTodas(leerTodas().map((s) => (s.id === id ? { ...s, estado } : s)));

  // 2. Actualizar en el backend mediante NestJS
  try {
    await fetch(`${API_URL}/contacto-emergencia/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  } catch (error) {
    console.error("Error al actualizar estado en el backend:", error);
  }
=======
export function updateSolicitudEstado(id: string, estado: Solicitud["estado"]) {
  guardarTodas(leerTodas().map((s) => (s.id === id ? { ...s, estado } : s)));
>>>>>>> 9c2c2a8f9d63d21e21c9b0f76faf5646842b243d
}
