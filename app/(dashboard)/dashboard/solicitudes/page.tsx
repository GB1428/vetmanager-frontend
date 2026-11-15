"use client";

import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SolicitudCard } from "@/components/solicitudes/solicitud-card";
import { AceptarSolicitudDialog } from "@/components/solicitudes/aceptar-solicitud-dialog";
import { eliminarSolicitud, listarSolicitudes } from "@/lib/api";
import { mensajeParaUsuario } from "@/lib/errors";
import type { Solicitud } from "@/lib/types";

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aceptando, setAceptando] = useState<Solicitud | null>(null);

  function cargar() {
    setCargando(true);
    listarSolicitudes()
      .then((data) => {
        setSolicitudes(data);
        setError(null);
      })
      .catch((err) => {
        console.error("no se pudieron cargar las solicitudes:", err);
        setError("no se pudo conectar con el servidor, revisa que el backend esté prendido");
      })
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function borrar(id: string) {
    try {
      await eliminarSolicitud(id);
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
      setError(null);
    } catch (err) {
      console.error("no se pudo borrar la solicitud:", err);
      setError(mensajeParaUsuario(err, "no se pudo borrar la solicitud, intenta de nuevo"));
    }
  }

  function rechazar(id: string) {
    if (!window.confirm("¿rechazar esta solicitud? se va a borrar de la lista")) return;
    void borrar(id);
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
              onAceptar={() => setAceptando(s)}
              onRechazar={rechazar}
              onBorrar={borrar}
            />
          ))}
        </div>
      )}

      {aceptando && (
        <AceptarSolicitudDialog
          solicitud={aceptando}
          onClose={() => setAceptando(null)}
          onAceptada={(id) => setSolicitudes((prev) => prev.filter((s) => s.id !== id))}
        />
      )}
    </div>
  );
}
