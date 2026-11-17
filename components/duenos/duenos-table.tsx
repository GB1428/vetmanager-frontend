"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IdCard, Mail, MapPin, Pencil, Phone, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditarDuenoDialog } from "@/components/duenos/editar-dueno-dialog";
import { ConfirmarEliminarDialog } from "@/components/shared/confirmar-eliminar-dialog";
import { eliminarDuenoConMascotas } from "@/lib/api";
import type { Dueno, Paciente } from "@/lib/types";

export function iniciales(nombre: string): string {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "—"
  );
}

export function DatosContacto({ dueno }: { dueno: Dueno }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="flex items-center gap-3">
        <IdCard className="h-4 w-4 shrink-0 text-primary" />
        RUT: {dueno.rut}
      </p>
      <p className="flex items-center gap-3">
        <Phone className="h-4 w-4 shrink-0 text-primary" />
        {dueno.telefono || "—"}
      </p>
      <p className="flex items-center gap-3">
        <Mail className="h-4 w-4 shrink-0 text-primary" />
        <span className="break-all">{dueno.correo || "—"}</span>
      </p>
      <p className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        {dueno.direccion || "—"}
      </p>
    </div>
  );
}

export function DuenosTable({
  duenos: duenosIniciales,
  pacientes = [],
}: {
  duenos: Dueno[];
  pacientes?: Paciente[];
}) {
  const router = useRouter();
  const [duenos, setDuenos] = useState<Dueno[]>(duenosIniciales);
  const [editando, setEditando] = useState<Dueno | null>(null);
  const [eliminando, setEliminando] = useState<Dueno | null>(null);
  const mascotasDelEliminado = eliminando ? pacientes.filter((p) => p.duenoId === eliminando.id) : [];

  useEffect(() => {
    setDuenos(duenosIniciales);
  }, [duenosIniciales]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {duenos.map((d) => (
          <div
            key={d.id}
            className="relative flex flex-col gap-4 rounded-3xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <Link
              href={`/dashboard/duenos/${d.id}`}
              aria-label={`Ver ficha de ${d.nombre}`}
              className="absolute inset-0 z-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {iniciales(d.nombre)}
              </span>
              <h2 className="text-xl font-semibold leading-tight">{d.nombre}</h2>
            </div>

            <div className="border-t pt-4">
              <DatosContacto dueno={d} />
            </div>

            <div className="relative z-10 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setEliminando(d)}
                aria-label={`Eliminar a ${d.nombre}`}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Eliminar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setEditando(d)}
                aria-label={`Editar a ${d.nombre}`}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {eliminando && (
        <ConfirmarEliminarDialog
          titulo="Eliminar dueño"
          etiquetaConfirmar={mascotasDelEliminado.length > 0 ? "Eliminar dueño y mascotas" : "Eliminar dueño"}
          onClose={() => setEliminando(null)}
          onConfirmar={async () => {
            await eliminarDuenoConMascotas(eliminando.id);
            setDuenos((prev) => prev.filter((d) => d.id !== eliminando.id));
            router.refresh();
          }}
        >
          <p>
            Se eliminará a <span className="font-semibold text-foreground">{eliminando.nombre}</span>. Esta acción no se puede deshacer.
          </p>
          {mascotasDelEliminado.length > 0 ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive">
              Una mascota no puede existir sin tutor, así que también se eliminarán sus{" "}
              <span className="font-semibold">{mascotasDelEliminado.length} mascota{mascotasDelEliminado.length === 1 ? "" : "s"}</span>
              {" "}({mascotasDelEliminado.map((m) => m.nombre).join(", ")}) y sus solicitudes de emergencia, citas, recetas, vacunas y exámenes. Las boletas se conservan.
            </p>
          ) : (
            <p>Este dueño no tiene mascotas registradas. También se borrarán sus solicitudes de emergencia y citas. Las boletas se conservan.</p>
          )}
        </ConfirmarEliminarDialog>
      )}

      {editando && (
        <EditarDuenoDialog
          key={editando.id}
          dueno={editando}
          onClose={() => setEditando(null)}
          onGuardado={(actualizado) => {
            setDuenos((prev) => prev.map((d) => (d.id === actualizado.id ? actualizado : d)));
            router.refresh();
          }}
        />
      )}
    </>
  );
}
