"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PawPrint,
  Stethoscope,
  Syringe,
  Award,
  Bug,
  CalendarDays,
  Clock3,
  AlignLeft,
  CheckCircle2,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MascotaToggle } from "@/components/citas/mascota-toggle";
import { TipoConsultaCard } from "@/components/citas/tipo-consulta-card";
import { MonthCalendar } from "@/components/citas/month-calendar";
import { HorariosGrid } from "@/components/citas/horarios-grid";

const tiposConsulta = [
  { id: "general", label: "Consulta General", icon: Stethoscope },
  { id: "vacunacion", label: "Vacunación", icon: Syringe },
  { id: "especialidad", label: "Control Especialidad", icon: Award },
  { id: "desparasitacion", label: "Desparasitación", icon: Bug },
];

export function NuevaCitaForm() {
  const [tipoConsulta, setTipoConsulta] = useState("general");
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState<string | null>(null);

  function handleConfirmar(e: React.FormEvent) {
    e.preventDefault();
    // TODO: acá va la llamada al backend para crear la cita (ver integracion-backend.txt)
  }

  return (
    <Card className="w-full overflow-hidden">
      <form onSubmit={handleConfirmar}>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PawPrint className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold">Selección de Mascota</h2>
        </div>
        <p className="pl-10 text-sm text-muted-foreground">
          Selecciona una mascota registrada o inscribe una nueva para la cita
        </p>
        <div className="pl-10 pt-2">
          <MascotaToggle />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Mascota Registrada</Label>
            <div className="flex h-10 w-full items-center rounded-lg border border-dashed border-input bg-secondary/30 px-3 text-sm text-muted-foreground">
              No hay mascotas registradas
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tutor / Propietario Asociado</Label>
            <div className="flex h-10 w-full items-center rounded-lg border border-dashed border-input bg-secondary/30 px-3 text-sm text-muted-foreground">
              No hay tutores registrados
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detalles de la Cita</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiposConsulta.map(({ id, label, icon }) => (
              <TipoConsultaCard
                key={id}
                label={label}
                icon={icon}
                selected={tipoConsulta === id}
                onSelect={() => setTipoConsulta(id)}
              />
            ))}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs">
              <AlignLeft className="h-3.5 w-3.5" />
              Motivo o Razón de la Consulta
            </Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: control de rutina, decaimiento, revisión de herida, vacunas..."
              className="min-h-[90px] bg-secondary/40"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Fecha y Hora</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl bg-secondary/40 p-4">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-primary" />
                Seleccionar Fecha
              </span>
              <MonthCalendar seleccionado={fecha} onSelect={setFecha} />
            </div>
            <div className="space-y-3 rounded-xl bg-secondary/40 p-4">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Clock3 className="h-4 w-4 text-primary" />
                Horarios Disponibles
              </span>
              <p className="text-xs text-muted-foreground">
                Atención de 08:00 a 18:00 hrs · duración estimada 30 a 45 minutos
              </p>
              <HorariosGrid seleccionado={hora} onSelect={setHora} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/dashboard/agenda">Cancelar</Link>
          </Button>
          <Button type="submit" className="rounded-full">
            Confirmar Cita
            <CheckCircle2 className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      </form>
    </Card>
  );
}
