"use client";

import { useEffect, useState } from "react";
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
import { SelectOpciones } from "@/components/shared/select-opciones";
import { crearVacuna, listarEspecies } from "@/lib/api";
import type { Opcion } from "@/lib/constants";
import { logError, logInfo } from "@/lib/logger";
import { mensajeParaUsuario } from "@/lib/errors";
import type { Vacuna } from "@/lib/types";

export function NuevaVacunaDialog({
  onClose,
  onCreada,
}: {
  onClose: () => void;
  onCreada: (vacuna: Vacuna) => void;
}) {
  const [especies, setEspecies] = useState<Opcion[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [especieId, setEspecieId] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarEspecies()
      .then((lista) =>
        setEspecies(lista.map((e) => ({ value: String(e.id_especie), label: e.nombre_especie }))),
      )
      .catch((err) => {
        logError("Error al cargar las especies", err);
        setError("No se pudieron cargar las especies.");
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nombre.trim() || !descripcion.trim() || !especieId) {
      setError("Completa nombre, descripción y especie.");
      return;
    }

    setGuardando(true);
    setError(null);

    const datos = { nombre: nombre.trim(), descripcion: descripcion.trim(), idEspecie: Number(especieId) };

    try {
      const creada = await crearVacuna(datos);
      logInfo("Vacuna creada", datos);
      onCreada(creada);
      onClose();
    } catch (err) {
      logError("Error al crear la vacuna", err, datos);
      setError(mensajeParaUsuario(err, "No se pudo crear la vacuna."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva vacuna</DialogTitle>
          <DialogDescription>Agrégala al catálogo para poder registrar dosis.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nueva-vacuna-nombre">Nombre *</Label>
            <Input
              id="nueva-vacuna-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nueva-vacuna-especie">Especie *</Label>
            <SelectOpciones
              id="nueva-vacuna-especie"
              value={especieId}
              onValueChange={setEspecieId}
              opciones={especies}
              placeholder="Selecciona una especie"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nueva-vacuna-desc">Descripción *</Label>
            <Textarea
              id="nueva-vacuna-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full" disabled={guardando}>
              {guardando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Crear vacuna
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
