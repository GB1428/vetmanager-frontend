"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Save, CheckCircle2, Info, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { crearDueno } from "@/lib/api";

export function NuevoDuenoForm() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    setEnviando(true);
    setError(null);
    try {
      await crearDueno({
        nombre: datos.nombre,
        rut: datos.rut,
        telefono: datos.telefono,
        correo: datos.correo,
        direccion: datos.direccion,
      });
      router.push("/dashboard/duenos");
    } catch (err) {
      console.error("Error al registrar el dueño:", err);
      setError("No se pudo guardar el dueño. Revisa que el backend esté corriendo e inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav className="text-xs text-muted-foreground">
            <Link href="/dashboard/duenos" className="hover:text-foreground">
              Dueños
            </Link>
            <span className="mx-1">/</span>
            <span>Nuevo Registro</span>
          </nav>
          <h1 className="mt-1 text-xl font-semibold">Registro de Nuevo Dueño</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Completa los datos de contacto del tutor responsable.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" asChild disabled={enviando}>
            <Link href="/dashboard/duenos">Cancelar</Link>
          </Button>
          <Button type="submit" form="nuevo-dueno-form" className="rounded-full" disabled={enviando}>
            {enviando ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Guardar Dueño
          </Button>
        </div>
      </div>

      <form id="nuevo-dueno-form" onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-semibold">Datos del Dueño</h2>
            </div>
            <p className="pl-10 text-sm text-muted-foreground">
              Información de contacto del tutor responsable de la mascota.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="dueno-nombre">Nombre completo *</Label>
                <Input id="dueno-nombre" name="nombre" placeholder="Ej: Camila Morales" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueno-rut">RUT *</Label>
                <Input
                  id="dueno-rut"
                  name="rut"
                  placeholder="Ej: 18.492.831-4"
                  pattern="\d{1,2}\.\d{3}\.\d{3}-[\dkK]"
                  title="Formato: 18.492.831-4"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueno-telefono">Teléfono *</Label>
                <Input id="dueno-telefono" name="telefono" type="tel" placeholder="Ej: +56 9 8765 4321" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueno-correo">Correo electrónico *</Label>
                <Input id="dueno-correo" name="correo" type="email" placeholder="Ej: camila.morales@correo.cl" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueno-direccion">Dirección *</Label>
                <Input id="dueno-direccion" name="direccion" placeholder="Ej: Av. Siempre Viva 123, Santiago" required />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 rounded-xl border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            {error ? <span className="text-destructive">{error}</span> : "Los campos marcados con (*) son obligatorios."}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" asChild disabled={enviando}>
              <Link href="/dashboard/duenos">Cancelar</Link>
            </Button>
            <Button type="submit" className="rounded-full" disabled={enviando}>
              {enviando ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
              Registrar Dueño
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
