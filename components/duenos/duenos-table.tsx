"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditarDuenoDialog } from "@/components/duenos/editar-dueno-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Dueno } from "@/lib/types";

export function DuenosTable({ duenos: duenosIniciales }: { duenos: Dueno[] }) {
  const router = useRouter();
  const [duenos, setDuenos] = useState<Dueno[]>(duenosIniciales);
  const [editando, setEditando] = useState<Dueno | null>(null);

  useEffect(() => {
    setDuenos(duenosIniciales);
  }, [duenosIniciales]);

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>RUT</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Dirección</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {duenos.map((d) => (
          <TableRow key={d.id}>
            <TableCell className="font-medium">{d.nombre}</TableCell>
            <TableCell>{d.rut}</TableCell>
            <TableCell>{d.telefono}</TableCell>
            <TableCell>{d.correo ?? "—"}</TableCell>
            <TableCell>{d.direccion ?? "—"}</TableCell>
            <TableCell className="text-right">
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

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
