"use client";

import { useState } from "react";

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
import { SelectOpciones } from "@/components/shared/select-opciones";
import { UNIDADES_DURACION } from "@/lib/constants";
import type { PlantillaReceta } from "@/lib/types";

export function NuevaPlantillaDialog({
  onClose,
  onCreada,
}: {
  onClose: () => void;
  onCreada: (plantilla: PlantillaReceta) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [dosis, setDosis] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [duracion, setDuracion] = useState("");
  const [unidadDuracion, setUnidadDuracion] = useState("Días");
  const [instrucciones, setInstrucciones] = useState("");
  const [precio, setPrecio] = useState("");
  const [antiparasitario, setAntiparasitario] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nombre.trim()) {
      setError("Ingresa el nombre del medicamento.");
      return;
    }
    const precioNumero = Number(precio);
    if (precio === "" || !Number.isInteger(precioNumero) || precioNumero < 0) {
      setError("Ingresa un precio válido (número entero).");
      return;
    }

    onCreada({
      id: `${Date.now()}`,
      nombre: nombre.trim(),
      dosis: dosis.trim(),
      frecuencia: frecuencia.trim(),
      duracion: duracion.trim(),
      unidadDuracion,
      instrucciones: instrucciones.trim(),
      precio: precioNumero,
      antiparasitario,
    });
    onClose();
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva receta guardada</DialogTitle>
          <DialogDescription>Crea un medicamento o tratamiento para reutilizarlo en tus recetas.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plantilla-nombre">Medicamento o principio activo *</Label>
            <Input
              id="plantilla-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Amoxicilina + Ácido Clavulánico 250mg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plantilla-dosis">Dosis</Label>
              <Input
                id="plantilla-dosis"
                value={dosis}
                onChange={(e) => setDosis(e.target.value)}
                placeholder="Ej. 1 tableta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plantilla-frecuencia">Frecuencia</Label>
              <Input
                id="plantilla-frecuencia"
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
                placeholder="Ej. Cada 12 horas"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plantilla-duracion">Duración del tratamiento</Label>
              <Input
                id="plantilla-duracion"
                type="number"
                min="1"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                placeholder="Ej. 7"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plantilla-unidad">Unidad</Label>
              <SelectOpciones
                id="plantilla-unidad"
                value={unidadDuracion}
                onValueChange={setUnidadDuracion}
                opciones={UNIDADES_DURACION}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plantilla-instrucciones">Instrucciones adicionales</Label>
            <Textarea
              id="plantilla-instrucciones"
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
              placeholder="Ej. Administrar junto con las comidas para evitar malestar estomacal."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plantilla-precio">Precio *</Label>
            <Input
              id="plantilla-precio"
              type="number"
              min="0"
              step="1"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="Ej. 8000"
              required
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-secondary/50 px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={antiparasitario}
              onChange={(e) => setAntiparasitario(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span>
              <span className="font-medium">Es antiparasitario</span>
              <span className="block text-xs text-muted-foreground">Quedará marcado para generar su recordatorio.</span>
            </span>
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full">
              Guardar receta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
