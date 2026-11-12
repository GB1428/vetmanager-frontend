"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PawPrint, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PacientesTable } from "@/components/pacientes/pacientes-table";
import { listarPacientes, listarDuenos } from "@/lib/api";

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<
    Awaited<ReturnType<typeof listarPacientes>>
  >([]);

  const [duenos, setDuenos] = useState<
    Awaited<ReturnType<typeof listarDuenos>>
  >([]);

  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        const [resPacientes, resDuenos] = await Promise.allSettled([
          listarPacientes(),
          listarDuenos(),
        ]);

        if (!activo) return;

        if (resPacientes.status === "fulfilled") {
          setPacientes(resPacientes.value);
          setError(false);
        } else {
          console.error(
            "Error al cargar pacientes:",
            resPacientes.reason,
          );
          setError(true);
        }

        if (resDuenos.status === "fulfilled") {
          setDuenos(resDuenos.value);
        } else {
          console.error(
            "Error al cargar los dueños para la edición de pacientes:",
            resDuenos.reason,
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Pacientes</h1>
          <p className="text-sm text-muted-foreground">
            Mascotas registradas en el sistema
          </p>
        </div>

        <Button asChild className="rounded-full">
          <Link href="/dashboard/pacientes/nuevo">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Paciente
          </Link>
        </Button>
      </div>

      {cargando && (
        <p className="text-sm text-muted-foreground">
          Cargando pacientes...
        </p>
      )}

      {!cargando && error && (
        <p className="text-sm text-destructive">
          No se pudieron cargar los pacientes. Comprueba tu sesión
          y la conexión con el servidor.
        </p>
      )}

      {!cargando && !error && pacientes.length === 0 && (
        <EmptyState
          icon={PawPrint}
          title="Aún no hay pacientes registrados"
          description="Cuando registres una mascota, aparecerá aquí junto con los datos de su tutor."
          actionLabel="Registrar primer paciente"
          actionHref="/dashboard/pacientes/nuevo"
        />
      )}

      {!cargando && !error && pacientes.length > 0 && (
        <PacientesTable pacientes={pacientes} duenos={duenos} />
      )}
    </div>
  );
}