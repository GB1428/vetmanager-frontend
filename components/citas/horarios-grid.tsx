"use client";

import { cn } from "@/lib/utils";

export function generarHorarios() {
  const horarios: string[] = [];
  for (let hora = 8; hora < 18; hora++) {
    horarios.push(`${String(hora).padStart(2, "0")}:00`);
    horarios.push(`${String(hora).padStart(2, "0")}:30`);
  }
  return horarios;
}

const horarios = generarHorarios();

type HorariosGridProps = {
  seleccionado: string | null;
  onSelect: (hora: string) => void;
};

export function HorariosGrid({ seleccionado, onSelect }: HorariosGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {horarios.map((hora) => (
        <button
          key={hora}
          type="button"
          onClick={() => onSelect(hora)}
          className={cn(
            "rounded-lg border px-2 py-1.5 text-sm transition-colors",
            seleccionado === hora
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-card text-foreground hover:border-primary hover:bg-primary/10"
          )}
        >
          {hora}
        </button>
      ))}
    </div>
  );
}
