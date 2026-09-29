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
import { actualizarDueno } from "@/lib/api";
import { logError, logInfo } from "@/lib/logger";
import { mensajeParaUsuario } from "@/lib/errors";
import type { Dueno } from "@/lib/types";

export function EditarDuenoDialog({
  dueno,
  onClose,
  onGuardado,
}: {
  dueno: Dueno;
  onClose: () => void;
  onGuardado: (actualizado: Dueno) => void;
}) {
  const [nombre, setNombre] = useState(dueno.nombre);
  const [rut, setRut] = useState(dueno.rut);
  const [telefono, setTelefono] = useState(dueno.telefono);
  const [correo, setCorreo] = useState(dueno.correo ?? "");
  const [direccion, setDireccion] = useState(dueno.direccion ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cambios: Parameters<typeof actualizarDueno>[1] = {};
    if (nombre.trim() !== dueno.nombre) cambios.nombre = nombre.trim();
    if (rut.trim() !== dueno.rut) cambios.rut = rut.trim();
    if (telefono.trim() !== dueno.telefono) cambios.telefono = telefono.trim();
    if (correo.trim() !== (dueno.correo ?? "")) cambios.correo = correo.trim();
    if (direccion.trim() !== (dueno.direccion ?? "")) cambios.direccion = direccion.trim();

    if (Object.keys(cambios).length === 0) {
      logInfo("Edición de dueño: sin cambios, no se llama al backend", { id: dueno.id });
      setError("No hay cambios para guardar.");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      await actualizarDueno(dueno.id, cambios);
      logInfo("Dueño actualizado", { id: dueno.id, cambios });
      onGuardado({
        ...dueno,
        nombre: nombre.trim(),
        rut: rut.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        direccion: direccion.trim(),
      });
      onClose();
    } catch (err) {
      logError("Error al actualizar el dueño", err, { id: dueno.id, cambios });
      setError(mensajeParaUsuario(err, "No se pudo actualizar el dueño."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar dueño</DialogTitle>
          <DialogDescription>Actualiza los datos de contacto del tutor responsable.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editar-dueno-nombre">Nombre completo *</Label>
            <Input
              id="editar-dueno-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editar-dueno-rut">RUT *</Label>
              <Input
                id="editar-dueno-rut"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                pattern="\d{1,2}\.\d{3}\.\d{3}-[\dkK]"
                title="Formato: 18.492.831-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-dueno-telefono">Teléfono *</Label>
              <Input
                id="editar-dueno-telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editar-dueno-correo">Correo electrónico *</Label>
            <Input
              id="editar-dueno-correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editar-dueno-direccion">Dirección *</Label>
            <Input
              id="editar-dueno-direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
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
              Guardar cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
