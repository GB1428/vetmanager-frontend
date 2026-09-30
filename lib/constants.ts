export type Opcion = { value: string; label: string };

export const ESTADOS_PAGO: Opcion[] = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Pagado", label: "Pagado" },
  { value: "Anulado", label: "Anulado" }
];

export const ESTADO_PAGO_INICIAL = "Pendiente";

export const METODOS_PAGO: Opcion[] = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Tarjeta", label: "Tarjeta" },
  { value: "Transferencia", label: "Transferencia" },
];

export const ESTADOS_CITA: Opcion[] = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Confirmada", label: "Confirmada" },
  { value: "Completada", label: "Completada" },
  { value: "Cancelada", label: "Cancelada" },
];

export const ESPECIES: Opcion[] = [
  { value: "perro", label: "Perro" },
  { value: "gato", label: "Gato" },
  { value: "caballo", label: "Caballo" },
  { value: "otro", label: "Otro" },
];

export const SEXOS: Opcion[] = [
  { value: "macho", label: "Macho" },
  { value: "macho-castrado", label: "Macho - Castrado / Esterilizado" },
  { value: "hembra", label: "Hembra" },
  { value: "hembra-esterilizada", label: "Hembra - Esterilizada" },
];

function normalizar(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function resolverOpcion(opciones: Opcion[], valor?: string | null): string {
  if (!valor) return "";
  const encontrada = opciones.find((o) => normalizar(o.value) === normalizar(valor));
  return encontrada ? encontrada.value : valor;
}
