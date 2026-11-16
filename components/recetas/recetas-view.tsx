"use client";

import { useEffect, useState } from "react";

import { RecetaEditor } from "@/components/recetas/receta-editor";
import { RecetaInicio } from "@/components/recetas/receta-inicio";
import { RecetaSelector } from "@/components/recetas/receta-selector";
import { crearReceta } from "@/lib/api";
import { mensajeParaUsuario } from "@/lib/errors";
import { logError } from "@/lib/logger";
import type { Cita, MedicamentoReceta, OrigenReceta, Paciente, PlantillaReceta, RecetaCreada } from "@/lib/types";

type Paso =
  | { tipo: "inicio" }
  | { tipo: "seleccion"; origen: OrigenReceta }
  | { tipo: "editor"; origen: OrigenReceta; paciente?: Paciente; cita?: Cita };

export function RecetasView({
  pacientes,
  citas,
  recetasIniciales = [],
}: {
  pacientes: Paciente[];
  citas: Cita[];
  recetasIniciales?: RecetaCreada[];
}) {
  const [paso, setPaso] = useState<Paso>({ tipo: "inicio" });
  const [recetas, setRecetas] = useState<RecetaCreada[]>(recetasIniciales);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setRecetas(recetasIniciales);
  }, [recetasIniciales]);
  const [plantillas, setPlantillas] = useState<PlantillaReceta[]>([]);

  async function guardar(medicamentos: MedicamentoReceta[], recomendaciones: string) {
    if (paso.tipo !== "editor") return;
    const { origen, paciente, cita } = paso;

    const idMascota = paciente?.id ?? cita?.mascotaId;
    if (!idMascota) {
      setErrorGuardar("No se pudo identificar la mascota de esta receta.");
      return;
    }

    setGuardando(true);
    setErrorGuardar(null);
    try {
      const creada = await crearReceta({
        idMascota,
        origen,
        citaId: cita?.id,
        citaFecha: cita?.fecha,
        citaHora: cita?.hora,
        citaMotivo: cita?.motivo,
        medicamentos,
        recomendaciones,
      });
      setRecetas((prev) => [
        { ...creada, pacienteNombre: paciente?.nombre ?? cita?.mascotaNombre ?? creada.pacienteNombre },
        ...prev,
      ]);
      setPaso({ tipo: "inicio" });
    } catch (err) {
      logError("Error al guardar la receta", err, { idMascota });
      setErrorGuardar(mensajeParaUsuario(err, "No se pudo guardar la receta."));
    } finally {
      setGuardando(false);
    }
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
        guardando={guardando}
        error={errorGuardar}
      />
    );
  }

  return <RecetaInicio recetas={recetas} onElegir={(origen) => setPaso({ tipo: "seleccion", origen })} />;
}
