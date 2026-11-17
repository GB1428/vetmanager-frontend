"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SelectOpciones } from "@/components/shared/select-opciones";
import { CATEGORIAS_EXAMEN } from "@/lib/constants";
import type { CategoriaExamen, Paciente } from "@/lib/types";

export function SubirExamenDialog({
  archivos,
  pacientes,
  onClose,
  onConfirmar,
}: {
  archivos: File[];
  pacientes: Paciente[];
  onClose: () => void;
  // devuelve un mensaje de error, o null si todo salio bien
  onConfirmar: (datos: { pacienteId: string; categoria: CategoriaExamen }) => Promise<string | null>;
}) {
  const [pacienteId, setPacienteId] = useState("");
  const [categoria, setCategoria] = useState<string>("general");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pacienteId) {
      setError("Selecciona un paciente.");
      return;
    }
    setSubiendo(true);
    setError(null);
    const mensaje = await onConfirmar({ pacienteId, categoria: categoria as CategoriaExamen });
    setSubiendo(false);
    if (mensaje) setError(mensaje);
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !subiendo && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir examen</DialogTitle>
          <DialogDescription>Indica a qué paciente y tipo de examen corresponden los archivos.</DialogDescription>
        </DialogHeader>

        <ul className="max-h-32 space-y-1 overflow-y-auto rounded-xl bg-secondary/50 p-3 text-xs">
          {archivos.map((a, i) => (
            <li key={`${a.name}-${i}`} className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{a.name}</span>
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="examen-paciente">Paciente *</Label>
            <SelectOpciones
              id="examen-paciente"
              value={pacienteId}
              onValueChange={setPacienteId}
              opciones={pacientes.map((p) => ({ value: p.id, label: `${p.nombre} (${p.duenoNombre})` }))}
              placeholder="Selecciona un paciente"
              disabled={pacientes.length === 0 || subiendo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="examen-categoria">Tipo de examen</Label>
            <SelectOpciones
              id="examen-categoria"
              value={categoria}
              onValueChange={setCategoria}
              opciones={CATEGORIAS_EXAMEN}
              disabled={subiendo}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Las imágenes JPG y PNG se convierten a WebP para ocupar menos espacio.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={onClose} disabled={subiendo}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full" disabled={subiendo}>
              {subiendo && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {subiendo ? "Subiendo..." : "Subir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
