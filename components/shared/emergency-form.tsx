"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { crearSolicitud } from "@/lib/api";

type Datos = Record<string, string>;

const CLAVE_BORRADOR = "emergencia:borrador";
const CLAVE_REABRIR = "emergencia:reabrir";
const CLAVE_TERMINOS = "emergencia:acepto:terminos";
const CLAVE_PRIVACIDAD = "emergencia:acepto:privacidad";

function limpiarSesion() {
  try {
    [CLAVE_BORRADOR, CLAVE_REABRIR, CLAVE_TERMINOS, CLAVE_PRIVACIDAD].forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}

export function EmergencyForm() {
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borrador, setBorrador] = useState<Datos>({});
  const [restaurado, setRestaurado] = useState(false);
  const [datosPendientes, setDatosPendientes] = useState<Datos | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem(CLAVE_BORRADOR);
      if (guardado) {
        const datos = JSON.parse(guardado) as Datos;
        setBorrador(datos);

        if (sessionStorage.getItem(CLAVE_REABRIR) === "1") {
          setDatosPendientes(datos);
          setAceptaTerminos(sessionStorage.getItem(CLAVE_TERMINOS) === "1");
          setAceptaPrivacidad(sessionStorage.getItem(CLAVE_PRIVACIDAD) === "1");
          setModalAbierto(true);
        }
      }
      sessionStorage.removeItem(CLAVE_REABRIR);
    } catch {}
    setRestaurado(true);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.currentTarget)) as Datos;

    setError(null);
    setDatosPendientes(datos);
    setModalAbierto(true);
  }

  function guardarBorrador() {
    if (!datosPendientes) return;
    try {
      sessionStorage.setItem(CLAVE_BORRADOR, JSON.stringify(datosPendientes));
      sessionStorage.setItem(CLAVE_TERMINOS, aceptaTerminos ? "1" : "0");
      sessionStorage.setItem(CLAVE_PRIVACIDAD, aceptaPrivacidad ? "1" : "0");
    } catch {}
  }

  async function enviar(datos: Datos) {
    setEnviando(true);
    setError(null);
    try {
      await crearSolicitud({
        nombreDueno: datos.nombre,
        rut: datos.rut,
        mascota: datos.mascota,
        telefono: datos.telefono,
        correo: datos.correo,
        direccion: datos.direccion,
        motivo: datos.motivo,
        aceptado:aceptaTerminos&&aceptaPrivacidad
      });
      setEnviado(true);
      setModalAbierto(false);
      limpiarSesion();
    } catch (err) {
  console.error("Error al enviar la solicitud:", err);

  if (err instanceof Error) {
    console.error("Detalle del backend:", err.message);
  }

  setError(
    err instanceof Error
      ? err.message
      : "No se pudo enviar la solicitud.",
  );
  setModalAbierto(false);
} finally {
  setEnviando(false);
}
  }

  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-primary" />
      <CardHeader>
        <CardTitle className="font-display text-2xl font-normal">
          Formulario de Emergencia
        </CardTitle>
        <CardDescription>
          Completa tus datos y te contactaremos a la brevedad.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enviado ? (
          <div className="rounded-md bg-primary/10 p-4 text-center text-sm font-medium text-primary">
            ¡Solicitud de emergencia enviada exitosamente!
          </div>
        ) : (
          <form
            key={restaurado ? "restaurado" : "inicial"}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del dueño</Label>
              <Input id="nombre" name="nombre" defaultValue={borrador.nombre ?? ""} placeholder="Ej: Juan Pérez" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                name="rut" defaultValue={borrador.rut ?? ""}
                placeholder="Ej: 12.345.678-9"
                pattern="\d{1,2}\.\d{3}\.\d{3}-[\dkK]"
                title="Formato: 12.345.678-9"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mascota">Nombre de la mascota</Label>
              <Input id="mascota" name="mascota" defaultValue={borrador.mascota ?? ""} placeholder="Ej: Luna" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono de contacto</Label>
              <Input id="telefono" name="telefono" defaultValue={borrador.telefono ?? ""} type="tel" placeholder="Ej: +56 9 1234 5678" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input id="correo" name="correo" defaultValue={borrador.correo ?? ""} type="email" placeholder="Ej: juan.perez@correo.cl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" defaultValue={borrador.direccion ?? ""} placeholder="Ej: Av. Siempre Viva 123, Santiago" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="motivo">Razón de consulta</Label>
              <Textarea
                id="motivo"
                name="motivo"
                defaultValue={borrador.motivo ?? ""}
                placeholder="Ej: Mi mascota presenta decaimiento y vómitos"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
            <Button type="submit" className="w-full sm:col-span-2" disabled={enviando}>
              {enviando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Enviar
            </Button>
          </form>
        )}

        {!enviado && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Al enviar este formulario deberás aceptar los{" "}
            <Link href="/terminos" target="_blank" className="font-medium text-primary underline underline-offset-2">
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/privacidad" target="_blank" className="font-medium text-primary underline underline-offset-2">
              Política de Privacidad
            </Link>
            .
          </p>
        )}
      </CardContent>

      <Dialog open={modalAbierto} onOpenChange={(abierto) => !abierto && !enviando && setModalAbierto(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Antes de enviar tu solicitud</DialogTitle>
            <DialogDescription>
              Vamos a usar tu nombre, RUT, teléfono, correo, dirección y los datos de tu mascota para contactarte. Para
              continuar, acepta lo siguiente.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-3">
            <li className="rounded-xl border bg-secondary/30 p-3">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span>Acepto los Términos y Condiciones</span>
              </label>
              <Link
                href="/terminos?desde=emergencia"
                onClick={guardarBorrador}
                className="mt-1 inline-block pl-6 text-xs font-medium text-primary underline underline-offset-2"
              >
                Leer Términos y Condiciones
              </Link>
            </li>
            <li className="rounded-xl border bg-secondary/30 p-3">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={aceptaPrivacidad}
                  onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span>Acepto la Política de Privacidad</span>
              </label>
              <Link
                href="/privacidad?desde=emergencia"
                onClick={guardarBorrador}
                className="mt-1 inline-block pl-6 text-xs font-medium text-primary underline underline-offset-2"
              >
                Leer Política de Privacidad
              </Link>
            </li>
          </ul>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={enviando}
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-full"
              disabled={!aceptaTerminos || !aceptaPrivacidad || enviando || !datosPendientes}
              onClick={() => datosPendientes && void enviar(datosPendientes)}
            >
              {enviando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {enviando ? "Enviando..." : "Aceptar y enviar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
