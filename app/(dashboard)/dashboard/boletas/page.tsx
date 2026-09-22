import { BoletasView } from "@/components/boletas/boletas-view";
import { listarBoletas, listarDuenos, listarCitas } from "@/lib/api";

export default async function BoletasPage() {
  let boletas: Awaited<ReturnType<typeof listarBoletas>> = [];
  let duenos: Awaited<ReturnType<typeof listarDuenos>> = [];
  let citas: Awaited<ReturnType<typeof listarCitas>> = [];
  let error = false;

  try {
    [boletas, duenos, citas] = await Promise.all([listarBoletas(), listarDuenos(), listarCitas()]);
  } catch (err) {
    console.error("Error al cargar boletas:", err);
    error = true;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive">
          No se pudo conectar con el servidor. Revisa que el backend esté corriendo.
        </p>
      )}
      <BoletasView boletasIniciales={boletas} duenos={duenos} citas={citas} />
    </div>
  );
}
