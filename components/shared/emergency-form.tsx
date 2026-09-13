"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addSolicitud } from "@/lib/solicitudes-storage";

export function EmergencyForm() {
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    // TODO: guardar esto también en el backend, no solo local
    addSolicitud({
      nombreDueno: datos.nombre,
      rut: datos.rut,
      mascota: datos.mascota,
      telefono: datos.telefono,
      correo: datos.correo,
      direccion: datos.direccion,
      motivo: datos.motivo,
    });

    setEnviado(true);
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
          <p className="text-sm text-muted-foreground">
            Tu solicitud fue enviada. Nos pondremos en contacto contigo pronto.
          </p>
        ) : (
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del dueño</Label>
              <Input id="nombre" name="nombre" placeholder="Ej: Juan Pérez" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input id="rut" name="rut" placeholder="Ej: 12.345.678-9" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mascota">Nombre de la mascota</Label>
              <Input id="mascota" name="mascota" placeholder="Ej: Luna" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono de contacto</Label>
              <Input id="telefono" name="telefono" type="tel" placeholder="Ej: +56 9 1234 5678" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input id="correo" name="correo" type="email" placeholder="Ej: juan.perez@correo.cl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" placeholder="Ej: Av. Siempre Viva 123, Santiago" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="motivo">Razón de consulta</Label>
              <Textarea
                id="motivo"
                name="motivo"
                placeholder="Ej: Mi mascota presenta decaimiento y vómitos"
                required
              />
            </div>
            <Button type="submit" className="w-full sm:col-span-2">
              Enviar
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
