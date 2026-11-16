"use client";

import { useEffect, useState } from "react";

import { RecetasView } from "@/components/recetas/recetas-view";
import { listarCitas, listarPacientes, listarRecetas } from "@/lib/api";
import type { Cita, Paciente, RecetaCreada } from "@/lib/types";

export default function RecetasPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [recetas, setRecetas] = useState<RecetaCreada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      const [resPacientes, resCitas, resRecetas] = await Promise.allSettled([
        listarPacientes(),
        listarCitas(),
        listarRecetas(),
      ]);

      if (!activo) return;

      if (resPacientes.status === "fulfilled") {
        setPacientes(resPacientes.value);
      } else {
        console.error("Error al cargar pacientes:", resPacientes.reason);
        setError(true);
      }

      if (resCitas.status === "fulfilled") {
        setCitas(resCitas.value);
      } else {
        console.error("Error al cargar citas:", resCitas.reason);
        setError(true);
      }

      if (resRecetas.status === "fulfilled") {
        setRecetas(resRecetas.value);
      } else {
        console.error("Error al cargar recetas:", resRecetas.reason);
        setError(true);
      }

      setCargando(false);
    }

    void cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return <p className="text-sm text-muted-foreground">Cargando recetas...</p>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive">
          No se pudieron cargar todos los datos. Revisa que el backend esté corriendo y que tu sesión siga activa.
        </p>
      )}
      <RecetasView pacientes={pacientes} citas={citas} recetasIniciales={recetas} />
    </div>
  );
}
