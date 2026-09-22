import { AgendaView } from "@/components/citas/agenda-view";
import { listarCitas } from "@/lib/api";

export default async function AgendaPage() {
  let citas: Awaited<ReturnType<typeof listarCitas>> = [];
  let error = false;

  try {
    citas = await listarCitas();
  } catch (err) {
    console.error("Error al cargar la agenda:", err);
    error = true;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive">
          No se pudo conectar con el servidor. Revisa que el backend esté corriendo.
        </p>
      )}
      <AgendaView citasIniciales={citas} />
    </div>
  );
}
