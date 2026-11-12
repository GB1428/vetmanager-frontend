import { AgendaView } from "@/components/citas/agenda-view";

export default function AgendaPage() {
  return (
    <div className="space-y-4">
      <AgendaView citasIniciales={[]} />
    </div>
  );
}