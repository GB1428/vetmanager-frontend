"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Download,
  Search,
  TrendingUp,
  Clock,
  PawPrint,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { crearBoleta } from "@/lib/api";
import type { Boleta, Dueno, Cita } from "@/lib/types";

const PAGINA_TAMANO = 10;

function formatMonto(monto: number) {
  return `$${monto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatFecha(fechaISO?: string) {
  if (!fechaISO) return "—";
  const [anio, mes, dia] = fechaISO.slice(0, 10).split("-").map(Number);
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  if (!anio || !mes || !dia) return fechaISO;
  return `${dia} ${meses[mes - 1]} ${anio}`;
}

function esPago(b: Boleta) {
  return (b.estadoPago ?? "").toLowerCase().includes("pag");
}

export function BoletasView({
  boletasIniciales,
  duenos,
  citas,
}: {
  boletasIniciales: Boleta[];
  duenos: Dueno[];
  citas: Cita[];
}) {
  const [boletas, setBoletas] = useState<Boleta[]>(boletasIniciales);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "pagado" | "pendiente">("todos");
  const [pagina, setPagina] = useState(1);

  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [duenoId, setDuenoId] = useState("");
  const [citaId, setCitaId] = useState("");
  const [montoTotal, setMontoTotal] = useState("");
  const [estadoPago, setEstadoPago] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  const citasDelDueno = useMemo(
    () => citas.filter((c) => c.duenoId === duenoId),
    [citas, duenoId]
  );

  const ingresos = useMemo(
    () => boletas.filter(esPago).reduce((acc, b) => acc + b.montoTotal, 0),
    [boletas]
  );
  const pendientes = useMemo(() => boletas.filter((b) => !esPago(b)), [boletas]);
  const totalPendiente = pendientes.reduce((acc, b) => acc + b.montoTotal, 0);

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return boletas.filter((b) => {
      const coincideBusqueda =
        !termino ||
        b.id.toLowerCase().includes(termino) ||
        b.pacienteNombre.toLowerCase().includes(termino) ||
        b.duenoNombre.toLowerCase().includes(termino);
      const coincideEstado =
        estadoFiltro === "todos" || (estadoFiltro === "pagado" ? esPago(b) : !esPago(b));
      return coincideBusqueda && coincideEstado;
    });
  }, [boletas, busqueda, estadoFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGINA_TAMANO));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * PAGINA_TAMANO;
  const visibles = filtradas.slice(inicio, inicio + PAGINA_TAMANO);

  function resetFormulario() {
    setDuenoId("");
    setCitaId("");
    setMontoTotal("");
    setEstadoPago("");
    setMetodoPago("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const duenoSeleccionado = duenos.find((d) => d.id === duenoId);

    if (!duenoSeleccionado) {
      setError("Selecciona un dueño.");
      return;
    }
    const montoNumero = Number(montoTotal);
    if (!montoTotal || Number.isNaN(montoNumero) || montoNumero < 0) {
      setError("Ingresa un monto total válido.");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const citaSeleccionada = citasDelDueno.find((c) => c.id === citaId);
      const creada = await crearBoleta({
        idDueno: Number(duenoSeleccionado.id),
        idCita: citaSeleccionada ? Number(citaSeleccionada.id) : undefined,
        montoTotal: montoNumero,
        estadoPago: estadoPago.trim() || undefined,
        metodoPago: metodoPago.trim() || undefined,
      });

      const registrada: Boleta = {
        ...creada,
        duenoNombre: creada.duenoNombre !== "—" ? creada.duenoNombre : duenoSeleccionado.nombre,
        pacienteNombre:
          creada.pacienteNombre !== "—" ? creada.pacienteNombre : citaSeleccionada?.mascotaNombre ?? "—",
      };

      setBoletas((prev) => [registrada, ...prev]);
      setDialogAbierto(false);
      resetFormulario();
      setPagina(1);
    }  catch (err) {
  console.error("Error al registrar la boleta:", err);

  if (err instanceof Error) {
    console.error("Detalle del error:", err.message);
  }

  setError(
    err instanceof Error
      ? err.message
      : "No se pudo guardar la boleta.",
  );
} finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Registro de Boletas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona y revisa el historial de facturación de la clínica.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" disabled>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar
          </Button>
          <Button
            className="rounded-full"
            onClick={() => {
              resetFormulario();
              setDialogAbierto(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva Boleta
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ingresos</p>
              <p className="text-3xl font-semibold text-primary">{formatMonto(ingresos)}</p>
              <p className="text-xs text-muted-foreground">Boletas con pago registrado</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cobros Pendientes</p>
              <p className="text-3xl font-semibold text-primary">{formatMonto(totalPendiente)}</p>
              <p className="text-xs text-muted-foreground">
                {pendientes.length} boleta{pendientes.length === 1 ? "" : "s"} por cobrar
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            placeholder="Buscar por ID, Paciente o Dueño..."
            className="pl-9"
          />
        </div>
        <Select
          value={estadoFiltro}
          onValueChange={(v) => {
            setEstadoFiltro(v as typeof estadoFiltro);
            setPagina(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pagado">Pagado</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {boletas.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Receipt}
                title="Aún no hay boletas registradas"
                description="Cuando registres un cobro con “Nueva Boleta”, aparecerá aquí junto con el resto del historial de facturación."
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>ID Boleta</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado de Pago</TableHead>
                    <TableHead>Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        No se encontraron boletas con esos filtros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibles.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="whitespace-nowrap">{formatFecha(b.fecha)}</TableCell>
                        <TableCell className="whitespace-nowrap font-medium">{b.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <PawPrint className="h-3.5 w-3.5" />
                            </span>
                            <div>
                              <p className="font-medium leading-tight">{b.pacienteNombre}</p>
                              <p className="text-xs leading-tight text-muted-foreground">Dueño: {b.duenoNombre}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatMonto(b.montoTotal)}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              esPago(b) ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
                            )}
                          >
                            {b.estadoPago ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>{b.metodoPago ?? "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                <span>
                  {filtradas.length === 0
                    ? "Sin resultados"
                    : `Mostrando ${inicio + 1}-${Math.min(inicio + PAGINA_TAMANO, filtradas.length)} de ${filtradas.length} boletas`}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={paginaActual <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual >= totalPaginas}
                    className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Boleta</DialogTitle>
            <DialogDescription>Registra el cobro asociado a un dueño (y, si corresponde, a una cita).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Dueño *</Label>
              {duenos.length > 0 ? (
                <Select
                  value={duenoId}
                  onValueChange={(v) => {
                    setDuenoId(v);
                    setCitaId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un dueño" />
                  </SelectTrigger>
                  <SelectContent>
                    {duenos.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex h-10 w-full items-center rounded-lg border border-dashed border-input bg-secondary/30 px-3 text-sm text-muted-foreground">
                  No hay dueños registrados
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cita asociada (opcional)</Label>
              <Select value={citaId} onValueChange={setCitaId} disabled={!duenoId || citasDelDueno.length === 0}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !duenoId
                        ? "Selecciona primero un dueño"
                        : citasDelDueno.length === 0
                        ? "Este dueño no tiene citas"
                        : "Sin cita asociada"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {citasDelDueno.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fecha} {c.hora} · {c.mascotaNombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="boleta-monto">Monto Total *</Label>
              <Input
                id="boleta-monto"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 45.00"
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="boleta-estado">Estado de Pago</Label>
                <Input
                  id="boleta-estado"
                  placeholder="Ej: PAGADO"
                  value={estadoPago}
                  onChange={(e) => setEstadoPago(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boleta-metodo">Método de Pago</Label>
                <Input
                  id="boleta-metodo"
                  placeholder="Ej: EFECTIVO"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full rounded-full" disabled={guardando}>
              {guardando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar Boleta
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
