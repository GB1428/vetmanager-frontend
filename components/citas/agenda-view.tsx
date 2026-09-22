"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  BellPlus,
  Clock3,
  PawPrint,
  User,
  AlignLeft,
  CalendarX,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Cita } from "@/lib/types";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const nombresMes = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function toKey(anio: number, mes: number, dia: number) {
  return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function AgendaView({ citasIniciales }: { citasIniciales: Cita[] }) {
  const hoy = new Date();
  const [vista, setVista] = useState({ anio: hoy.getFullYear(), mes: hoy.getMonth() });
  const [modo, setModo] = useState<"mes" | "semana">("mes");
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  const citasPorDia = useMemo(() => {
    const mapa = new Map<string, Cita[]>();
    for (const cita of citasIniciales) {
      const lista = mapa.get(cita.fecha) ?? [];
      lista.push(cita);
      mapa.set(cita.fecha, lista);
    }
    for (const lista of mapa.values()) {
      lista.sort((a, b) => a.hora.localeCompare(b.hora));
    }
    return mapa;
  }, [citasIniciales]);

  const primerDiaSemana = (new Date(vista.anio, vista.mes, 1).getDay() + 6) % 7;
  const diasEnMes = new Date(vista.anio, vista.mes + 1, 0).getDate();

  const celdas: (number | null)[] = [
    ...Array(primerDiaSemana).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];
  while (celdas.length % 7 !== 0) celdas.push(null);

  function irMesAnterior() {
    setVista((v) => {
      const mes = v.mes === 0 ? 11 : v.mes - 1;
      const anio = v.mes === 0 ? v.anio - 1 : v.anio;
      return { anio, mes };
    });
  }

  function irMesSiguiente() {
    setVista((v) => {
      const mes = v.mes === 11 ? 0 : v.mes + 1;
      const anio = v.mes === 11 ? v.anio + 1 : v.anio;
      return { anio, mes };
    });
  }

  const citasDelDiaSeleccionado = seleccionado ? citasPorDia.get(seleccionado) ?? [] : [];

  const fechaSeleccionadaLabel = useMemo(() => {
    if (!seleccionado) return null;
    const [anio, mes, dia] = seleccionado.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    const nombreDia = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][fecha.getDay()];
    return `${nombreDia} ${dia} de ${nombresMes[mes - 1]}`;
  }, [seleccionado]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="mt-1 text-sm text-muted-foreground">Revisa y gestiona las citas programadas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full bg-secondary/60 p-1">
            <button
              type="button"
              onClick={() => setModo("mes")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                modo === "mes" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Mes
            </button>
            <button
              type="button"
              onClick={() => setModo("semana")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                modo === "semana" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Semana
            </button>
          </div>
          <Button variant="outline" className="rounded-full border-primary/30 text-primary" disabled>
            <BellPlus className="mr-1.5 h-4 w-4" />
            Agregar Recordatorio
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/dashboard/agenda/nueva">
              <Plus className="mr-1.5 h-4 w-4" />
              Agregar Cita
            </Link>
          </Button>
        </div>
      </div>

      {modo === "semana" ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <CalendarX className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">La vista semanal está en camino</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Por ahora usa la vista de Mes para revisar y agendar las citas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <button
              type="button"
              onClick={irMesAnterior}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-base font-semibold">
              {nombresMes[vista.mes]} {vista.anio}
            </p>
            <button
              type="button"
              onClick={irMesSiguiente}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b bg-secondary/30 text-xs font-medium text-muted-foreground">
            {diasSemana.map((dia) => (
              <div key={dia} className="px-3 py-2 text-center">
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {celdas.map((dia, i) => {
              if (dia === null) {
                return <div key={`vacio-${i}`} className="min-h-[110px] border-b border-r bg-secondary/10" />;
              }

              const key = toKey(vista.anio, vista.mes, dia);
              const citasDelDia = citasPorDia.get(key) ?? [];
              const esHoy =
                vista.anio === hoy.getFullYear() && vista.mes === hoy.getMonth() && dia === hoy.getDate();
              const esSeleccionado = seleccionado === key;
              const visibles = citasDelDia.slice(0, 2);
              const restantes = citasDelDia.length - visibles.length;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSeleccionado(key)}
                  className={cn(
                    "flex min-h-[110px] flex-col items-start gap-1 border-b border-r p-2 text-left transition-colors hover:bg-primary/5",
                    esSeleccionado && "bg-primary/10 ring-1 ring-inset ring-primary"
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                        esHoy && "bg-primary font-medium text-primary-foreground"
                      )}
                    >
                      {dia}
                    </span>
                    {citasDelDia.length > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" title={`${citasDelDia.length} hora(s) agendada(s)`} />
                    )}
                  </span>
                  <span className="flex w-full flex-col gap-1">
                    {visibles.map((cita) => (
                      <span
                        key={cita.id}
                        className="flex items-center gap-1 truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary"
                      >
                        <Clock3 className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {cita.hora} · {cita.mascotaNombre}
                        </span>
                      </span>
                    ))}
                    {restantes > 0 && (
                      <span className="px-1.5 text-[11px] font-medium text-muted-foreground">
                        +{restantes} hora{restantes === 1 ? "" : "s"}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {seleccionado && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{fechaSeleccionadaLabel}</h2>
              <span className="text-xs text-muted-foreground">
                {citasDelDiaSeleccionado.length} cita{citasDelDiaSeleccionado.length === 1 ? "" : "s"} agendada
                {citasDelDiaSeleccionado.length === 1 ? "" : "s"}
              </span>
            </div>

            {citasDelDiaSeleccionado.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-secondary/30 px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">No hay citas agendadas para este día.</p>
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/dashboard/agenda/nueva">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Agendar Cita
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {citasDelDiaSeleccionado.map((cita) => (
                  <div
                    key={cita.id}
                    className="flex flex-col gap-2 rounded-xl border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Clock3 className="h-3.5 w-3.5 text-primary" />
                        {cita.hora}
                        <span className="text-muted-foreground">·</span>
                        <PawPrint className="h-3.5 w-3.5 text-primary" />
                        {cita.mascotaNombre}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {cita.duenoNombre}
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <AlignLeft className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{cita.motivo}</span>
                      </div>
                    </div>
                    <span className="w-fit shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {cita.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
