export type Opcion = { value: string; label: string };

export const ESTADOS_PAGO: Opcion[] = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PAGADO", label: "Pagado" },
];

export const ESTADO_PAGO_INICIAL = "PENDIENTE";

export const METODOS_PAGO: Opcion[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
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
