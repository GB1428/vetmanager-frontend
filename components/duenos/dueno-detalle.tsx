"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditarDuenoDialog } from "@/components/duenos/editar-dueno-dialog";
import { DatosContacto, iniciales } from "@/components/duenos/duenos-table";
import { SEXOS, resolverOpcion } from "@/lib/constants";
import type { Dueno, Paciente } from "@/lib/types";

function etiquetaSexo(valor?: string): string {
  if (!valor) return "—";
  const v = resolverOpcion(SEXOS, valor);
  return SEXOS.find((o) => o.value === v)?.label ?? valor;
}

export function DuenoDetalle({ dueno, mascotas }: { dueno: Dueno; mascotas: Paciente[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <nav className="text-xs text-muted-foreground">
            <Link href="/dashboard/duenos" className="hover:text-foreground">
              Dueños
            </Link>
            <span className="mx-1">/</span>
            <span className="font-semibold text-foreground">{dueno.nombre}</span>
          </nav>
          <h1 className="mt-1 text-2xl font-semibold">{dueno.nombre}</h1>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => setEditando(true)}>
          <Pencil className="mr-1.5 h-4 w-4" />
          Editar Perfil
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="h-fit rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
              {iniciales(dueno.nombre)}
            </span>
            <p className="text-lg font-semibold leading-tight">{dueno.nombre}</p>
          </div>
          <div className="pt-4">
            <DatosContacto dueno={dueno} />
          </div>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <PawPrint className="h-5 w-5 text-primary" />
            Mascotas Registradas ({mascotas.length})
          </h2>

          {mascotas.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Este tutor aún no tiene mascotas registradas.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {mascotas.map((m) => (
                <Link
                  key={m.id}
                  href={`/dashboard/pacientes/${m.id}`}
                  className="flex flex-col gap-3 rounded-3xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div>
                    <p className="text-xl font-semibold leading-tight">{m.nombre}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {m.especie} · {m.raza}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-secondary/50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">Peso</p>
                      <p className="text-sm font-semibold">{m.pesoKg != null ? `${m.pesoKg} kg` : "—"}</p>
                    </div>
                    <div className="rounded-2xl bg-secondary/50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">Sexo</p>
                      <p className="truncate text-sm font-semibold">{etiquetaSexo(m.sexo)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {editando && (
        <EditarDuenoDialog
          dueno={dueno}
          onClose={() => setEditando(false)}
          onGuardado={() => router.refresh()}
        />
      )}
    </div>
  );
}
