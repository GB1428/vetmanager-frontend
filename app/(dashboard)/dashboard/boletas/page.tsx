"use client";

import { useEffect, useState } from "react";

import { BoletasView } from "@/components/boletas/boletas-view";
import { listarBoletas, listarCitas, listarDuenos, listarPacientes } from "@/lib/api";
import type { Boleta, Cita, Dueno, Paciente } from "@/lib/types";

export default function BoletasPage() {
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [duenos, setDuenos] = useState<Dueno[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      const [resBoletas, resDuenos, resPacientes, resCitas] = await Promise.allSettled([
        listarBoletas(),
        listarDuenos(),
        listarPacientes(),
        listarCitas(),
      ]);

      if (!activo) return;

      let huboError = false;

      if (resPacientes.status === "fulfilled") setPacientes(resPacientes.value);
      else {
        console.error("no se pudieron cargar los pacientes:", resPacientes.reason);
        huboError = true;
      }
      if (resDuenos.status === "fulfilled") setDuenos(resDuenos.value);
      else {
        console.error("no se pudieron cargar los dueños:", resDuenos.reason);
        huboError = true;
      }
      if (resCitas.status === "fulfilled") setCitas(resCitas.value);
      else {
        console.error("no se pudieron cargar las citas:", resCitas.reason);
        huboError = true;
      }

      if (resBoletas.status === "fulfilled") {
        const pacientesPorId = new Map(
          (resPacientes.status === "fulfilled" ? resPacientes.value : []).map((p) => [p.id, p]),
        );
        const duenosPorId = new Map(
          (resDuenos.status === "fulfilled" ? resDuenos.value : []).map((d) => [d.id, d]),
        );

        setBoletas(
          resBoletas.value.map((b) => ({
            ...b,
            pacienteNombre:
              b.pacienteNombre !== "—"
                ? b.pacienteNombre
                : (b.idMascota != null ? pacientesPorId.get(String(b.idMascota))?.nombre : undefined) ?? "—",
            duenoNombre:
              b.duenoNombre !== "—" ? b.duenoNombre : duenosPorId.get(String(b.idDueno))?.nombre ?? "—",
          })),
        );
      } else {
        console.error("no se pudieron cargar las boletas:", resBoletas.reason);
        huboError = true;
      }

      setError(huboError);
      setCargando(false);
    }

    void cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return <p className="text-sm text-muted-foreground">Cargando boletas...</p>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive">
          algunos datos no se pudieron cargar, revisa que el backend esté prendido y que tu sesión siga activa
        </p>
      )}
      <BoletasView boletasIniciales={boletas} duenos={duenos} pacientes={pacientes} citas={citas} />
    </div>
  );
}
