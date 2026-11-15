"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RotateCcw, Syringe, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectOpciones } from "@/components/shared/select-opciones";
import { ESTADOS_PAGO, ESTADO_PAGO_INICIAL, METODOS_PAGO } from "@/lib/constants";
import { crearBoleta, listarHistorialVacunas } from "@/lib/api";
import { fechaLocalDeInstante, formatearFechaCorta, hoyLocalISO } from "@/lib/fechas";
import { mensajeParaUsuario } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logger";
import { formatearPeso } from "@/lib/utils";
import type { Boleta, Cita, Dueno, ItemBoleta, Paciente, RegistroVacuna } from "@/lib/types";

function precioNumero(valor: string): number {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function incluirPorDefecto(r: RegistroVacuna, fechaReferencia: string): boolean {
  return fechaLocalDeInstante(r.fechaAplicacion) === fechaReferencia;
}

export function NuevaBoletaDialog({
  duenos,
  pacientes,
  citas,
  onClose,
  onCreada,
}: {
  duenos: Dueno[];
  pacientes: Paciente[];
  citas: Cita[];
  onClose: () => void;
  onCreada: (boleta: Boleta) => void;
}) {
  const [duenoId, setDuenoId] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [citaId, setCitaId] = useState("");
  const [items, setItems] = useState<ItemBoleta[]>([]);
  const [registros, setRegistros] = useState<RegistroVacuna[]>([]);
  const [cargandoVacunas, setCargandoVacunas] = useState(false);
  const [totalManual, setTotalManual] = useState<string | null>(null);
  const [estadoPago, setEstadoPago] = useState(ESTADO_PAGO_INICIAL);
  const [metodoPago, setMetodoPago] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mascotasDelDueno = useMemo(() => pacientes.filter((p) => p.duenoId === duenoId), [pacientes, duenoId]);
  const citasDeLaMascota = useMemo(() => citas.filter((c) => c.mascotaId === pacienteId), [citas, pacienteId]);
  const citaSeleccionada = citasDeLaMascota.find((c) => c.id === citaId);

  const totalCalculado = useMemo(
    () => items.filter((i) => i.incluido).reduce((acc, i) => acc + precioNumero(i.precio), 0),
    [items],
  );
  const totalMostrado = totalManual ?? String(totalCalculado);

  useEffect(() => {
    if (!pacienteId) {
      setRegistros([]);
      setItems([]);
      return;
    }
    let activo = true;
    setCargandoVacunas(true);
    listarHistorialVacunas(pacienteId)
      .then((lista) => {
        if (!activo) return;
        setRegistros(lista);
        setItems((prev) => [
          ...lista.map<ItemBoleta>((r) => ({
            uid: `vacuna-${r.id}`,
            concepto: `${r.vacunaNombre} · aplicada el ${formatearFechaCorta(fechaLocalDeInstante(r.fechaAplicacion))}`,
            precio: String(r.precio),
            incluido: incluirPorDefecto(r, hoyLocalISO()),
            origen: "vacuna",
          })),
          ...prev.filter((i) => i.origen === "manual"),
        ]);
      })
      .catch((err) => {
        logError("no se pudieron cargar las vacunas de la mascota para la boleta", err, { idMascota: pacienteId });
        if (!activo) return;
        setRegistros([]);
        setError(mensajeParaUsuario(err, "no pudimos traer las vacunas de la mascota, igual puedes agregar los cobros a mano"));
      })
      .finally(() => {
        if (activo) setCargandoVacunas(false);
      });
    return () => {
      activo = false;
    };
  }, [pacienteId]);

  function cambiarDueno(id: string) {
    setDuenoId(id);
    setPacienteId("");
    setCitaId("");
    setItems([]);
    setTotalManual(null);
    setError(null);
  }

  function cambiarPaciente(id: string) {
    setPacienteId(id);
    setCitaId("");
    setItems([]);
    setTotalManual(null);
    setError(null);
  }

  function cambiarCita(id: string) {
    setCitaId(id);
    const cita = citasDeLaMascota.find((c) => c.id === id);
    const referencia = cita ? cita.fecha : hoyLocalISO();
    setItems((prev) =>
      prev.map((i) => {
        if (i.origen !== "vacuna") return i;
        const registro = registros.find((r) => `vacuna-${r.id}` === i.uid);
        return registro ? { ...i, incluido: incluirPorDefecto(registro, referencia) } : i;
      }),
    );
    setTotalManual(null);
  }

  function actualizarItem(uid: string, cambios: Partial<ItemBoleta>) {
    setItems((prev) => prev.map((i) => (i.uid === uid ? { ...i, ...cambios } : i)));
    setTotalManual(null);
  }

  function agregarManual() {
    setItems((prev) => [
      ...prev,
      { uid: `manual-${Date.now()}`, concepto: "", precio: "", incluido: true, origen: "manual" },
    ]);
  }

  function quitarItem(uid: string) {
    setItems((prev) => prev.filter((i) => i.uid !== uid));
    setTotalManual(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const dueno = duenos.find((d) => d.id === duenoId);
    const paciente = pacientes.find((p) => p.id === pacienteId);

    if (!dueno) {
      setError("Selecciona un dueño.");
      return;
    }
    if (!paciente) {
      setError("Selecciona una mascota.");
      return;
    }
    const monto = Number(totalMostrado);
    if (totalMostrado === "" || !Number.isInteger(monto) || monto < 0) {
      setError("Ingresa un monto total válido (número entero).");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const creada = await crearBoleta({
        idDueno: Number(dueno.id),
        idMascota: Number(paciente.id),
        idCita: citaSeleccionada ? Number(citaSeleccionada.id) : undefined,
        montoTotal: monto,
        estadoPago: estadoPago.trim() || undefined,
        metodoPago: metodoPago.trim() || undefined,
      });
      logInfo("boleta creada", { idBoleta: creada.idBoleta, monto });

      onCreada({
        ...creada,
        idMascota: Number(paciente.id),
        duenoNombre: creada.duenoNombre !== "—" ? creada.duenoNombre : dueno.nombre,
        pacienteNombre: creada.pacienteNombre !== "—" ? creada.pacienteNombre : paciente.nombre,
      });
      onClose();
    } catch (err) {
      logError("no se pudo guardar la boleta", err, { idDueno: dueno.id, monto });
      setError(mensajeParaUsuario(err, "no se pudo guardar la boleta, intenta de nuevo"));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nueva Boleta</DialogTitle>
          <DialogDescription>
            Elige dueño y mascota: los cobros de sus vacunas se cargan solos y puedes ajustarlos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Dueño *</Label>
            {duenos.length > 0 ? (
              <Select value={duenoId} onValueChange={cambiarDueno}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un dueño" />
                </SelectTrigger>
                <SelectContent>
                  {duenos.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex h-10 w-full items-center rounded-lg border border-dashed border-input bg-secondary/30 px-3 text-sm text-muted-foreground">
                No hay dueños registrados
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mascota *</Label>
            <Select value={pacienteId} onValueChange={cambiarPaciente} disabled={!duenoId || mascotasDelDueno.length === 0}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !duenoId
                      ? "Selecciona primero un dueño"
                      : mascotasDelDueno.length === 0
                      ? "Este dueño no tiene mascotas"
                      : "Selecciona una mascota"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {mascotasDelDueno.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cita asociada (opcional)</Label>
            <Select value={citaId} onValueChange={cambiarCita} disabled={!pacienteId || citasDeLaMascota.length === 0}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !pacienteId
                      ? "Selecciona primero una mascota"
                      : citasDeLaMascota.length === 0
                      ? "Esta mascota no tiene citas"
                      : "Sin cita asociada"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {citasDeLaMascota.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fecha} {c.hora} · {c.motivo || "Sin motivo"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {pacienteId && (
            <div className="space-y-3 rounded-2xl border bg-secondary/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Detalle del cobro</p>
                <button
                  type="button"
                  onClick={agregarManual}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Agregar concepto
                </button>
              </div>

              {cargandoVacunas ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Cargando vacunas...
                </p>
              ) : items.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Esta mascota no tiene vacunas registradas. Agrega un concepto para cobrar.
                </p>
              ) : (
                <ul className="space-y-2">
                  {items.map((i) => (
                    <li key={i.uid} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={i.incluido}
                        onChange={(e) => actualizarItem(i.uid, { incluido: e.target.checked })}
                        className="h-4 w-4 shrink-0 accent-primary"
                        aria-label="Incluir en la boleta"
                      />
                      {i.origen === "vacuna" ? (
                        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-xs">
                          <Syringe className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="truncate">{i.concepto}</span>
                        </span>
                      ) : (
                        <Input
                          value={i.concepto}
                          onChange={(e) => actualizarItem(i.uid, { concepto: e.target.value })}
                          placeholder="Concepto (ej. Consulta)"
                          className="h-8 min-w-0 flex-1 text-xs"
                        />
                      )}
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={i.precio}
                        onChange={(e) => actualizarItem(i.uid, { precio: e.target.value })}
                        placeholder="0"
                        className="h-8 w-24 shrink-0 text-xs"
                        aria-label="Precio"
                      />
                      {i.origen === "manual" && (
                        <button
                          type="button"
                          onClick={() => quitarItem(i.uid)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Quitar concepto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-muted-foreground">
                Se marcan las vacunas aplicadas {citaSeleccionada ? "el día de la cita" : "hoy"}. Puedes marcar otras o
                cambiar cualquier precio.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="boleta-monto">Monto Total *</Label>
              {totalManual !== null && (
                <button
                  type="button"
                  onClick={() => setTotalManual(null)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  Recalcular ({formatearPeso(totalCalculado)})
                </button>
              )}
            </div>
            <Input
              id="boleta-monto"
              type="number"
              min="0"
              step="1"
              placeholder="Ej: 45000"
              value={totalMostrado}
              onChange={(e) => setTotalManual(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="boleta-estado">Estado de Pago</Label>
              <SelectOpciones
                id="boleta-estado"
                value={estadoPago}
                onValueChange={setEstadoPago}
                opciones={ESTADOS_PAGO}
                placeholder="Selecciona un estado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boleta-metodo">Método de Pago</Label>
              <SelectOpciones
                id="boleta-metodo"
                value={metodoPago}
                onValueChange={setMetodoPago}
                opciones={METODOS_PAGO}
                placeholder="Selecciona un método"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full rounded-full" disabled={guardando}>
            {guardando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Guardar Boleta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
