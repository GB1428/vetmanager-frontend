"use client";

import { useEffect, useState } from "react";

import { VacunasView } from "@/components/vacunas/vacunas-view";
import { listarPacientes, listarVacunas } from "@/lib/api";
import type { Paciente, Vacuna } from "@/lib/types";

// es componente de cliente porque el token de sesion vive en sessionStorage,
// desde el servidor de next las llamadas salen sin token y el back responde 401
export default function VacunasPage({ searchParams }: { searchParams: { paciente?: string } }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [cargando, setCargando] = useState(true);
  const [hayError, setHayError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      const [resPacientes, resVacunas] = await Promise.allSettled([listarPacientes(), listarVacunas()]);
      if (!activo) return;

      if (resPacientes.status === "fulfilled") {
        setPacientes(resPacientes.value);
      } else {
        console.error("Error al cargar pacientes:", resPacientes.reason);
        setHayError(true);
      }

      if (resVacunas.status === "fulfilled") {
        setVacunas(resVacunas.value);
      } else {
        console.error("Error al cargar el catálogo de vacunas:", resVacunas.reason);
        setHayError(true);
      }

      setCargando(false);
    }

    void cargarDatos();
    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return <p className="text-sm text-muted-foreground">Cargando vacunas...</p>;
  }

  return (
    <div className="space-y-4">
      {hayError && (
        <p className="text-sm text-destructive">
          No se pudieron cargar todos los datos. Revisa que el backend esté corriendo y que tu sesión siga activa.
        </p>
      )}
      <VacunasView pacientes={pacientes} vacunas={vacunas} pacienteInicialId={searchParams.paciente} />
    </div>
  );
}
