"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SelectOpciones } from "@/components/shared/select-opciones";
import { ESTADOS_CITA, resolverOpcion } from "@/lib/constants";
import { actualizarCita } from "@/lib/api";
import { logError, logInfo } from "@/lib/logger";
import { mensajeParaUsuario } from "@/lib/errors";
import type { Cita } from "@/lib/types";

export function EditarCitaDialog({
  cita,
  onClose,
  onGuardada,
}: {
  cita: Cita;
  onClose: () => void;
  onGuardada: (actualizada: Cita) => void;
}) {
  const estadoInicial = resolverOpcion(ESTADOS_CITA, cita.estado);

  const [estado, setEstado] = useState(estadoInicial);
  const [motivo, setMotivo] = useState(cita.motivo);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cambios: { estado?: string; motivo?: string } = {};
    if (estado && estado !== estadoInicial) cambios.estado = estado;
    if (motivo.trim() !== cita.motivo) cambios.motivo = motivo.trim();

    if (Object.keys(cambios).length === 0) {
      logInfo("Edición de cita: sin cambios, no se llama al backend", { id: cita.id });
      setError("No hay cambios para guardar.");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      await actualizarCita(cita.id, cambios);
      logInfo("Cita actualizada", { id: cita.id, cambios });
      onGuardada({ ...cita, estado: estado || cita.estado, motivo: motivo.trim() });
      onClose();
    } catch (err) {
      logError("Error al actualizar la cita", err, { id: cita.id, cambios });
      setError(mensajeParaUsuario(err, "No se pudo actualizar la cita."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cita</DialogTitle>
          <DialogDescription>
            {cita.fecha} {cita.hora} · {cita.mascotaNombre}
            {cita.duenoNombre ? ` · ${cita.duenoNombre}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editar-cita-estado">Estado</Label>
            <SelectOpciones
              id="editar-cita-estado"
              value={estado}
              onValueChange={setEstado}
              opciones={ESTADOS_CITA}
              placeholder="Selecciona un estado"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editar-cita-motivo">Motivo de la consulta</Label>
            <Textarea
              id="editar-cita-motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="min-h-[90px]"
            />
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
