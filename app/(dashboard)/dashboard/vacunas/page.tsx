import { VacunasView } from "@/components/vacunas/vacunas-view";
import { listarPacientes, listarVacunas } from "@/lib/api";

export default async function VacunasPage({
  searchParams,
}: {
  searchParams: { paciente?: string };
}) {
  const [resPacientes, resVacunas] = await Promise.allSettled([listarPacientes(), listarVacunas()]);

  const pacientes = resPacientes.status === "fulfilled" ? resPacientes.value : [];
  const vacunas = resVacunas.status === "fulfilled" ? resVacunas.value : [];

  if (resPacientes.status === "rejected") {
    console.error("Error al cargar pacientes:", resPacientes.reason);
  }
  if (resVacunas.status === "rejected") {
    console.error("Error al cargar el catálogo de vacunas:", resVacunas.reason);
  }

  const hayError = resPacientes.status === "rejected" || resVacunas.status === "rejected";

  return (
    <div className="space-y-4">
      {hayError && (
        <p className="text-sm text-destructive">
          No se pudo conectar con el servidor. Revisa que el backend esté corriendo.
        </p>
      )}
      <VacunasView pacientes={pacientes} vacunas={vacunas} pacienteInicialId={searchParams.paciente} />
    </div>
  );
}
