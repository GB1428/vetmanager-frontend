"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { DuenoDetalle } from "@/components/duenos/dueno-detalle";
import { listarDuenos, listarPacientes } from "@/lib/api";
import type { Dueno, Paciente } from "@/lib/types";

// componente de cliente: el token de sesion solo existe en el navegador
export default function DuenoDetallePage({ params }: { params: { id: string } }) {
  const [dueno, setDueno] = useState<Dueno | undefined>();
  const [mascotas, setMascotas] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      let encontrado: Dueno | undefined;
      try {
        const duenos = await listarDuenos();
        encontrado = duenos.find((d) => d.id === params.id);
      } catch (err) {
        console.error("Error al cargar el dueño:", err);
      }

      let suyas: Paciente[] = [];
      if (encontrado) {
        try {
          const pacientes = await listarPacientes();
          suyas = pacientes.filter((p) => p.duenoId === encontrado!.id);
        } catch (err) {
          console.error("Error al cargar las mascotas del dueño:", err);
        }
      }

      if (!activo) return;
      setDueno(encontrado);
      setMascotas(suyas);
      setCargando(false);
    }

    void cargarDatos();
    return () => {
      activo = false;
    };
  }, [params.id]);

  if (cargando) {
    return <p className="text-sm text-muted-foreground">Cargando dueño...</p>;
  }

  if (!dueno) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">No se pudo cargar el dueño.</p>
        <Link href="/dashboard/duenos" className="text-sm text-primary hover:underline">
          Volver a dueños
        </Link>
      </div>
    );
  }

  return <DuenoDetalle dueno={dueno} mascotas={mascotas} />;
}
