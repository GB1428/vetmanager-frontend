"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { actualizarRegistroVacuna } from "@/lib/api";
import { OBSERVACION_VACIA } from "@/lib/constants";
import { fechaLocalDeInstante, formatearInstanteCorto, soloFecha } from "@/lib/fechas";
import { logError, logInfo } from "@/lib/logger";
import { mensajeParaUsuario } from "@/lib/errors";
import type { RegistroVacuna } from "@/lib/types";

export function EditarRegistroDialog({
  registro,
  onClose,
  onGuardado,
}: {
  registro: RegistroVacuna;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const proximaInicial = soloFecha(registro.proximaDosis);

  const [lote, setLote] = useState(registro.lote);
  const [proxima, setProxima] = useState(proximaInicial);
  const [observaciones, setObservaciones] = useState(
    registro.observaciones === OBSERVACION_VACIA ? "" : registro.observaciones,
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!lote.trim() || !proxima) {
      setError("Completa el lote y la próxima dosis.");
      return;
    }
    if (proxima < fechaLocalDeInstante(registro.fechaAplicacion)) {
      setError("La próxima dosis no puede ser anterior a la aplicación.");
      return;
    }

    const obsFinal = observaciones.trim() || OBSERVACION_VACIA;
    if (
      lote.trim() === registro.lote &&
      proxima === proximaInicial &&
      obsFinal === registro.observaciones
    ) {
      setError("No hay cambios para guardar.");
      return;
    }

    setGuardando(true);
    setError(null);

    const datos = { lote: lote.trim(), proximaDosis: proxima, observaciones: obsFinal };

    try {
      await actualizarRegistroVacuna(registro.id, datos);
      logInfo("Registro de vacuna actualizado", { id: registro.id, datos });
      onGuardado();
      onClose();
    } catch (err) {
      logError("Error al actualizar el registro de vacuna", err, { id: registro.id, ...datos });
      setError(mensajeParaUsuario(err, "No se pudo actualizar el registro."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar vacuna</DialogTitle>
          <DialogDescription>
            {registro.vacunaNombre} · aplicada el {formatearInstanteCorto(registro.fechaAplicacion)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editar-vacuna-lote">Lote *</Label>
              <Input
                id="editar-vacuna-lote"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-vacuna-proxima">Próxima dosis *</Label>
              <Input
                id="editar-vacuna-proxima"
                type="date"
                value={proxima}
                onChange={(e) => setProxima(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="editar-vacuna-obs">Observaciones</Label>
              <Textarea
                id="editar-vacuna-obs"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full" disabled={guardando}>
              {guardando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
