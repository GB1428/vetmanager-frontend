import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatearPeso(monto: number): string {
  return `$${Math.round(monto).toLocaleString("es-CL")}`;
}
