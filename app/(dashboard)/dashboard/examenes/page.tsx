"use client";

import { useEffect, useState } from "react";

import { ExamenesView } from "@/components/examenes/examenes-view";
import { listarPacientes } from "@/lib/api";
import type { Paciente } from "@/lib/types";

export default function ExamenesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarPacientes() {
      try {
        const resultado = await listarPacientes();
        if (activo) setPacientes(resultado);
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
        if (activo) setError(true);
      } finally {
        if (activo) setCargando(false);
      }
    }

    void cargarPacientes();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return <p className="text-sm text-muted-foreground">Cargando exámenes...</p>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive">
          No se pudo conectar con el servidor. Revisa que el backend esté corriendo y que tu sesión siga activa.
        </p>
      )}
      <ExamenesView pacientes={pacientes} />
    </div>
  );
}
