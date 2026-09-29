"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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
import { SelectOpciones } from "@/components/shared/select-opciones";
import { ESTADOS_PAGO, METODOS_PAGO, resolverOpcion } from "@/lib/constants";
import { actualizarBoleta } from "@/lib/api";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { mensajeParaUsuario } from "@/lib/errors";
import type { Boleta } from "@/lib/types";

export function EditarBoletaDialog({
  boleta,
  onClose,
  onGuardada,
}: {
  boleta: Boleta;
  onClose: () => void;
  onGuardada: (actualizada: Boleta) => void;
}) {
  const estadoInicial = resolverOpcion(ESTADOS_PAGO, boleta.estadoPago);
  const metodoInicial = resolverOpcion(METODOS_PAGO, boleta.metodoPago);

  const [estadoPago, setEstadoPago] = useState(estadoInicial);
  const [metodoPago, setMetodoPago] = useState(metodoInicial);
  const [montoTotal, setMontoTotal] = useState(String(boleta.montoTotal));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const montoNumero = Number(montoTotal);
    if (!montoTotal || Number.isNaN(montoNumero) || montoNumero < 0) {
      logWarn("Edición de boleta: monto inválido", { montoTotal });
      setError("Ingresa un monto total válido.");
      return;
    }

    const cambios: { montoTotal?: number; estadoPago?: string; metodoPago?: string } = {};
    if (montoNumero !== boleta.montoTotal) cambios.montoTotal = montoNumero;
    if (estadoPago && estadoPago !== estadoInicial) cambios.estadoPago = estadoPago;
    if (metodoPago && metodoPago !== metodoInicial) cambios.metodoPago = metodoPago;

    if (Object.keys(cambios).length === 0) {
      logInfo("Edición de boleta: sin cambios, no se llama al backend", { idBoleta: boleta.idBoleta });
      setError("No hay cambios para guardar.");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      await actualizarBoleta(boleta.idBoleta, cambios);
      logInfo("Boleta actualizada", { idBoleta: boleta.idBoleta, cambios });
      onGuardada({
        ...boleta,
        montoTotal: montoNumero,
        estadoPago: estadoPago || boleta.estadoPago,
        metodoPago: metodoPago || boleta.metodoPago,
      });
      onClose();
    } catch (err) {
      logError("Error al actualizar la boleta", err, { idBoleta: boleta.idBoleta, cambios });
      setError(mensajeParaUsuario(err, "No se pudo actualizar la boleta."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar boleta {boleta.id}</DialogTitle>
          <DialogDescription>
            {boleta.pacienteNombre ? `${boleta.pacienteNombre} · ` : ""}
            Dueño: {boleta.duenoNombre || "sin datos"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editar-boleta-monto">Monto total *</Label>
            <Input
              id="editar-boleta-monto"
              type="number"
              min="0"
              step="0.01"
              value={montoTotal}
              onChange={(e) => setMontoTotal(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editar-boleta-estado">Estado de pago</Label>
              <SelectOpciones
                id="editar-boleta-estado"
                value={estadoPago}
                onValueChange={setEstadoPago}
                opciones={ESTADOS_PAGO}
                placeholder="Selecciona un estado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-boleta-metodo">Método de pago</Label>
              <SelectOpciones
                id="editar-boleta-metodo"
                value={metodoPago}
                onValueChange={setMetodoPago}
                opciones={METODOS_PAGO}
                placeholder="Selecciona un método"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={onClose}
              disabled={guardando}
            >
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
