import Link from "next/link";

import { PacienteDetalle } from "@/components/pacientes/paciente-detalle";
import { listarCitas, listarDuenos, listarPacientes, obtenerPaciente } from "@/lib/api";
import type { Paciente } from "@/lib/types";

export default async function PacienteDetallePage({ params }: { params: { id: string } }) {
  let paciente: Paciente | null = null;

  try {
    paciente = await obtenerPaciente(params.id);
  } catch (err) {
    console.error("Error al cargar el paciente:", err);
  }

  if (!paciente) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">No se pudo cargar el paciente.</p>
        <Link href="/dashboard/pacientes" className="text-sm text-primary hover:underline">
          Volver a pacientes
        </Link>
      </div>
    );
  }

  const [resDuenos, resPacientes, resCitas] = await Promise.allSettled([
    listarDuenos(),
    listarPacientes(),
    listarCitas(),
  ]);

  const duenos = resDuenos.status === "fulfilled" ? resDuenos.value : [];

  const otrosPacientes =
    resPacientes.status === "fulfilled" && paciente.duenoId
      ? resPacientes.value.filter((p) => p.duenoId === paciente!.duenoId && p.id !== paciente!.id)
      : [];

  let ultimaVisita: string | undefined;
  if (resCitas.status === "fulfilled") {
    const hoy = new Date().toISOString().slice(0, 10);
    ultimaVisita = resCitas.value
      .filter((c) => c.mascotaId === paciente!.id && c.fecha <= hoy && c.estado !== "Cancelada")
      .map((c) => c.fecha)
      .sort()
      .pop();
  }

  return (
    <PacienteDetalle
      paciente={paciente}
      duenos={duenos}
      otrosPacientes={otrosPacientes}
      ultimaVisita={ultimaVisita}
    />
  );
}
