import Link from "next/link";
import { PawPrint, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PacientesTable } from "@/components/pacientes/pacientes-table";
import type { Paciente } from "@/lib/types";

// TODO: cuando exista el endpoint, traer los pacientes de verdad acá
<<<<<<< HEAD
const pacientes = await fetch(`${API_URL}/mascotas`).then(r => r.json());
=======
const pacientes: Paciente[] = [];
>>>>>>> 9c2c2a8f9d63d21e21c9b0f76faf5646842b243d

export default function PacientesPage() {
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

      {pacientes.length === 0 ? (
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
