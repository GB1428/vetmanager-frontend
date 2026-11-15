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
import { ESPECIES, SEXOS } from "@/lib/constants";
import { buscarIdEspecie, crearPaciente, eliminarSolicitud, listarDuenos } from "@/lib/api";
import { mensajeParaUsuario } from "@/lib/errors";
import { logError } from "@/lib/logger";
import type { Solicitud } from "@/lib/types";

export function AceptarSolicitudDialog({
  solicitud,
  onClose,
  onAceptada,
}: {
  solicitud: Solicitud;
  onClose: () => void;
  onAceptada: (id: string) => void;
}) {
  const [nombre, setNombre] = useState(solicitud.mascota);
  const [especie, setEspecie] = useState("perro");
  const [sexo, setSexo] = useState("macho");
  const [peso, setPeso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const pesoNumero = Number(peso);
    if (!nombre.trim()) {
      setError("Ponle un nombre a la mascota.");
      return;
    }
    if (peso === "" || Number.isNaN(pesoNumero) || pesoNumero < 0) {
      setError("Ingresa un peso válido en kilos.");
      return;
    }

    setGuardando(true);
    setError(null);

    let mascotaCreada = false;
    try {
      let duenoId = solicitud.duenoId;
      if (!duenoId) {
        const duenos = await listarDuenos();
        duenoId = duenos.find((d) => d.rut === solicitud.rut)?.id;
      }
      if (!duenoId) {
        throw new Error("no encontré al dueño de esta solicitud en el sistema");
      }

      const idEspecie = await buscarIdEspecie(especie);
      await crearPaciente({
        nombre: nombre.trim(),
        especie,
        idEspecie,
        sexo,
        pesoKg: pesoNumero,
        idDueno: Number(duenoId),
      });
      mascotaCreada = true;

      await eliminarSolicitud(solicitud.id);
      onAceptada(solicitud.id);
      onClose();
    } catch (err) {
      logError("no se pudo aceptar la solicitud", err, { idSolicitud: solicitud.id });
      setError(
        mascotaCreada
          ? "la mascota quedó guardada, pero no pudimos quitar la solicitud de la lista, puedes borrarla a mano"
          : mensajeParaUsuario(err, "no se pudo guardar la mascota, intenta de nuevo"),
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aceptar solicitud</DialogTitle>
          <DialogDescription>
            Vamos a guardar a {solicitud.nombreDueno} y a su mascota en el sistema. Completa lo que falta de la
            mascota.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aceptar-nombre">Nombre de la mascota *</Label>
            <Input id="aceptar-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aceptar-especie">Especie *</Label>
              <SelectOpciones id="aceptar-especie" value={especie} onValueChange={setEspecie} opciones={ESPECIES} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aceptar-peso">Peso (kg) *</Label>
              <Input
                id="aceptar-peso"
                type="number"
                min="0"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ej: 8.5"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aceptar-sexo">Sexo y esterilización *</Label>
            <SelectOpciones id="aceptar-sexo" value={sexo} onValueChange={setSexo} opciones={SEXOS} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full" disabled={guardando}>
              {guardando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Aceptar solicitud
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
