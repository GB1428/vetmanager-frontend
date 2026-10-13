"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Pencil, Plus, Syringe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditarRegistroDialog } from "@/components/vacunas/editar-registro-dialog";
import { OBSERVACION_VACIA } from "@/lib/constants";
import { diasHasta, formatearFechaCorta, formatearInstanteCorto } from "@/lib/fechas";
import type { RegistroVacuna } from "@/lib/types";

function estadoProxima(valor: string): { texto: string; vencida: boolean } {
  const dias = diasHasta(valor);
  if (Number.isNaN(dias)) return { texto: "—", vencida: false };
  if (dias < 0) return { texto: `Vencida hace ${Math.abs(dias)} ${Math.abs(dias) === 1 ? "día" : "días"}`, vencida: true };
  if (dias === 0) return { texto: "Vence hoy", vencida: false };
  return { texto: `En ${dias} ${dias === 1 ? "día" : "días"}`, vencida: false };
}

export function VacunasPaciente({
  pacienteId,
  registros,
  onCambio,
}: {
  pacienteId: string;
  registros: RegistroVacuna[];
  onCambio: () => void;
}) {
  const [editando, setEditando] = useState<RegistroVacuna | null>(null);

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Vacunas</h2>
          <p className="text-sm text-muted-foreground">Historial de inmunización del paciente.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/dashboard/vacunas?paciente=${pacienteId}`}>
            <Plus className="mr-1.5 h-4 w-4" />
            Registrar dosis
          </Link>
        </Button>
      </div>

      {registros.length === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-2 rounded-2xl bg-secondary/50 px-4 py-8 text-center">
          <Syringe className="h-6 w-6 text-primary" />
          <p className="text-sm font-medium">Este paciente aún no tiene vacunas registradas.</p>
          <p className="text-xs text-muted-foreground">Cuando registres una dosis aparecerá aquí.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {registros.map((r) => {
            const proxima = estadoProxima(r.proximaDosis);
            return (
              <li key={r.id} className="rounded-2xl border bg-secondary/40 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{r.vacunaNombre}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Aplicada el {formatearInstanteCorto(r.fechaAplicacion)} • Lote:{" "}
                      <span className="font-bold text-foreground">{r.lote}</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-full"
                    onClick={() => setEditando(r)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-card px-2.5 py-1 text-muted-foreground shadow-sm">
                    Próxima dosis: {formatearFechaCorta(r.proximaDosis)}
                  </span>
                  <span
                    className={
                      proxima.vencida
                        ? "rounded-full bg-destructive/10 px-2.5 py-1 font-medium text-destructive"
                        : "rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-800"
                    }
                  >
                    {proxima.texto}
                  </span>
                </div>

                {r.observaciones && r.observaciones !== OBSERVACION_VACIA && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <FileText className="mt-0.5 h-3 w-3 shrink-0" />
                    {r.observaciones}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {editando && (
        <EditarRegistroDialog
          registro={editando}
          onClose={() => setEditando(null)}
          onGuardado={onCambio}
        />
      )}
    </div>
  );
}
