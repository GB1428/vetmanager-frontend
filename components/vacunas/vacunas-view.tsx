"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, FileText, History, Info, Loader2, PawPrint, Plus, PlusCircle, Save, Syringe } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NuevaVacunaDialog } from "@/components/vacunas/nueva-vacuna-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crearRegistroVacuna, listarHistorialVacunas } from "@/lib/api";
import { OBSERVACION_VACIA, SEXOS, resolverOpcion } from "@/lib/constants";
import { calcularEdad, diasHasta, formatearFechaCorta, formatearInstanteCorto, hoyLocalISO } from "@/lib/fechas";
import { mensajeParaUsuario } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logger";
import { cn } from "@/lib/utils";
import type { Paciente, RegistroVacuna, Vacuna } from "@/lib/types";

const ETIQUETAS_ESPECIE: Record<string, string> = {
  perro: "Canino",
  gato: "Felino",
  caballo: "Equino",
};

function normalizar(valor?: string): string {
  return (valor ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function etiquetaEspecie(especie?: string): string | null {
  if (!especie || especie === "—") return null;
  return ETIQUETAS_ESPECIE[normalizar(especie)] ?? especie;
}

function etiquetaSexo(valor?: string): string {
  if (!valor) return "";
  const v = resolverOpcion(SEXOS, valor);
  const label = SEXOS.find((o) => o.value === v)?.label ?? valor;
  return label.split(" - ")[0];
}

function etiquetaPaciente(p: Paciente): string {
  const detalle = [etiquetaEspecie(p.especie), calcularEdad(p.fechaNacimiento, true)].filter(Boolean).join(", ");
  return `${p.nombre}${detalle ? ` — ${detalle}` : ""} (Tutor: ${p.duenoNombre})`;
}

function textoDias(dias: number): string {
  if (dias === 0) return "hoy";
  const n = Math.abs(dias);
  return `${n} ${n === 1 ? "día" : "días"}`;
}

function calcularAviso(registros: RegistroVacuna[]): { texto: string; tono: "ok" | "vencida" | "vacio" } {
  if (registros.length === 0) {
    return { texto: "Aún no hay vacunas registradas.", tono: "vacio" };
  }
  const dias = registros.map((r) => diasHasta(r.proximaDosis)).filter((d) => !Number.isNaN(d));
  const futuras = dias.filter((d) => d >= 0);
  if (futuras.length > 0) {
    const minimo = Math.min(...futuras);
    return {
      texto: minimo === 0 ? "La próxima dosis es hoy." : `Próxima dosis en ${textoDias(minimo)}.`,
      tono: "ok",
    };
  }
  return { texto: `Próxima dosis vencida hace ${textoDias(Math.max(...dias))}.`, tono: "vencida" };
}

export function VacunasView({
  pacientes,
  vacunas: vacunasIniciales,
  pacienteInicialId,
}: {
  pacientes: Paciente[];
  vacunas: Vacuna[];
  pacienteInicialId?: string;
}) {
  const inicial = pacientes.find((p) => p.id === pacienteInicialId)?.id ?? pacientes[0]?.id ?? "";

  const [pacienteId, setPacienteId] = useState(inicial);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [registros, setRegistros] = useState<RegistroVacuna[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  const [vacunas, setVacunas] = useState(vacunasIniciales);
  const [nuevaAbierta, setNuevaAbierta] = useState(false);
  const [vacunaId, setVacunaId] = useState("");
  const [lote, setLote] = useState("");
  const [proxima, setProxima] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const paciente = pacientes.find((p) => p.id === pacienteId);
  const vacunaSeleccionada = vacunas.find((v) => v.id === vacunaId);
  const especie = etiquetaEspecie(paciente?.especie);

  const vacunasDisponibles = useMemo(() => {
    if (!paciente || !especie) return vacunas;
    const coinciden = vacunas.filter((v) => normalizar(v.especie) === normalizar(paciente.especie));
    return coinciden.length > 0 ? coinciden : vacunas;
  }, [vacunas, paciente, especie]);

  const cargarHistorial = useCallback(async (id: string) => {
    if (!id) return;
    setCargando(true);
    setErrorHistorial(null);
    try {
      setRegistros(await listarHistorialVacunas(id));
    } catch (err) {
      logError("Error al cargar el historial de vacunas", err, { idMascota: id });
      setRegistros([]);
      setErrorHistorial(mensajeParaUsuario(err, "No se pudo cargar el historial de vacunas."));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarHistorial(pacienteId);
  }, [pacienteId, cargarHistorial]);

  function cambiarPaciente(id: string) {
    setPacienteId(id);
    setVacunaId("");
    setLote("");
    setProxima("");
    setObservaciones("");
    setErrorForm(null);
    setExito(false);
  }

  async function handleGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setExito(false);

    if (!paciente) {
      setErrorForm("Selecciona un paciente.");
      return;
    }
    if (!vacunaId) {
      setErrorForm("Selecciona el tipo de vacuna.");
      return;
    }
    if (!lote.trim()) {
      setErrorForm("Ingresa el lote.");
      return;
    }
    if (!proxima) {
      setErrorForm("Ingresa la fecha de la próxima dosis.");
      return;
    }
    if (proxima < hoyLocalISO()) {
      setErrorForm("La próxima dosis no puede ser una fecha pasada.");
      return;
    }

    setGuardando(true);
    setErrorForm(null);

    const datos = {
      idMascota: Number(paciente.id),
      idVacuna: Number(vacunaId),
      lote: lote.trim(),
      proximaDosis: proxima,
      observaciones: observaciones.trim() || OBSERVACION_VACIA,
    };

    try {
      await crearRegistroVacuna(datos);
      logInfo("Dosis registrada", datos);
      setVacunaId("");
      setLote("");
      setProxima("");
      setObservaciones("");
      setExito(true);
      await cargarHistorial(paciente.id);
    } catch (err) {
      logError("Error al registrar la dosis", err, datos);
      setErrorForm(mensajeParaUsuario(err, "No se pudo registrar la dosis."));
      await cargarHistorial(paciente.id);
    } finally {
      setGuardando(false);
    }
  }

  const aviso = calcularAviso(registros);
  const descripcionPaciente = paciente
    ? [etiquetaSexo(paciente.sexo), calcularEdad(paciente.fechaNacimiento, true)].filter(Boolean).join(", ")
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Registro de Vacunas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestiona el historial de inmunización de tus pacientes.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(300px,380px)_1fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Paciente Seleccionado</Label>
              <button
                type="button"
                onClick={() => setSelectorAbierto(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <ArrowLeftRight className="h-3 w-3" />
                Cambiar
              </button>
            </div>

            <Select
              value={pacienteId}
              onValueChange={cambiarPaciente}
              open={selectorAbierto}
              onOpenChange={setSelectorAbierto}
              disabled={pacientes.length === 0}
            >
              <SelectTrigger className="mt-2 h-8 rounded-full bg-secondary/60 px-3 text-xs text-primary">
                <SelectValue placeholder="Selecciona un paciente" />
              </SelectTrigger>
              <SelectContent>
                {pacientes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {etiquetaPaciente(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-4 border-t pt-4">
              {paciente ? (
                <>
                  <div className="flex items-center gap-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-card">
                      <PawPrint className="h-7 w-7" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xl font-medium">{paciente.nombre}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {especie && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                            {especie}
                          </span>
                        )}
                        {descripcionPaciente && (
                          <span className="text-xs text-muted-foreground">{descripcionPaciente}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "mt-5 flex items-center gap-2 rounded-full px-4 py-3 text-xs",
                      aviso.tono === "ok" && "bg-emerald-100 text-emerald-800",
                      aviso.tono === "vencida" && "bg-destructive/10 text-destructive",
                      aviso.tono === "vacio" && "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Info className="h-4 w-4 shrink-0" />
                    {aviso.texto}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No hay pacientes registrados.</p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-medium text-primary">
              <PlusCircle className="h-5 w-5" />
              Registrar Dosis
            </h2>

            <form onSubmit={handleGuardar} className="mt-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vacuna-tipo" className="text-xs font-semibold">
                    Tipo de Vacuna
                  </Label>
                  <button
                    type="button"
                    onClick={() => setNuevaAbierta(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Nueva
                  </button>
                </div>
                <Select value={vacunaId} onValueChange={setVacunaId} disabled={!paciente || guardando}>
                  <SelectTrigger id="vacuna-tipo" className="h-11 rounded-full bg-card px-5">
                    <SelectValue placeholder="Seleccionar vacuna..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vacunasDisponibles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.nombre}
                        {v.especie ? ` (${v.especie})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vacunaSeleccionada?.descripcion && (
                  <p className="px-2 text-xs text-muted-foreground">{vacunaSeleccionada.descripcion}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="vacuna-lote" className="text-xs font-semibold">
                    Lote
                  </Label>
                  <Input
                    id="vacuna-lote"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    placeholder="Ej. L-12345"
                    maxLength={50}
                    disabled={!paciente || guardando}
                    className="h-11 rounded-full px-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vacuna-proxima" className="text-xs font-semibold">
                    Próxima dosis
                  </Label>
                  <Input
                    id="vacuna-proxima"
                    type="date"
                    min={hoyLocalISO()}
                    value={proxima}
                    onChange={(e) => setProxima(e.target.value)}
                    disabled={!paciente || guardando}
                    className="h-11 rounded-full px-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacuna-obs" className="text-xs font-semibold">
                  Observaciones
                </Label>
                <Textarea
                  id="vacuna-obs"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Opcional"
                  rows={2}
                  disabled={!paciente || guardando}
                  className="rounded-2xl px-4"
                />
              </div>

              <p className="px-2 text-xs text-muted-foreground">
                La fecha de aplicación se registra automáticamente con el día de hoy.
              </p>

              {errorForm && <p className="text-sm text-destructive">{errorForm}</p>}
              {exito && <p className="text-sm text-emerald-700">Dosis registrada correctamente.</p>}

              <button
                type="submit"
                disabled={!paciente || guardando}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar Registro
              </button>
            </form>
          </section>
        </div>

        <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
          <div className="border-b pb-4">
            <h2 className="flex items-center gap-3 text-xl font-medium">
              <History className="h-5 w-5 text-primary" />
              Historial de Vacunación
            </h2>
          </div>

          <div className="relative mt-6 min-h-[200px]">
            {cargando ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando historial...
              </p>
            ) : errorHistorial ? (
              <p className="text-sm text-destructive">{errorHistorial}</p>
            ) : registros.length === 0 ? (
              <p className="text-sm text-muted-foreground">Este paciente aún no tiene vacunas registradas.</p>
            ) : (
              <>
                <div className="absolute bottom-4 left-4 top-4 w-px bg-border" />
                <ul className="space-y-5">
                  {registros.map((r) => (
                    <li key={r.id} className="relative flex items-start gap-4">
                      <span className="z-10 mt-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <Syringe className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1 rounded-3xl border bg-secondary/40 px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold">{r.vacunaNombre}</p>
                          <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-[11px] text-muted-foreground">
                            {formatearInstanteCorto(r.fechaAplicacion)}
                          </span>
                        </div>
                        {r.vacunaDescripcion && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{r.vacunaDescripcion}</p>
                        )}
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          Lote: <span className="font-bold text-foreground">{r.lote}</span> • Próxima dosis:{" "}
                          {formatearFechaCorta(r.proximaDosis)}
                        </p>
                        {r.observaciones && r.observaciones !== OBSERVACION_VACIA && (
                          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                            <FileText className="mt-0.5 h-3 w-3 shrink-0" />
                            {r.observaciones}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      </div>

      {nuevaAbierta && (
        <NuevaVacunaDialog
          onClose={() => setNuevaAbierta(false)}
          onCreada={(v) => {
            setVacunas((prev) => [...prev, v]);
            setVacunaId(v.id);
          }}
        />
      )}
    </div>
  );
}
