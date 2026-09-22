"use client";

import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SolicitudCard } from "@/components/solicitudes/solicitud-card";
import { listarSolicitudes, actualizarEstadoSolicitud } from "@/lib/api";
import type { Solicitud } from "@/lib/types";

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    setCargando(true);
    listarSolicitudes()
      .then((data) => {
        setSolicitudes(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error al cargar solicitudes:", err);
        setError("No se pudo conectar con el servidor. Revisa que el backend esté corriendo.");
      })
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function actualizarEstado(id: string, estado: Solicitud["estado"]) {
    try {
      await actualizarEstadoSolicitud(id, estado);
      cargar();
    } catch (err) {
      console.error("Error al actualizar la solicitud:", err);
      setError("No se pudo actualizar la solicitud. Intenta de nuevo.");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Solicitudes</h1>
        <p className="text-sm text-muted-foreground">
          Registro de los formularios de emergencia enviados desde la página pública.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!cargando && solicitudes.length === 0 && !error ? (
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
