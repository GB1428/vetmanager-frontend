"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PacienteDetalle } from "@/components/pacientes/paciente-detalle";
import { listarCitas, listarDuenos, listarHistorialVacunas, listarPacientes, obtenerPaciente } from "@/lib/api";
import type { Dueno, Paciente, RegistroVacuna } from "@/lib/types";

type Datos = {
  paciente: Paciente;
  duenos: Dueno[];
  otrosPacientes: Paciente[];
  ultimaVisita?: string;
  vacunas: RegistroVacuna[];
};

// componente de cliente: el token de sesion solo existe en el navegador
export default function PacienteDetallePage({ params }: { params: { id: string } }) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      let paciente: Paciente | null = null;
      try {
        paciente = await obtenerPaciente(params.id);
      } catch (err) {
        console.error("Error al cargar el paciente:", err);
      }

      if (!paciente) {
        if (!activo) return;
        setDatos(null);
        setCargando(false);
        return;
      }
      const actual = paciente;

      const [resDuenos, resPacientes, resCitas, resVacunas] = await Promise.allSettled([
        listarDuenos(),
        listarPacientes(),
        listarCitas(),
        listarHistorialVacunas(actual.id),
      ]);

      const otrosPacientes =
        resPacientes.status === "fulfilled" && actual.duenoId
          ? resPacientes.value.filter((p) => p.duenoId === actual.duenoId && p.id !== actual.id)
          : [];

      let ultimaVisita: string | undefined;
      if (resCitas.status === "fulfilled") {
        const hoy = new Date().toISOString().slice(0, 10);
        ultimaVisita = resCitas.value
          .filter((c) => c.mascotaId === actual.id && c.fecha <= hoy && c.estado !== "Cancelada")
          .map((c) => c.fecha)
          .sort()
          .pop();
      }

      if (!activo) return;
      setDatos({
        paciente: actual,
        duenos: resDuenos.status === "fulfilled" ? resDuenos.value : [],
        otrosPacientes,
        ultimaVisita,
        vacunas: resVacunas.status === "fulfilled" ? resVacunas.value : [],
      });
      setCargando(false);
    }

    void cargarDatos();
    return () => {
      activo = false;
    };
  }, [params.id]);

  if (cargando) {
    return <p className="text-sm text-muted-foreground">Cargando paciente...</p>;
  }

  if (!datos) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">No se pudo cargar el paciente.</p>
        <Link href="/dashboard/pacientes" className="text-sm text-primary hover:underline">
          Volver a pacientes
        </Link>
      </div>
    );
  }

  return (
    <PacienteDetalle
      paciente={datos.paciente}
      duenos={datos.duenos}
      otrosPacientes={datos.otrosPacientes}
      ultimaVisita={datos.ultimaVisita}
      vacunas={datos.vacunas}
    />
  );
}