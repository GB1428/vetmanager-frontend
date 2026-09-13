import type { Solicitud } from "@/lib/types";

// URL base de tu backend NestJS
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

// Opción Backend (Descomentar para usar con NestJS):
// export async function getSolicitudes(): Promise<Solicitud[]> {
//   const res = await fetch(`${API_URL}/contacto-emergencia`);
//   return res.json();
// }

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
}
