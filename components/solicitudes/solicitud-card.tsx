"use client";

import { Check, X, Clock3, Phone, Mail, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Solicitud } from "@/lib/types";

type SolicitudCardProps = {
  solicitud: Solicitud;
  onAceptar: (id: string) => void;
  onRechazar: (id: string) => void;
};

const estadoLabel: Record<Solicitud["estado"], string> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

const estadoClase: Record<Solicitud["estado"], string> = {
  pendiente: "bg-accent/25 text-accent-foreground",
  aceptada: "bg-primary/10 text-primary",
  rechazada: "bg-destructive/10 text-destructive",
};

export function SolicitudCard({ solicitud, onAceptar, onRechazar }: SolicitudCardProps) {
  const fecha = new Date(solicitud.fechaCreacion);

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {solicitud.mascota} <span className="font-normal text-muted-foreground">· {solicitud.nombreDueno}</span>
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock3 className="h-3 w-3" />
            {fecha.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", estadoClase[solicitud.estado])}>
          {estadoLabel[solicitud.estado]}
        </span>
      </div>

      <p className="mt-3 text-sm">{solicitud.motivo}</p>

      <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-3">
        <span className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          {solicitud.telefono}
        </span>
        <span className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          {solicitud.correo}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {solicitud.direccion}
        </span>
      </div>

      {solicitud.estado === "pendiente" && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => onRechazar(solicitud.id)}>
            <X className="mr-1.5 h-4 w-4" />
            Rechazar
          </Button>
          <Button size="sm" className="rounded-full" onClick={() => onAceptar(solicitud.id)}>
            <Check className="mr-1.5 h-4 w-4" />
            Aceptar y agendar
          </Button>
        </div>
      )}
    </div>
  );
}
