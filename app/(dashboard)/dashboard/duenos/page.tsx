import Link from "next/link";
import { User, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { DuenosTable } from "@/components/duenos/duenos-table";
import type { Dueno } from "@/lib/types";

// TODO: cuando exista el endpoint, traer los dueños de verdad acá (ver integracion-backend.txt)
const duenos: Dueno[] = [];

export default function DuenosPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Dueños</h1>
          <p className="text-sm text-muted-foreground">Tutores responsables registrados en el sistema</p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/duenos/nuevo">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Dueño
          </Link>
        </Button>
      </div>

      {duenos.length === 0 ? (
        <EmptyState
          icon={User}
          title="Aún no hay dueños registrados"
          description="Cuando registres un tutor, aparecerá aquí junto a sus datos de contacto."
          actionLabel="Registrar primer dueño"
          actionHref="/dashboard/duenos/nuevo"
        />
      ) : (
        <DuenosTable duenos={duenos} />
      )}
    </div>
  );
}
