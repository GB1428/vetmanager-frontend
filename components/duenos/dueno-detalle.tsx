"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditarDuenoDialog } from "@/components/duenos/editar-dueno-dialog";
import { ConfirmarEliminarDialog } from "@/components/shared/confirmar-eliminar-dialog";
import { eliminarDuenoConMascotas } from "@/lib/api";
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
  const [eliminando, setEliminando] = useState(false);

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
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-full text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setEliminando(true)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Eliminar
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => setEditando(true)}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Editar Perfil
          </Button>
        </div>
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
                      <p className="text-sm font-semibold leading-tight">{etiquetaSexo(m.sexo)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {eliminando && (
        <ConfirmarEliminarDialog
          titulo="Eliminar dueño"
          etiquetaConfirmar={mascotas.length > 0 ? "Eliminar dueño y mascotas" : "Eliminar dueño"}
          onClose={() => setEliminando(false)}
          onConfirmar={async () => {
            await eliminarDuenoConMascotas(dueno.id);
            router.push("/dashboard/duenos");
          }}
        >
          <p>
            Se eliminará a <span className="font-semibold text-foreground">{dueno.nombre}</span>. Esta acción no se puede deshacer.
          </p>
          {mascotas.length > 0 ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive">
              Una mascota no puede existir sin tutor, así que también se eliminarán sus{" "}
              <span className="font-semibold">{mascotas.length} mascota{mascotas.length === 1 ? "" : "s"}</span>
              {" "}({mascotas.map((m) => m.nombre).join(", ")}) y sus solicitudes de emergencia, citas, recetas, vacunas y exámenes. Las boletas se conservan.
            </p>
          ) : (
            <p>Este dueño no tiene mascotas registradas. También se borrarán sus solicitudes de emergencia y citas. Las boletas se conservan.</p>
          )}
        </ConfirmarEliminarDialog>
      )}

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
