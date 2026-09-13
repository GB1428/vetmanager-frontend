"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const NEGOCIO_ID = 1;

export function EmergencyForm() {
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    const datos = Object.fromEntries(formData) as Record<string, string>;

    try {
      const res = await fetch(`${API_URL}/contacto-emergencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razon_consulta: datos.motivo,
          nom_mascota: datos.mascota,
          // Coincide con createConDueño.negocioId.negocioId de tu Service
          negocioId: { negocioId: Number(NEGOCIO_ID) },
          dueno: {
            rut: datos.rut,
            nombre_completo: datos.nombre,
            telefono: datos.telefono,
            correo: datos.correo,
            direccion: datos.direccion,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Detalle de validación NestJS:", errorData.message || errorData);
        throw new Error("No se pudo registrar la solicitud en el servidor.");
      }

      setEnviado(true);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      alert("Ocurrió un error al procesar el formulario de emergencia.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <CardHeader>
        <CardTitle>Formulario de Emergencia</CardTitle>
        <CardDescription>
          Ingresa tus datos para registrar la solicitud de atención veterinaria.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enviado ? (
          <div className="rounded-md bg-green-50 p-4 text-center text-sm font-medium text-green-700">
            ¡Solicitud de emergencia enviada exitosamente!
          </div>
        ) : (
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del dueño</Label>
              <Input id="nombre" name="nombre" placeholder="Juan Pérez" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input id="rut" name="rut" placeholder="12.345.678-9" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mascota">Nombre de la mascota</Label>
              <Input id="mascota" name="mascota" placeholder="Luna" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" type="tel" placeholder="+56912345678" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input id="correo" name="correo" type="email" placeholder="correo@ejemplo.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" placeholder="Av. Principal 123" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="motivo">Razón de consulta</Label>
              <Textarea
                id="motivo"
                name="motivo"
                placeholder="Describe los síntomas o la razón de emergencia..."
                required
              />
            </div>
            <Button type="submit" className="w-full sm:col-span-2" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}