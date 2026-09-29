"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Opcion } from "@/lib/constants";

type SelectOpcionesProps = {
  id?: string;
  value: string;
  onValueChange: (valor: string) => void;
  opciones: Opcion[];
  placeholder?: string;
  disabled?: boolean;
};

export function SelectOpciones({
  id,
  value,
  onValueChange,
  opciones,
  placeholder = "Selecciona una opción",
  disabled,
}: SelectOpcionesProps) {
  const lista =
    value && !opciones.some((o) => o.value === value)
      ? [{ value, label: `${value} (actual)` }, ...opciones]
      : opciones;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {lista.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
