"use client";

import { useState } from "react";
import { CalendarDays, FileText, PawPrint, Pill } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatearFechaCorta } from "@/lib/fechas";
import { cn, formatearPeso } from "@/lib/utils";
import type { OrigenReceta, RecetaCreada } from "@/lib/types";

const FILTROS: { value: "todas" | OrigenReceta; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "cita", label: "Por cita" },
  { value: "paciente", label: "Por paciente" },
];

export function RecetaInicio({
  recetas,
  onElegir,
}: {
  recetas: RecetaCreada[];
  onElegir: (origen: OrigenReceta) => void;
}) {
  const [filtro, setFiltro] = useState<"todas" | OrigenReceta>("todas");
  const visibles = recetas.filter((r) => filtro === "todas" || r.origen === filtro);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Recetas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Elige cómo quieres crear la nueva receta.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onElegir("cita")}
          className="flex items-start gap-4 rounded-[2rem] border bg-card p-6 text-left shadow-sm transition-colors hover:border-primary hover:bg-primary/5"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarDays className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-semibold">Crear receta en base a una cita</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Los medicamentos quedan asociados a la cita seleccionada.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onElegir("paciente")}
          className="flex items-start gap-4 rounded-[2rem] border bg-card p-6 text-left shadow-sm transition-colors hover:border-primary hover:bg-primary/5"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PawPrint className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-semibold">Crear receta en base a un paciente</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Para recetas que se hacen fuera de una cita.
            </span>
          </span>
        </button>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-medium">Recetas realizadas</h2>
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFiltro(f.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                  filtro === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {recetas.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aún no hay recetas"
            description="Las recetas que guardes aparecerán aquí, ya sea que las hayas creado desde una cita o desde un paciente."
          />
        ) : visibles.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No hay recetas de este tipo.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibles.map((r) => (
              <li key={r.id} className="rounded-[2rem] border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-2 font-semibold">
                    <PawPrint className="h-4 w-4 text-primary" />
                    {r.pacienteNombre}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                      r.origen === "cita" ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {r.origen === "cita" ? "Por cita" : "Por paciente"}
                  </span>
                </div>
                {r.origen === "cita" && r.citaFecha && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cita: {formatearFechaCorta(r.citaFecha)} {r.citaHora}
                    {r.citaMotivo ? ` · ${r.citaMotivo}` : ""}
                  </p>
                )}
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Pill className="h-3.5 w-3.5" />
                  {r.medicamentos.length} medicamento{r.medicamentos.length === 1 ? "" : "s"} ·{" "}
                  {formatearPeso(r.medicamentos.reduce((acc, m) => acc + m.precio, 0))}
                </p>
                <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">{formatearFechaCorta(r.fecha)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
