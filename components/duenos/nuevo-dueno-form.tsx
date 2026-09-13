"use client";

import Link from "next/link";
import { User, Save, CheckCircle2, Info } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function NuevoDuenoForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
<<<<<<< HEAD
    const datos = Object.fromEntries(new FormData(e.currentTarget));
  await fetch(`${API_URL}/duenos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rut: datos.rut,
      nombre_completo: datos.nombre,
      telefono: datos.telefono,
      correo: datos.correo,
      direccion: datos.direccion,
      negocioId: { negocioId: NEGOCIO_ID },
    }),
  });
=======
    // TODO: mandar esto al backend
>>>>>>> 9c2c2a8f9d63d21e21c9b0f76faf5646842b243d
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
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/dashboard/duenos">Cancelar</Link>
          </Button>
          <Button type="submit" form="nuevo-dueno-form" className="rounded-full">
            <Save className="mr-1.5 h-4 w-4" />
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
                <Input id="dueno-rut" name="rut" placeholder="Ej: 18.492.831-4" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueno-telefono">Teléfono *</Label>
                <Input id="dueno-telefono" name="telefono" type="tel" placeholder="Ej: +56 9 8765 4321" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueno-correo">Correo electrónico</Label>
                <Input id="dueno-correo" name="correo" type="email" placeholder="Ej: camila.morales@correo.cl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueno-direccion">Dirección</Label>
                <Input id="dueno-direccion" name="direccion" placeholder="Ej: Av. Siempre Viva 123, Santiago" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 rounded-xl border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Los campos marcados con (*) son obligatorios.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/dashboard/duenos">Cancelar</Link>
            </Button>
            <Button type="submit" className="rounded-full">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Registrar Dueño
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
