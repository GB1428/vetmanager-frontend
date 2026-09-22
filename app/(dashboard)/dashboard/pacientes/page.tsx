import Link from "next/link";
import { PawPrint, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PacientesTable } from "@/components/pacientes/pacientes-table";
import { listarPacientes } from "@/lib/api";

export default async function PacientesPage() {
  let pacientes: Awaited<ReturnType<typeof listarPacientes>> = [];
  let error = false;

  try {
    pacientes = await listarPacientes();
  } catch (err) {
    console.error("Error al cargar pacientes:", err);
    error = true;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Pacientes</h1>
          <p className="text-sm text-muted-foreground">Mascotas registradas en el sistema</p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/pacientes/nuevo">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Paciente
          </Link>
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          No se pudo conectar con el servidor. Revisa que el backend esté corriendo.
        </p>
      )}

      {pacientes.length === 0 && !error ? (
        <EmptyState
          icon={PawPrint}
          title="Aún no hay pacientes registrados"
          description="Cuando registres una mascota, aparecerá aquí junto con los datos de su tutor."
          actionLabel="Registrar primer paciente"
          actionHref="/dashboard/pacientes/nuevo"
        />
      ) : (
        <PacientesTable pacientes={pacientes} />
      )}
    </div>
  );
}
