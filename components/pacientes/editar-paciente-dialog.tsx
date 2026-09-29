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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectOpciones } from "@/components/shared/select-opciones";
import { ESPECIES, SEXOS, resolverOpcion } from "@/lib/constants";
import { actualizarPaciente, buscarReferenciasMascota } from "@/lib/api";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { mensajeParaUsuario } from "@/lib/errors";
import type { Dueno, Paciente } from "@/lib/types";

export function EditarPacienteDialog({
  paciente,
  duenos,
  onClose,
  onGuardado,
}: {
  paciente: Paciente;
  duenos: Dueno[];
  onClose: () => void;
  onGuardado: (actualizado: Paciente) => void;
}) {
  const especieInicial = resolverOpcion(ESPECIES, paciente.especie);
  const sexoInicial = resolverOpcion(SEXOS, paciente.sexo);
  const nacimientoInicial = paciente.fechaNacimiento?.slice(0, 10) ?? "";

  const [nombre, setNombre] = useState(paciente.nombre);
  const [especie, setEspecie] = useState(especieInicial);
  const [raza, setRaza] = useState(paciente.raza);
  const [sexo, setSexo] = useState(sexoInicial);
  const [nacimiento, setNacimiento] = useState(nacimientoInicial);
  const [peso, setPeso] = useState(paciente.pesoKg != null ? String(paciente.pesoKg) : "");
  const [microchip, setMicrochip] = useState(paciente.microchip ?? "");
  const [duenoId, setDuenoId] = useState(paciente.duenoId ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const pesoNumero = Number(peso);
    if (!peso || Number.isNaN(pesoNumero) || pesoNumero < 0) {
      logWarn("Edición de paciente: peso inválido", { peso });
      setError("Ingresa un peso válido.");
      return;
    }
    if (microchip.trim() && !/^\d+$/.test(microchip.trim())) {
      logWarn("Edición de paciente: microchip inválido", { microchip });
      setError("El microchip solo puede contener números.");
      return;
    }
    if (paciente.raza && !raza.trim()) {
      setError("La raza no puede quedar vacía.");
      return;
    }

    const cambios: Parameters<typeof actualizarPaciente>[1] = {};
    if (nombre.trim() !== paciente.nombre) cambios.nombre = nombre.trim();
    if (sexo && sexo !== sexoInicial) cambios.sexo = sexo;
    if (nacimiento !== nacimientoInicial) cambios.fechaNacimiento = nacimiento || null;
    if (pesoNumero !== paciente.pesoKg) cambios.pesoKg = pesoNumero;
    if (microchip.trim() !== (paciente.microchip ?? "")) {
      cambios.microchip = microchip.trim() ? Number(microchip.trim()) : null;
    }
    if (duenoId && duenoId !== paciente.duenoId) cambios.idDueno = Number(duenoId);

    const cambioEspecie = !!especie && especie !== especieInicial;
    const cambioRaza = raza.trim() !== paciente.raza;

    if (Object.keys(cambios).length === 0 && !cambioEspecie && !cambioRaza) {
      logInfo("Edición de paciente: sin cambios, no se llama al backend", { id: paciente.id });
      setError("No hay cambios para guardar.");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      if (cambioEspecie || cambioRaza) {
        const referencias = await buscarReferenciasMascota(especie, raza.trim());
        cambios.especie = especie;
        cambios.raza = raza.trim();
        cambios.idEspecie = referencias.idEspecie;
        cambios.idRaza = referencias.idRaza;
      }

      await actualizarPaciente(paciente.id, cambios);
      logInfo("Paciente actualizado", { id: paciente.id, cambios });

      const nuevoDueno = duenos.find((d) => d.id === duenoId);
      onGuardado({
        ...paciente,
        nombre: nombre.trim(),
        especie: especie || paciente.especie,
        raza: raza.trim(),
        sexo: sexo || paciente.sexo,
        fechaNacimiento: nacimiento || undefined,
        pesoKg: pesoNumero,
        microchip: microchip.trim() || undefined,
        duenoId: duenoId || paciente.duenoId,
        duenoNombre: nuevoDueno?.nombre ?? paciente.duenoNombre,
      });
      onClose();
    } catch (err) {
      logError("Error al actualizar el paciente", err, { id: paciente.id, cambios });
      setError(mensajeParaUsuario(err, "No se pudo actualizar el paciente."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
          <DialogDescription>Actualiza los datos de {paciente.nombre}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editar-paciente-nombre">Nombre de la mascota *</Label>
              <Input
                id="editar-paciente-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-paciente-especie">Especie</Label>
              <SelectOpciones
                id="editar-paciente-especie"
                value={especie}
                onValueChange={setEspecie}
                opciones={ESPECIES}
                placeholder="Selecciona una especie"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-paciente-raza">Raza</Label>
              <Input id="editar-paciente-raza" value={raza} onChange={(e) => setRaza(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-paciente-sexo">Sexo y esterilización</Label>
              <SelectOpciones
                id="editar-paciente-sexo"
                value={sexo}
                onValueChange={setSexo}
                opciones={SEXOS}
                placeholder="Selecciona una opción"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-paciente-nacimiento">Fecha de nacimiento (aprox.)</Label>
              <Input
                id="editar-paciente-nacimiento"
                type="date"
                value={nacimiento}
                onChange={(e) => setNacimiento(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-paciente-peso">Peso (Kg) *</Label>
              <Input
                id="editar-paciente-peso"
                type="number"
                step="0.1"
                min="0"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-paciente-microchip">Número de microchip</Label>
              <Input
                id="editar-paciente-microchip"
                type="number"
                value={microchip}
                onChange={(e) => setMicrochip(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tutor</Label>
              {duenos.length > 0 ? (
                <Select value={duenoId} onValueChange={setDuenoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {duenos.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nombre} · RUT {d.rut}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex h-10 w-full items-center rounded-lg border border-dashed border-input bg-secondary/30 px-3 text-sm text-muted-foreground">
                  {paciente.duenoNombre || "Sin tutor"}
                </div>
              )}
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
