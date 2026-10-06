"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, CalendarPlus, Mail, MapPin, PawPrint, Pencil, Phone, Scale, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditarPacienteDialog } from "@/components/pacientes/editar-paciente-dialog";
import { SEXOS, resolverOpcion } from "@/lib/constants";
import type { Dueno, Paciente } from "@/lib/types";

function etiquetaSexo(valor?: string): string {
  if (!valor) return "";
  const v = resolverOpcion(SEXOS, valor);
  return SEXOS.find((o) => o.value === v)?.label ?? valor;
}

function calcularEdad(fechaNacimiento?: string): string | null {
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento);
  if (Number.isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
  if (hoy.getDate() < nac.getDate()) meses -= 1;
  if (meses < 0) return null;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const partes: string[] = [];
  if (anios > 0) partes.push(`${anios} ${anios === 1 ? "año" : "años"}`);
  if (resto > 0 || anios === 0) partes.push(`${resto} ${resto === 1 ? "mes" : "meses"}`);
  return partes.join(" y ");
}

function formatearFecha(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function tieneValor(v?: string): v is string {
  return !!v && v !== "—";
}

export function PacienteDetalle({
  paciente,
  duenos,
  otrosPacientes,
  ultimaVisita,
}: {
  paciente: Paciente;
  duenos: Dueno[];
  otrosPacientes: Paciente[];
  ultimaVisita?: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);

  const edad = calcularEdad(paciente.fechaNacimiento);
  const nacimiento = formatearFecha(paciente.fechaNacimiento);
  const visita = formatearFecha(ultimaVisita);

  const descripcion = [
    [paciente.especie, paciente.raza].filter(tieneValor).join(" "),
    etiquetaSexo(paciente.sexo),
    edad,
  ]
    .filter(Boolean)
    .join(" • ");

  const alergias = (paciente.alergias ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-card px-6 py-4 shadow-sm">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <PawPrint className="h-3.5 w-3.5" />
            <Link href="/dashboard/pacientes" className="hover:text-foreground">
              Pacientes
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">{paciente.nombre}</span>
          </nav>
          <h1 className="mt-1 text-2xl font-semibold text-primary">{paciente.nombre}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => setEditando(true)}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Editar Datos
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/dashboard/agenda/nueva">
              <CalendarPlus className="mr-1.5 h-4 w-4" />
              Nueva Consulta / Cita
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Datos del paciente + alergias */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold">{paciente.nombre}</h2>
            {paciente.microchip && (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                Microchip #{paciente.microchip}
              </span>
            )}
          </div>

          {descripcion && <p className="mt-2 text-sm text-muted-foreground">{descripcion}</p>}
          {nacimiento && <p className="text-sm text-muted-foreground">Nacimiento: {nacimiento}</p>}

          <div className="mt-3 flex flex-wrap gap-2">
            {paciente.pesoKg != null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
                <Scale className="h-3.5 w-3.5" />
                {paciente.pesoKg} kg
              </span>
            )}
            {visita && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                <CalendarCheck className="h-3.5 w-3.5" />
                Última visita: {visita}
              </span>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-secondary/50 p-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Alergias registradas
              </p>
            </div>
            {alergias.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {alergias.map((a) => (
                  <span key={a} className="rounded-full bg-card px-3 py-1 text-xs font-medium shadow-sm">
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Sin alergias registradas.</p>
            )}
          </div>
        </div>

        {/* Tutor responsable */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Tutor responsable</p>

          {paciente.duenoId ? (
            <Link
              href={`/dashboard/duenos/${paciente.duenoId}`}
              className="mt-4 flex items-center gap-3 rounded-2xl hover:text-primary"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {iniciales(paciente.duenoNombre) || "—"}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold underline-offset-2 hover:underline">{paciente.duenoNombre}</p>
                {paciente.duenoRut && <p className="text-xs text-muted-foreground">RUT: {paciente.duenoRut}</p>}
              </div>
            </Link>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {iniciales(paciente.duenoNombre) || "—"}
              </span>
              <p className="truncate font-semibold">{paciente.duenoNombre}</p>
            </div>
          )}

          <div className="mt-4 space-y-2 text-sm">
            {paciente.duenoTelefono && (
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {paciente.duenoTelefono}
              </p>
            )}
            {paciente.duenoCorreo && (
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="break-all">{paciente.duenoCorreo}</span>
              </p>
            )}
            {paciente.duenoDireccion && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {paciente.duenoDireccion}
              </p>
            )}
          </div>

          {otrosPacientes.length > 0 && (
            <div className="mt-4 rounded-2xl bg-secondary/50 px-4 py-3 text-xs">
              <p className="text-muted-foreground">Otros pacientes a cargo</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {otrosPacientes.map((o) => (
                  <Link
                    key={o.id}
                    href={`/dashboard/pacientes/${o.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 font-medium shadow-sm hover:text-primary"
                  >
                    <PawPrint className="h-3 w-3" />
                    {o.nombre}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pestaña */}
      <div>
        <span className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Resumen General
        </span>
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Antecedentes</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
          {paciente.antecedentes?.trim() || "Sin antecedentes registrados."}
        </p>
      </div>

      {editando && (
        <EditarPacienteDialog
          paciente={paciente}
          duenos={duenos}
          onClose={() => setEditando(false)}
          onGuardado={() => router.refresh()}
        />
      )}
    </div>
  );
}
