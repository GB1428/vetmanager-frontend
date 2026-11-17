"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { DuenosTable } from "@/components/duenos/duenos-table";
import { listarDuenos, listarPacientes } from "@/lib/api";
import type { Paciente } from "@/lib/types";

type Dueno = Awaited<ReturnType<typeof listarDuenos>>[number];

export default function DuenosPage() {
  const [duenos, setDuenos] = useState<Dueno[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarDuenos() {
      try {
        const [resultado, resPacientes] = await Promise.all([
          listarDuenos(),
          // las mascotas solo sirven para avisar cuantas se borran con el dueño, si falla no importa
          listarPacientes().catch(() => [] as Paciente[]),
        ]);

        if (activo) {
          setDuenos(resultado);
          setPacientes(resPacientes);
        }
      } catch (err) {
        console.error("Error al cargar dueños:", err);

        if (activo) {
          setError(true);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarDuenos();

    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Dueños</h1>
          <p className="text-sm text-muted-foreground">
            Tutores responsables registrados en el sistema
          </p>
        </div>

        <Button asChild className="rounded-full">
          <Link href="/dashboard/duenos/nuevo">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Dueño
          </Link>
        </Button>
      </div>

      {cargando ? (
        <p className="text-sm text-muted-foreground">
          Cargando dueños...
        </p>
      ) : error ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los dueños.
        </p>
      ) : duenos.length === 0 ? (
        <EmptyState
          icon={User}
          title="Aún no hay dueños registrados"
          description="Cuando registres un tutor, aparecerá aquí junto a sus datos de contacto."
          actionLabel="Registrar primer dueño"
          actionHref="/dashboard/duenos/nuevo"
        />
      ) : (
        <DuenosTable duenos={duenos} pacientes={pacientes} />
      )}
    </div>
  );
}