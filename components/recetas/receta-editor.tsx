"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, BookmarkPlus, Eye, Info, PawPrint, PlusCircle, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectOpciones } from "@/components/shared/select-opciones";
import { NuevaPlantillaDialog } from "@/components/recetas/nueva-plantilla-dialog";
import { UNIDADES_DURACION } from "@/lib/constants";
import { calcularEdad, formatearFechaCorta, hoyLocalISO } from "@/lib/fechas";
import { especieRaza, etiquetaSexo } from "@/lib/etiquetas";
import { formatearPeso } from "@/lib/utils";
import type { Cita, MedicamentoReceta, Paciente, PlantillaReceta } from "@/lib/types";

function formatearFechaReceta(iso: string): string {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

export function RecetaEditor({
  paciente,
  cita,
  plantillas,
  onCrearPlantilla,
  onEliminarPlantilla,
  onVolver,
  onGuardar,
  guardando = false,
  error = null,
}: {
  paciente?: Paciente;
  cita?: Cita;
  plantillas: PlantillaReceta[];
  onCrearPlantilla: (plantilla: PlantillaReceta) => void;
  onEliminarPlantilla: (id: string) => void;
  onVolver: () => void;
  onGuardar: (medicamentos: MedicamentoReceta[], recomendaciones: string) => void;
  guardando?: boolean;
  error?: string | null;
}) {
  const [medicamentos, setMedicamentos] = useState<MedicamentoReceta[]>([]);
  const [recomendaciones, setRecomendaciones] = useState("");
  const [plantillaAbierta, setPlantillaAbierta] = useState(false);

  const [nombre, setNombre] = useState("");
  const [dosis, setDosis] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [duracion, setDuracion] = useState("");
  const [unidadDuracion, setUnidadDuracion] = useState("Días");
  const [instrucciones, setInstrucciones] = useState("");
  const [precio, setPrecio] = useState("");
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const totalReceta = useMemo(() => medicamentos.reduce((acc, m) => acc + m.precio, 0), [medicamentos]);

  function limpiarFormulario() {
    setNombre("");
    setDosis("");
    setFrecuencia("");
    setDuracion("");
    setUnidadDuracion("Días");
    setInstrucciones("");
    setPrecio("");
    setErrorForm(null);
  }

  function handleAgregar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nombre.trim()) {
      setErrorForm("Ingresa el medicamento o principio activo.");
      return;
    }
    const precioNumero = precio === "" ? 0 : Number(precio);
    if (!Number.isInteger(precioNumero) || precioNumero < 0) {
      setErrorForm("Ingresa un precio válido (número entero).");
      return;
    }

    setMedicamentos((prev) => [
      ...prev,
      {
        uid: `${Date.now()}-${prev.length}`,
        nombre: nombre.trim(),
        dosis: dosis.trim(),
        frecuencia: frecuencia.trim(),
        duracion: duracion.trim(),
        unidadDuracion,
        instrucciones: instrucciones.trim(),
        precio: precioNumero,
      },
    ]);
    limpiarFormulario();
  }

  function usarPlantilla(p: PlantillaReceta) {
    setMedicamentos((prev) => [
      ...prev,
      {
        uid: `${Date.now()}-${prev.length}`,
        nombre: p.nombre,
        dosis: p.dosis,
        frecuencia: p.frecuencia,
        duracion: p.duracion,
        unidadDuracion: p.unidadDuracion,
        instrucciones: p.instrucciones,
        precio: p.precio,
      },
    ]);
  }

  const hoy = formatearFechaReceta(hoyLocalISO());
  const edad = paciente ? calcularEdad(paciente.fechaNacimiento) : null;
  const sexo = paciente ? etiquetaSexo(paciente.sexo) : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">Generador de Recetas</h1>
          <p className="text-sm text-muted-foreground">
            {cita
              ? `Receta de la cita del ${formatearFechaCorta(cita.fecha)} · ${cita.hora}`
              : "Receta creada directamente para el paciente"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={onVolver}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Volver
          </Button>
          <Button
            className="rounded-full"
            onClick={() => onGuardar(medicamentos, recomendaciones.trim())}
            disabled={medicamentos.length === 0 || guardando}
          >
            <Save className="mr-1.5 h-4 w-4" />
            {guardando ? "Guardando..." : "Guardar receta"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-xl font-medium">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                <PlusCircle className="h-4 w-4" />
              </span>
              Agregar Medicamento
            </h2>

            <form onSubmit={handleAgregar} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receta-nombre" className="text-xs font-semibold">
                  Medicamento o Principio Activo
                </Label>
                <Input
                  id="receta-nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Amoxicilina + Ácido Clavulánico 250mg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receta-dosis" className="text-xs font-semibold">
                    Dosis
                  </Label>
                  <Input
                    id="receta-dosis"
                    value={dosis}
                    onChange={(e) => setDosis(e.target.value)}
                    placeholder="Ej. 1 tableta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receta-frecuencia" className="text-xs font-semibold">
                    Frecuencia
                  </Label>
                  <Input
                    id="receta-frecuencia"
                    value={frecuencia}
                    onChange={(e) => setFrecuencia(e.target.value)}
                    placeholder="Ej. Cada 12 horas"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receta-duracion" className="text-xs font-semibold">
                  Duración del Tratamiento
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="receta-duracion"
                    type="number"
                    min="1"
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    placeholder="Ej. 7"
                  />
                  <SelectOpciones
                    value={unidadDuracion}
                    onValueChange={setUnidadDuracion}
                    opciones={UNIDADES_DURACION}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receta-instrucciones" className="text-xs font-semibold">
                  Instrucciones Adicionales
                </Label>
                <Textarea
                  id="receta-instrucciones"
                  value={instrucciones}
                  onChange={(e) => setInstrucciones(e.target.value)}
                  placeholder="Ej. Administrar junto con las comidas para evitar malestar estomacal."
                  rows={3}
                  className="rounded-2xl px-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receta-precio" className="text-xs font-semibold">
                  Precio
                </Label>
                <Input
                  id="receta-precio"
                  type="number"
                  min="0"
                  step="1"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="Ej. 8000"
                />
              </div>

              {errorForm && <p className="text-sm text-destructive">{errorForm}</p>}

              <div className="flex justify-end">
                <Button type="submit" variant="outline" className="rounded-full">
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Añadir a la Receta
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-3 text-xl font-medium">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                  <BookmarkPlus className="h-4 w-4" />
                </span>
                Mis Recetas Guardadas
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setPlantillaAbierta(true)}
              >
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Nueva
              </Button>
            </div>

            {plantillas.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-secondary/50 px-4 py-6 text-center text-sm text-muted-foreground">
                Crea medicamentos o tratamientos frecuentes para reutilizarlos con su precio.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {plantillas.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border bg-secondary/40 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{p.nombre}</p>
                        {p.antiparasitario && (
                          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                            Antiparasitario
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[p.dosis, p.frecuencia, p.duracion ? `${p.duracion} ${p.unidadDuracion.toLowerCase()}` : ""]
                          .filter(Boolean)
                          .join(" • ") || "Sin detalles"}
                      </p>
                      <p className="mt-0.5 text-xs font-medium">{formatearPeso(p.precio)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button type="button" size="sm" className="rounded-full" onClick={() => usarPlantilla(p)}>
                        Usar
                      </Button>
                      <button
                        type="button"
                        onClick={() => onEliminarPlantilla(p.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Eliminar ${p.nombre}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-xl font-medium">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                <Info className="h-4 w-4" />
              </span>
              Recomendaciones Generales
            </h2>
            <Textarea
              value={recomendaciones}
              onChange={(e) => setRecomendaciones(e.target.value)}
              placeholder="Reposo relativo por 48 horas. Ofrecer agua fresca a voluntad. Dieta blanda los próximos 2 días..."
              rows={4}
              className="mt-4 rounded-2xl px-4"
            />
          </section>
        </div>

        <div className="space-y-3 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 rounded-full border bg-secondary/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Eye className="h-4 w-4" />
            Vista Previa en Vivo
          </div>

          <article className="rounded-[2rem] border bg-card p-6 shadow-sm">
            <header className="flex items-start justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <PawPrint className="h-5 w-5" />
                </span>
                <p className="font-display text-xl font-semibold leading-tight text-primary">VetManager</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold">Receta Médica</p>
                <p className="text-muted-foreground">Fecha: {hoy}</p>
              </div>
            </header>

            <div className="mt-4 rounded-2xl bg-secondary/50 p-4 text-xs">
              {paciente ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-muted-foreground">Paciente:</p>
                    <p className="font-semibold">{paciente.nombre}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Especie/Raza:</p>
                    <p className="font-medium">{especieRaza(paciente.especie, paciente.raza, " / ") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Peso:</p>
                    <p className="font-medium">{paciente.pesoKg != null ? `${paciente.pesoKg} kg` : "—"}</p>
                  </div>
                  {sexo && (
                    <div>
                      <p className="text-muted-foreground">Sexo:</p>
                      <p className="font-medium">{sexo}</p>
                    </div>
                  )}
                  {edad && (
                    <div>
                      <p className="text-muted-foreground">Edad:</p>
                      <p className="font-medium">{edad}</p>
                    </div>
                  )}
                  {paciente.microchip && (
                    <div>
                      <p className="text-muted-foreground">Microchip:</p>
                      <p className="font-medium">{paciente.microchip}</p>
                    </div>
                  )}
                  <div className="col-span-3">
                    <p className="text-muted-foreground">Propietario:</p>
                    <p className="font-medium">{paciente.duenoNombre}</p>
                  </div>
                  {paciente.alergias && (
                    <div className="col-span-3">
                      <p className="text-muted-foreground">Alergias:</p>
                      <p className="font-medium">{paciente.alergias}</p>
                    </div>
                  )}
                  {paciente.antecedentes && (
                    <div className="col-span-3">
                      <p className="text-muted-foreground">Antecedentes:</p>
                      <p className="font-medium">{paciente.antecedentes}</p>
                    </div>
                  )}
                  {cita && (
                    <div className="col-span-3 border-t pt-3">
                      <p className="text-muted-foreground">Cita:</p>
                      <p className="font-medium">
                        {formatearFechaCorta(cita.fecha)} · {cita.hora}
                        {cita.motivo ? ` · ${cita.motivo}` : ""}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No se encontró la información del paciente.</p>
              )}
            </div>

            <p className="mt-5 font-display text-3xl font-bold text-primary">Rx</p>

            {medicamentos.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Aún no hay medicamentos en la receta.</p>
            ) : (
              <ul className="mt-3 space-y-4">
                {medicamentos.map((m, i) => (
                  <li key={m.uid} className="border-l-2 border-primary/30 pl-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {i + 1}. {m.nombre}
                      </p>
                      <button
                        type="button"
                        onClick={() => setMedicamentos((prev) => prev.filter((x) => x.uid !== m.uid))}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Quitar ${m.nombre}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs">
                      {m.dosis && (
                        <p>
                          <span className="font-semibold">Dar:</span> {m.dosis}
                        </p>
                      )}
                      {m.frecuencia && (
                        <p>
                          <span className="font-semibold">Frecuencia:</span> {m.frecuencia}
                        </p>
                      )}
                      {m.duracion && (
                        <p>
                          <span className="font-semibold">Duración:</span> {m.duracion} {m.unidadDuracion.toLowerCase()}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Precio:</span> {formatearPeso(m.precio)}
                      </p>
                    </div>
                    {m.instrucciones && (
                      <p className="mt-2 rounded-full bg-secondary px-3 py-1.5 text-[11px] italic text-muted-foreground">
                        {m.instrucciones}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {recomendaciones.trim() && (
              <div className="mt-5 border-t pt-4 text-xs">
                <p className="font-semibold">Recomendaciones generales</p>
                <p className="mt-1 whitespace-pre-line text-muted-foreground">{recomendaciones.trim()}</p>
              </div>
            )}

            {medicamentos.length > 0 && (
              <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
                <span className="font-semibold">Total receta</span>
                <span className="font-semibold text-primary">{formatearPeso(totalReceta)}</span>
              </div>
            )}
          </article>
        </div>
      </div>

      {plantillaAbierta && (
        <NuevaPlantillaDialog
          onClose={() => setPlantillaAbierta(false)}
          onCreada={onCrearPlantilla}
        />
      )}
    </div>
  );
}