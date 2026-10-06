"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IdCard, Mail, MapPin, Pencil, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditarDuenoDialog } from "@/components/duenos/editar-dueno-dialog";
import type { Dueno } from "@/lib/types";

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

export function DuenosTable({ duenos: duenosIniciales }: { duenos: Dueno[] }) {
  const router = useRouter();
  const [duenos, setDuenos] = useState<Dueno[]>(duenosIniciales);
  const [editando, setEditando] = useState<Dueno | null>(null);

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

            <div className="relative z-10 flex justify-end">
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
