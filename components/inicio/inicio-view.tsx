"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlignLeft,
  CalendarCheck,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  Loader2,
  PawPrint,
  Pencil,
  Phone,
  Plus,
  Receipt,
  FileText,
  Syringe,
  Timer,
  User,
} from "lucide-react";
import { DateTime } from "luxon";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EditarCitaDialog } from "@/components/citas/editar-cita-dialog";
import { AceptarSolicitudDialog } from "@/components/solicitudes/aceptar-solicitud-dialog";
import { listarCitasPorRango, listarHistorialVacunas, listarSolicitudes } from "@/lib/api";
import { diasHasta, hoyLocalISO } from "@/lib/fechas";
import { cn } from "@/lib/utils";
import type { Cita, RegistroVacuna, Solicitud } from "@/lib/types";

const MAX_SOLICITUDES = 5;
const MAX_MASCOTAS_VACUNAS = 10;
const DIAS_AVISO_VACUNA = 30;
const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function aFecha(iso: string): Date {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function desplazarDia(iso: string, dias: number): string {
  const d = aFecha(iso);
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// lunes de la semana que contiene la fecha (la semana va de lunes a domingo)
function lunesDe(iso: string): string {
  const atras = (aFecha(iso).getDay() + 6) % 7;
  return desplazarDia(iso, -atras);
}

function minutosDe(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function textoDias(dias: number): string {
  if (dias === 0) return "vence hoy";
  if (dias === 1) return "vence mañana";
  if (dias > 1) return `vence en ${dias} días`;
  if (dias === -1) return "venció ayer";
  return `venció hace ${Math.abs(dias)} días`;
}

type Refuerzo = { clave: string; mascota: string; vacuna: string; dias: number };

// de cada vacuna se mira solo la ultima aplicacion, asi un registro viejo no sale como vencido
function calcularRefuerzos(
  mascotas: { id: string; nombre: string }[],
  historiales: Record<string, RegistroVacuna[]>,
): Refuerzo[] {
  const lista: Refuerzo[] = [];

  for (const m of mascotas) {
    const ultimas = new Map<string, RegistroVacuna>();
    for (const r of historiales[m.id] ?? []) {
      const clave = r.vacunaId || r.vacunaNombre;
      const previo = ultimas.get(clave);
      if (!previo || r.fechaAplicacion > previo.fechaAplicacion) ultimas.set(clave, r);
    }

    for (const r of ultimas.values()) {
      if (!r.proximaDosis || Number.isNaN(new Date(r.proximaDosis).getTime())) continue;
      const dias = diasHasta(r.proximaDosis);
      if (dias <= DIAS_AVISO_VACUNA) {
        lista.push({ clave: `${m.id}-${r.id}`, mascota: m.nombre, vacuna: r.vacunaNombre, dias });
      }
    }
  }

  return lista.sort((a, b) => a.dias - b.dias);
}

function etiquetaFecha(iso: string): string {
  const d = aFecha(iso);
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function etiquetaRelativa(iso: string): string | null {
  const dif = diasHasta(iso);
  if (dif === 0) return "Hoy";
  if (dif === 1) return "Mañana";
  if (dif === -1) return "Ayer";
  return null;
}

function claseEstado(estado: string): string {
  switch (estado.toLowerCase()) {
    case "cancelada":
      return "bg-destructive/10 text-destructive";
    case "completada":
      return "bg-secondary text-muted-foreground";
    case "confirmada":
      return "bg-primary/10 text-primary";
    default:
      return "bg-accent/25 text-accent-foreground";
  }
}

export function InicioView() {
  const [fecha, setFecha] = useState(hoyLocalISO());
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [errorSolicitudes, setErrorSolicitudes] = useState(false);
  const [citaEditando, setCitaEditando] = useState<Cita | null>(null);
  const [aceptando, setAceptando] = useState<Solicitud | null>(null);

  // las citas se piden por semana (lunes a domingo) y se guardan, no se cargan todas las de la base
  const [citasPorSemana, setCitasPorSemana] = useState<Record<string, Cita[]>>({});
  const [cargandoCitas, setCargandoCitas] = useState(true);
  const [errorCitas, setErrorCitas] = useState(false);
  const [intento, setIntento] = useState(0);
  const semanasCargadas = useRef(new Set<string>());

  const inicioSemana = lunesDe(fecha);
  const citasSemana = citasPorSemana[inicioSemana] ?? [];

  // para la proxima cita y el aviso de "ya paso la hora"
  const [ahora, setAhora] = useState(() => DateTime.now().setZone("America/Santiago").toFormat("HH:mm"));
  useEffect(() => {
    const id = window.setInterval(
      () => setAhora(DateTime.now().setZone("America/Santiago").toFormat("HH:mm")),
      60_000,
    );
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let activo = true;

    listarSolicitudes()
      .then((lista) => {
        if (activo) setSolicitudes(lista);
      })
      .catch((err) => {
        console.error("Error al cargar las solicitudes del inicio:", err);
        if (activo) setErrorSolicitudes(true);
      })
      .finally(() => {
        if (activo) setCargandoSolicitudes(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (semanasCargadas.current.has(inicioSemana)) {
      setCargandoCitas(false);
      return;
    }

    let activo = true;
    setCargandoCitas(true);
    setErrorCitas(false);

    listarCitasPorRango(inicioSemana, desplazarDia(inicioSemana, 6))
      .then((lista) => {
        if (!activo) return;
        semanasCargadas.current.add(inicioSemana);
        setCitasPorSemana((prev) => ({ ...prev, [inicioSemana]: lista }));
      })
      .catch((err) => {
        console.error("Error al cargar las citas de la semana:", err);
        if (activo) setErrorCitas(true);
      })
      .finally(() => {
        if (activo) setCargandoCitas(false);
      });

    return () => {
      activo = false;
    };
  }, [inicioSemana, intento]);

  const citasDelDia = useMemo(
    () => citasSemana.filter((c) => c.fecha === fecha).sort((a, b) => a.hora.localeCompare(b.hora)),
    [citasSemana, fecha],
  );
  const citasActivas = citasDelDia.filter((c) => c.estado.toLowerCase() !== "cancelada");
  const porConfirmar = citasActivas.filter((c) => c.estado.toLowerCase() === "pendiente").length;

  const diasSemana = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const iso = desplazarDia(inicioSemana, i);
        const cantidad = citasSemana.filter((c) => c.fecha === iso && c.estado.toLowerCase() !== "cancelada").length;
        return { iso, dia: aFecha(iso).getDate(), etiqueta: DIAS_CORTOS[i], cantidad };
      }),
    [inicioSemana, citasSemana],
  );

  const esHoy = fecha === hoyLocalISO();

  // siguiente cita del dia (solo si se esta viendo hoy)
  const siguiente = useMemo(() => {
    if (!esHoy) return null;
    return (
      citasActivas.find(
        (c) => c.estado.toLowerCase() !== "completada" && minutosDe(c.hora) >= minutosDe(ahora),
      ) ?? null
    );
  }, [esHoy, citasActivas, ahora]);

  // refuerzos de vacunas de las mascotas que tienen cita ese dia
  const mascotasDelDia = useMemo(() => {
    const vistas = new Map<string, string>();
    for (const c of citasActivas) {
      if (c.mascotaId && !vistas.has(c.mascotaId)) vistas.set(c.mascotaId, c.mascotaNombre);
    }
    return Array.from(vistas, ([id, nombre]) => ({ id, nombre })).slice(0, MAX_MASCOTAS_VACUNAS);
  }, [citasActivas]);
  const clavesMascotas = mascotasDelDia.map((m) => m.id).join(",");

  const [historiales, setHistoriales] = useState<Record<string, RegistroVacuna[]>>({});
  const [cargandoVacunas, setCargandoVacunas] = useState(false);
  const historialesPedidos = useRef(new Set<string>());

  useEffect(() => {
    const faltan = mascotasDelDia.filter((m) => !historialesPedidos.current.has(m.id));
    if (faltan.length === 0) return;

    let activo = true;
    setCargandoVacunas(true);
    faltan.forEach((m) => historialesPedidos.current.add(m.id));

    Promise.allSettled(faltan.map((m) => listarHistorialVacunas(m.id)))
      .then((resultados) => {
        if (!activo) return;
        const nuevos: Record<string, RegistroVacuna[]> = {};
        resultados.forEach((res, i) => {
          if (res.status === "fulfilled") {
            nuevos[faltan[i].id] = res.value;
          } else {
            // si falla se vuelve a intentar la proxima vez
            historialesPedidos.current.delete(faltan[i].id);
            console.error("No se pudo cargar el historial de vacunas de", faltan[i].nombre, res.reason);
          }
        });
        setHistoriales((prev) => ({ ...prev, ...nuevos }));
      })
      .finally(() => {
        if (activo) setCargandoVacunas(false);
      });

    return () => {
      activo = false;
      faltan.forEach((m) => historialesPedidos.current.delete(m.id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clavesMascotas]);

  const refuerzos = useMemo(
    () => calcularRefuerzos(mascotasDelDia, historiales),
    [mascotasDelDia, historiales],
  );

  const pendientes = useMemo(
    () =>
      solicitudes
        .filter((s) => s.estado === "pendiente")
        .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()),
    [solicitudes],
  );

  const relativa = etiquetaRelativa(fecha);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inicio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Solicitudes pendientes, citas del día y refuerzos de vacunas.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setFecha((f) => desplazarDia(f, -1))}
            aria-label="Día anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <input
            type="date"
            value={fecha}
            onChange={(e) => e.target.value && setFecha(e.target.value)}
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
            aria-label="Elegir día"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setFecha((f) => desplazarDia(f, 1))}
            aria-label="Día siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full"
            disabled={esHoy}
            onClick={() => setFecha(hoyLocalISO())}
          >
            Hoy
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ResumenCard
          icon={CalendarCheck}
          titulo={`Citas ${relativa ? relativa.toLowerCase() : "del día"}`}
          valor={cargandoCitas ? "—" : String(citasActivas.length)}
          detalle={cargandoCitas ? "Cargando..." : `${citasDelDia.length - citasActivas.length} cancelada(s)`}
        />
        <ResumenCard
          icon={Clock3}
          titulo="Por confirmar"
          valor={cargandoCitas ? "—" : String(porConfirmar)}
          detalle="Citas pendientes del día"
        />
        <ResumenCard
          icon={Inbox}
          titulo="Solicitudes pendientes"
          valor={cargandoSolicitudes ? "—" : String(pendientes.length)}
          detalle="Formularios de emergencia"
          href="/dashboard/solicitudes"
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  Citas del día
                  {relativa && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {relativa}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">{etiquetaFecha(fecha)}</p>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/dashboard/agenda">Ver agenda completa</Link>
              </Button>
            </div>

            {errorCitas && !cargandoCitas && (
              <p className="text-sm text-destructive">
                No se pudieron cargar las citas. Revisa que el backend esté corriendo y que tu sesión siga activa.{" "}
                <button type="button" className="font-medium underline" onClick={() => setIntento((n) => n + 1)}>
                  Reintentar
                </button>
              </p>
            )}

            {/* semana: un clic para saltar de un día a otro */}
            <div className="grid grid-cols-7 gap-1.5">
              {diasSemana.map((d) => {
                const activo = d.iso === fecha;
                const esDiaHoy = d.iso === hoyLocalISO();
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setFecha(d.iso)}
                    aria-label={`Ver ${etiquetaFecha(d.iso)}`}
                    aria-pressed={activo}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2 text-xs transition-colors",
                      activo
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-card hover:border-primary hover:bg-primary/5",
                    )}
                  >
                    <span className={cn("font-medium", !activo && "text-muted-foreground")}>{d.etiqueta}</span>
                    <span
                      className={cn(
                        "text-base font-semibold leading-tight",
                        esDiaHoy && !activo && "text-primary",
                      )}
                    >
                      {d.dia}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[10px] font-medium",
                        activo
                          ? "bg-primary-foreground/20"
                          : d.cantidad > 0
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground",
                      )}
                    >
                      {cargandoCitas ? "·" : `${d.cantidad} cita${d.cantidad === 1 ? "" : "s"}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {esHoy && !cargandoCitas && citasActivas.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                <Timer className="h-4 w-4 shrink-0 text-primary" />
                {siguiente ? (
                  <p>
                    <span className="font-medium">Siguiente cita:</span> {siguiente.hora} · {siguiente.mascotaNombre}{" "}
                    <span className="text-muted-foreground">({siguiente.duenoNombre})</span>
                    {" — "}
                    {(() => {
                      const faltan = minutosDe(siguiente.hora) - minutosDe(ahora);
                      if (faltan <= 0) return "ahora";
                      if (faltan < 60) return `en ${faltan} min`;
                      return `en ${Math.floor(faltan / 60)} h ${faltan % 60 ? `${faltan % 60} min` : ""}`.trim();
                    })()}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No quedan más citas para hoy.</p>
                )}
              </div>
            )}

            {cargandoCitas ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando citas...
              </p>
            ) : citasDelDia.length === 0 && !errorCitas ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-secondary/30 px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">No hay citas agendadas para este día.</p>
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/dashboard/agenda/nueva">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Agendar cita
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {citasDelDia.map((cita) => (
                  <li
                    key={cita.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-xl border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between",
                      cita.estado.toLowerCase() === "cancelada" && "opacity-60",
                    )}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {cita.hora}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <p className="flex items-center gap-1.5 text-sm font-medium">
                          <PawPrint className="h-3.5 w-3.5 shrink-0 text-primary" />
                          {cita.mascotaId ? (
                            <Link href={`/dashboard/pacientes/${cita.mascotaId}`} className="truncate hover:underline">
                              {cita.mascotaNombre}
                            </Link>
                          ) : (
                            <span className="truncate">{cita.mascotaNombre}</span>
                          )}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3 shrink-0" />
                          <span className="truncate">{cita.duenoNombre}</span>
                        </p>
                        {cita.motivo && (
                          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <AlignLeft className="mt-0.5 h-3 w-3 shrink-0" />
                            <span>{cita.motivo}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn("rounded-full px-3 py-1 text-xs font-medium", claseEstado(cita.estado))}>
                        {cita.estado || "Sin estado"}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setCitaEditando(cita)}
                        aria-label={`Editar cita de ${cita.mascotaNombre}`}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Editar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Solicitudes pendientes</h2>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href="/dashboard/solicitudes">Ver todas</Link>
                </Button>
              </div>

              {errorSolicitudes && (
                <p className="text-sm text-destructive">No se pudieron cargar las solicitudes.</p>
              )}

              {cargandoSolicitudes ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando solicitudes...
                </p>
              ) : pendientes.length === 0 && !errorSolicitudes ? (
                <p className="rounded-xl border border-dashed border-input bg-secondary/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay solicitudes pendientes.
                </p>
              ) : (
                <ul className="space-y-3">
                  {pendientes.slice(0, MAX_SOLICITUDES).map((s) => (
                    <li key={s.id} className="space-y-2 rounded-xl border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">
                          {s.mascota} <span className="font-normal text-muted-foreground">· {s.nombreDueno}</span>
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {new Date(s.fechaCreacion).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{s.motivo}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {s.telefono}
                        </span>
                        <Button size="sm" className="h-7 rounded-full px-3 text-xs" onClick={() => setAceptando(s)}>
                          Aceptar y agendar
                        </Button>
                      </div>
                    </li>
                  ))}
                  {pendientes.length > MAX_SOLICITUDES && (
                    <li className="text-center text-xs text-muted-foreground">
                      y {pendientes.length - MAX_SOLICITUDES} más en{" "}
                      <Link href="/dashboard/solicitudes" className="font-medium text-primary hover:underline">
                        Solicitudes
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <Syringe className="h-4 w-4 text-primary" />
                  Refuerzos de vacunas
                </h2>
                <p className="text-xs text-muted-foreground">
                  De las mascotas con cita este día, con refuerzo vencido o dentro de {DIAS_AVISO_VACUNA} días.
                </p>
              </div>

              {mascotasDelDia.length === 0 ? (
                <p className="rounded-xl border border-dashed border-input bg-secondary/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  No hay mascotas con cita este día.
                </p>
              ) : cargandoVacunas && refuerzos.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Revisando vacunas...
                </p>
              ) : refuerzos.length === 0 ? (
                <p className="rounded-xl border border-dashed border-input bg-secondary/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  Sin refuerzos pendientes.
                </p>
              ) : (
                <ul className="space-y-2">
                  {refuerzos.map((r) => (
                    <li key={r.clave} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2">
                      <span className="min-w-0 text-sm">
                        <span className="font-medium">{r.mascota}</span>{" "}
                        <span className="text-muted-foreground">· {r.vacuna}</span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          r.dias < 0 ? "bg-destructive/10 text-destructive" : "bg-accent/25 text-accent-foreground",
                        )}
                      >
                        {textoDias(r.dias)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-base font-semibold">Accesos rápidos</h2>
              <div className="grid grid-cols-2 gap-2">
                <Acceso href="/dashboard/agenda/nueva" icon={CalendarPlus} label="Nueva cita" />
                <Acceso href="/dashboard/pacientes/nuevo" icon={PawPrint} label="Nuevo paciente" />
                <Acceso href="/dashboard/recetas" icon={FileText} label="Nueva receta" />
                <Acceso href="/dashboard/boletas" icon={Receipt} label="Boletas" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {citaEditando && (
        <EditarCitaDialog
          key={citaEditando.id}
          cita={citaEditando}
          onClose={() => setCitaEditando(null)}
          onGuardada={(actualizada) =>
            setCitasPorSemana((prev) => ({
              ...prev,
              [inicioSemana]: (prev[inicioSemana] ?? []).map((c) => (c.id === actualizada.id ? actualizada : c)),
            }))
          }
        />
      )}

      {aceptando && (
        <AceptarSolicitudDialog
          solicitud={aceptando}
          onClose={() => setAceptando(null)}
          onAceptada={(id) => setSolicitudes((prev) => prev.filter((s) => s.id !== id))}
        />
      )}
    </div>
  );
}

function ResumenCard({
  icon: Icon,
  titulo,
  valor,
  detalle,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  titulo: string;
  valor: string;
  detalle: string;
  href?: string;
}) {
  const contenido = (
    <CardContent className="flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{titulo}</p>
        <p className="text-2xl font-semibold leading-tight">{valor}</p>
        <p className="truncate text-xs text-muted-foreground">{detalle}</p>
      </div>
    </CardContent>
  );

  return href ? (
    <Link href={href} className="block transition-colors hover:[&>div]:bg-secondary/30">
      <Card>{contenido}</Card>
    </Link>
  ) : (
    <Card>{contenido}</Card>
  );
}

function Acceso({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/40"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </Link>
  );
}
