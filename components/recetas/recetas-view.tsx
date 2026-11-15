"use client";

import { useState } from "react";

import { RecetaEditor } from "@/components/recetas/receta-editor";
import { RecetaInicio } from "@/components/recetas/receta-inicio";
import { RecetaSelector } from "@/components/recetas/receta-selector";
import { hoyLocalISO } from "@/lib/fechas";
import type { Cita, MedicamentoReceta, OrigenReceta, Paciente, PlantillaReceta, RecetaCreada } from "@/lib/types";

type Paso =
  | { tipo: "inicio" }
  | { tipo: "seleccion"; origen: OrigenReceta }
  | { tipo: "editor"; origen: OrigenReceta; paciente?: Paciente; cita?: Cita };

export function RecetasView({ pacientes, citas }: { pacientes: Paciente[]; citas: Cita[] }) {
  const [paso, setPaso] = useState<Paso>({ tipo: "inicio" });
  const [recetas, setRecetas] = useState<RecetaCreada[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaReceta[]>([]);

  function guardar(medicamentos: MedicamentoReceta[], recomendaciones: string) {
    if (paso.tipo !== "editor") return;
    const { origen, paciente, cita } = paso;

    setRecetas((prev) => [
      {
        id: `${Date.now()}`,
        origen,
        pacienteId: paciente?.id ?? cita?.mascotaId ?? "",
        pacienteNombre: paciente?.nombre ?? cita?.mascotaNombre ?? "—",
        citaId: cita?.id,
        citaFecha: cita?.fecha,
        citaHora: cita?.hora,
        citaMotivo: cita?.motivo,
        medicamentos,
        recomendaciones,
        fecha: hoyLocalISO(),
      },
      ...prev,
    ]);
    setPaso({ tipo: "inicio" });
  }

  if (paso.tipo === "seleccion") {
    return (
      <RecetaSelector
        origen={paso.origen}
        citas={citas}
        pacientes={pacientes}
        onVolver={() => setPaso({ tipo: "inicio" })}
        onElegirCita={(cita) =>
          setPaso({
            tipo: "editor",
            origen: "cita",
            cita,
            paciente: pacientes.find((p) => p.id === cita.mascotaId),
          })
        }
        onElegirPaciente={(paciente) => setPaso({ tipo: "editor", origen: "paciente", paciente })}
      />
    );
  }

  if (paso.tipo === "editor") {
    return (
      <RecetaEditor
        key={paso.cita?.id ?? paso.paciente?.id}
        paciente={paso.paciente}
        cita={paso.cita}
        plantillas={plantillas}
        onCrearPlantilla={(p) => setPlantillas((prev) => [...prev, p])}
        onEliminarPlantilla={(id) => setPlantillas((prev) => prev.filter((p) => p.id !== id))}
        onVolver={() => setPaso({ tipo: "seleccion", origen: paso.origen })}
        onGuardar={guardar}
      />
    );
  }

  return <RecetaInicio recetas={recetas} onElegir={(origen) => setPaso({ tipo: "seleccion", origen })} />;
}
