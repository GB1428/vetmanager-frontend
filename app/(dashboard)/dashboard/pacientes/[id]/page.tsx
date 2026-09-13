import { VistaPendiente } from "@/components/shared/vista-pendiente";

export default function PacienteDetallePage({ params }: { params: { id: string } }) {
  return <VistaPendiente titulo={`Ficha del paciente #${params.id}`} />;
}
