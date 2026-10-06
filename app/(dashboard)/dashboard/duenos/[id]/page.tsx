import Link from "next/link";

import { DuenoDetalle } from "@/components/duenos/dueno-detalle";
import { listarDuenos, listarPacientes } from "@/lib/api";
import type { Dueno, Paciente } from "@/lib/types";

export default async function DuenoDetallePage({ params }: { params: { id: string } }) {
  let dueno: Dueno | undefined;
  let mascotas: Paciente[] = [];

  try {
    const duenos = await listarDuenos();
    dueno = duenos.find((d) => d.id === params.id);
  } catch (err) {
    console.error("Error al cargar el dueño:", err);
  }

  if (!dueno) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">No se pudo cargar el dueño.</p>
        <Link href="/dashboard/duenos" className="text-sm text-primary hover:underline">
          Volver a dueños
        </Link>
      </div>
    );
  }

  try {
    const pacientes = await listarPacientes();
    mascotas = pacientes.filter((p) => p.duenoId === dueno!.id);
  } catch (err) {
    console.error("Error al cargar las mascotas del dueño:", err);
  }

  return <DuenoDetalle dueno={dueno} mascotas={mascotas} />;
}
