"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditarPacienteDialog } from "@/components/pacientes/editar-paciente-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Dueno, Paciente } from "@/lib/types";

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Especie / Raza</TableHead>
          <TableHead>Sexo</TableHead>
          <TableHead>Dueño</TableHead>
          <TableHead>Microchip</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pacientes.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.nombre}</TableCell>
            <TableCell>
              {p.especie} · {p.raza}
            </TableCell>
            <TableCell>{p.sexo}</TableCell>
            <TableCell>{p.duenoNombre}</TableCell>
            <TableCell>{p.microchip ?? "—"}</TableCell>
            <TableCell className="text-right">
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

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
