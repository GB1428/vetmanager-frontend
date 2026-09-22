"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const diasSemana = ["L", "M", "M", "J", "V", "S", "D"];
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

type MonthCalendarProps = {
  seleccionado: Date;
  onSelect: (fecha: Date) => void;
};

export function MonthCalendar({ seleccionado, onSelect }: MonthCalendarProps) {
  const hoy = new Date();
  const [vista, setVista] = useState({ anio: hoy.getFullYear(), mes: hoy.getMonth() });

  const primerDiaSemana = (new Date(vista.anio, vista.mes, 1).getDay() + 6) % 7;
  const diasEnMes = new Date(vista.anio, vista.mes + 1, 0).getDate();

  const celdas: (number | null)[] = [
    ...Array(primerDiaSemana).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];
  while (celdas.length % 7 !== 0) celdas.push(null);

  const esMesActual = vista.anio === hoy.getFullYear() && vista.mes === hoy.getMonth();

  function irMesAnterior() {
    if (esMesActual) return;
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={irMesAnterior}
          disabled={esMesActual}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary",
            esMesActual && "cursor-not-allowed opacity-30 hover:bg-transparent"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium">
          {nombresMes[vista.mes]} {vista.anio}
        </p>
        <button
          type="button"
          onClick={irMesSiguiente}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
        {diasSemana.map((dia, i) => (
          <span key={`${dia}-${i}`} className="text-xs font-medium text-muted-foreground">
            {dia}
          </span>
        ))}
        {celdas.map((dia, i) => {
          if (dia === null) return <span key={`vacio-${i}`} />;

          const esSeleccionado =
            seleccionado.getFullYear() === vista.anio &&
            seleccionado.getMonth() === vista.mes &&
            seleccionado.getDate() === dia;
          const esHoy = esMesActual && dia === hoy.getDate();

          return (
            <button
              key={dia}
              type="button"
              onClick={() => onSelect(new Date(vista.anio, vista.mes, dia))}
              className={cn(
                "mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                esSeleccionado
                  ? "bg-primary font-medium text-primary-foreground"
                  : esHoy
                  ? "border border-primary text-primary"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}
