"use client";

import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SolicitudCard } from "@/components/solicitudes/solicitud-card";
import { getSolicitudes, updateSolicitudEstado } from "@/lib/solicitudes-storage";
import type { Solicitud } from "@/lib/types";

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    setSolicitudes(getSolicitudes());
  }, []);

  function actualizarEstado(id: string, estado: Solicitud["estado"]) {
    updateSolicitudEstado(id, estado);
    setSolicitudes(getSolicitudes());
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Solicitudes</h1>
        <p className="text-sm text-muted-foreground">
          Registro de los formularios de emergencia enviados desde la página pública.
        </p>
      </div>

      {solicitudes.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No hay solicitudes por ahora"
          description="Cuando un dueño complete el formulario de emergencia del sitio público, aparecerá aquí."
        />
      ) : (
        <div className="space-y-3">
          {solicitudes.map((s) => (
            <SolicitudCard
              key={s.id}
              solicitud={s}
              onAceptar={(id) => actualizarEstado(id, "aceptada")}
              onRechazar={(id) => actualizarEstado(id, "rechazada")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
