"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditarPacienteDialog } from "@/components/pacientes/editar-paciente-dialog";
import { SEXOS, resolverOpcion } from "@/lib/constants";
import type { Dueno, Paciente } from "@/lib/types";

function etiquetaSexo(valor?: string): string {
  if (!valor) return "—";
  const v = resolverOpcion(SEXOS, valor);
  return SEXOS.find((o) => o.value === v)?.label ?? valor;
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{valor}</span>
    </div>
  );
}

export function PacientesTable({
  pacientes: pacientesIniciales,
  duenos = [],
}: {
  pacientes: Paciente[];
  duenos?: Dueno[];
}) {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>(pacientesIniciales);
  const [editando, setEditando] = useState<Paciente | null>(null);

  useEffect(() => {
    setPacientes(pacientesIniciales);
  }, [pacientesIniciales]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pacientes.map((p) => (
          <div
            key={p.id}
            className="relative flex flex-col gap-4 rounded-3xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <Link
              href={`/dashboard/pacientes/${p.id}`}
              aria-label={`Ver ficha de ${p.nombre}`}
              className="absolute inset-0 z-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <div>
              <h2 className="text-xl font-semibold leading-tight">{p.nombre}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {p.especie} · {p.raza}
              </p>
            </div>

            <div className="space-y-2 rounded-2xl bg-secondary/50 p-4">
              <Dato label="Sexo" valor={etiquetaSexo(p.sexo)} />
              <Dato label="Dueño" valor={p.duenoNombre || "—"} />
              <Dato label="Microchip" valor={p.microchip ?? "—"} />
            </div>

            <div className="relative z-10 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setEditando(p)}
                aria-label={`Editar a ${p.nombre}`}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editando && (
        <EditarPacienteDialog
          key={editando.id}
          paciente={editando}
          duenos={duenos}
          onClose={() => setEditando(null)}
          onGuardado={(actualizado) => {
            setPacientes((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
            router.refresh();
          }}
        />
      )}
    </>
  );
}
