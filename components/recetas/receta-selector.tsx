"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, PawPrint, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { especieRaza } from "@/lib/etiquetas";
import { formatearFechaCorta } from "@/lib/fechas";
import type { Cita, OrigenReceta, Paciente } from "@/lib/types";

export function RecetaSelector({
  origen,
  citas,
  pacientes,
  onVolver,
  onElegirCita,
  onElegirPaciente,
}: {
  origen: OrigenReceta;
  citas: Cita[];
  pacientes: Paciente[];
  onVolver: () => void;
  onElegirCita: (cita: Cita) => void;
  onElegirPaciente: (paciente: Paciente) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const termino = busqueda.trim().toLowerCase();

  const citasFiltradas = useMemo(
    () =>
      citas
        .filter(
          (c) =>
            !termino ||
            c.mascotaNombre.toLowerCase().includes(termino) ||
            c.duenoNombre.toLowerCase().includes(termino) ||
            c.motivo.toLowerCase().includes(termino),
        )
        .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`)),
    [citas, termino],
  );

  const pacientesFiltrados = useMemo(
    () =>
      pacientes.filter(
        (p) =>
          !termino ||
          p.nombre.toLowerCase().includes(termino) ||
          p.duenoNombre.toLowerCase().includes(termino),
      ),
    [pacientes, termino],
  );

  const esCita = origen === "cita";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {esCita ? "Selecciona una cita" : "Selecciona un paciente"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {esCita
              ? "La receta quedará asociada a la cita y se completarán los datos del paciente."
              : "Se mostrarán los datos del paciente en la receta."}
          </p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={onVolver}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={esCita ? "Buscar por paciente, dueño o motivo" : "Buscar por paciente o dueño"}
          className="rounded-full pl-9"
        />
      </div>

      {esCita ? (
        citas.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No hay citas" description="Cuando agendes citas aparecerán aquí." />
        ) : citasFiltradas.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No se encontraron citas.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {citasFiltradas.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onElegirCita(c)}
                  className="w-full rounded-3xl border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex items-center gap-2 font-semibold">
                      <PawPrint className="h-4 w-4 text-primary" />
                      {c.mascotaNombre}
                    </p>
                    {c.estado && (
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground">
                        {c.estado}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Dueño: {c.duenoNombre}</p>
                  <p className="mt-3 text-xs font-medium">
                    {formatearFechaCorta(c.fecha)} · {c.hora}
                  </p>
                  {c.motivo && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.motivo}</p>}
                </button>
              </li>
            ))}
          </ul>
        )
      ) : pacientes.length === 0 ? (
        <EmptyState icon={PawPrint} title="No hay pacientes" description="Registra un paciente para poder crear recetas." />
      ) : pacientesFiltrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No se encontraron pacientes.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pacientesFiltrados.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onElegirPaciente(p)}
                className="w-full rounded-3xl border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary hover:bg-primary/5"
              >
                <p className="flex items-center gap-2 font-semibold">
                  <PawPrint className="h-4 w-4 text-primary" />
                  {p.nombre}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{especieRaza(p.especie, p.raza, " / ") || "—"}</p>
                <p className="mt-3 text-xs text-muted-foreground">Dueño: {p.duenoNombre}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
