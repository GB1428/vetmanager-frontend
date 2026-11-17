"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, FileImage, FileText, FlaskConical, Loader2, PawPrint, Search, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { SubirExamenDialog } from "@/components/examenes/subir-examen-dialog";
import { CATEGORIAS_EXAMEN } from "@/lib/constants";
import { formatearFechaCorta, hoyLocalISO } from "@/lib/fechas";
import { listarExamenes, subirExamen } from "@/lib/api";
import { formatearBytes, optimizarImagen } from "@/lib/imagenes";
import { mensajeParaUsuario } from "@/lib/errors";
import { cn } from "@/lib/utils";
import type { CategoriaExamen, Examen, Paciente } from "@/lib/types";

// el back rechaza archivos de mas de 10MB. las imagenes se pueden elegir de hasta 25MB porque
// se reducen al convertirlas a webp; despues de convertir se vuelve a revisar el limite de 10MB
const TAMANO_MAXIMO_BACK = 10 * 1024 * 1024;
const TAMANO_MAXIMO_IMAGEN_ORIGINAL = 25 * 1024 * 1024;
const EXTENSIONES = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

const ESTILO_CATEGORIA: Record<CategoriaExamen, string> = {
  sangre: "bg-emerald-100 text-emerald-700",
  radiografia: "bg-secondary text-muted-foreground",
  ecografia: "bg-accent/20 text-accent-foreground",
  general: "bg-secondary text-muted-foreground",
};

function etiquetaCategoria(c: CategoriaExamen): string {
  return CATEGORIAS_EXAMEN.find((x) => x.value === c)?.label ?? c;
}

function esArchivoValido(a: File): boolean {
  const nombre = a.name.toLowerCase();
  if (!EXTENSIONES.some((ext) => nombre.endsWith(ext))) return false;
  const limite = nombre.endsWith(".pdf") ? TAMANO_MAXIMO_BACK : TAMANO_MAXIMO_IMAGEN_ORIGINAL;
  return a.size <= limite;
}

export function ExamenesView({ pacientes }: { pacientes: Paciente[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [filtro, setFiltro] = useState<"todos" | CategoriaExamen>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const [pendientes, setPendientes] = useState<File[]>([]);
  const [errorArchivos, setErrorArchivos] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const cargarExamenes = useCallback(async () => {
    try {
      setExamenes(await listarExamenes());
      setErrorCarga(null);
    } catch (err) {
      console.error("Error al cargar exámenes:", err);
      setErrorCarga(mensajeParaUsuario(err, "No se pudieron cargar los exámenes."));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarExamenes();
  }, [cargarExamenes]);

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return examenes.filter(
      (e) =>
        (filtro === "todos" || e.categoria === filtro) &&
        (!termino || e.pacienteNombre.toLowerCase().includes(termino)),
    );
  }, [examenes, filtro, busqueda]);

  function recibirArchivos(lista: FileList | null) {
    if (!lista || lista.length === 0) return;
    const archivos = Array.from(lista);
    const validos = archivos.filter(esArchivoValido);

    if (validos.length < archivos.length) {
      setErrorArchivos("Solo se aceptan PDF (hasta 10MB) e imágenes JPG, PNG o WebP (hasta 25MB).");
    } else {
      setErrorArchivos(null);
    }
    if (validos.length > 0) setPendientes(validos);
  }

  async function confirmarSubida(datos: { pacienteId: string; categoria: CategoriaExamen }): Promise<string | null> {
    const fallidos: File[] = [];
    const mensajes: string[] = [];
    let subidos = 0;

    for (const original of pendientes) {
      try {
        const { archivo } = await optimizarImagen(original);
        if (archivo.size > TAMANO_MAXIMO_BACK) {
          throw new Error(`pesa ${formatearBytes(archivo.size)} y el máximo es 10MB`);
        }
        await subirExamen({
          archivo,
          idMascota: datos.pacienteId,
          categoria: datos.categoria,
          fecha: hoyLocalISO(),
        });
        subidos += 1;
      } catch (err) {
        fallidos.push(original);
        mensajes.push(`${original.name}: ${mensajeParaUsuario(err, "no se pudo subir")}`);
      }
    }

    if (subidos > 0) await cargarExamenes();

    if (fallidos.length === 0) {
      setPendientes([]);
      return null;
    }
    // quedan solo los que fallaron para poder reintentar
    setPendientes(fallidos);
    return mensajes.join(" · ");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Exámenes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sube y consulta resultados de laboratorio, radiografías y ecografías de tus pacientes.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          recibirArchivos(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-[2.5rem] border-2 border-dashed bg-card px-6 py-12 text-center transition-colors",
          arrastrando ? "border-primary bg-primary/5" : "border-input",
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-semibold">Arrastra y suelta archivos aquí</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Sube resultados de laboratorio, radiografías, ecografías u otros documentos médicos.
        </p>
        <Button type="button" className="rounded-full" onClick={() => inputRef.current?.click()}>
          Explorar Archivos
        </Button>
        <p className="text-xs text-muted-foreground">PDF (máx. 10MB), JPG, PNG o WebP. Las imágenes se convierten a WebP al subirlas.</p>
        {errorArchivos && <p className="text-sm text-destructive">{errorArchivos}</p>}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            recibirArchivos(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[{ value: "todos" as const, label: "Todos" }, ...CATEGORIAS_EXAMEN].map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFiltro(c.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                filtro === c.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-secondary",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por paciente"
            className="rounded-full pl-9"
          />
        </div>
      </div>

      {errorCarga && <p className="text-sm text-destructive">{errorCarga}</p>}

      {cargando ? (
        <p className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando exámenes...
        </p>
      ) : examenes.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Aún no hay exámenes"
          description="Cuando subas archivos aparecerán aquí, ordenados por tipo y paciente."
        />
      ) : visibles.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No se encontraron exámenes con esos filtros.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibles.map((e) => (
            <li key={e.id} className="rounded-[2rem] border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    e.tipoArchivo === "pdf" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                  )}
                >
                  {e.tipoArchivo === "pdf" ? <FileText className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
                </span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", ESTILO_CATEGORIA[e.categoria])}>
                  {etiquetaCategoria(e.categoria)}
                </span>
              </div>
              {e.tipoArchivo === "imagen" && e.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.url} alt={e.nombreArchivo} loading="lazy" className="mt-4 h-32 w-full rounded-xl object-cover" />
              )}
              <p className="mt-4 truncate text-sm font-semibold" title={e.nombreArchivo}>
                {e.nombreArchivo}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <PawPrint className="h-3 w-3" />
                Paciente: {e.pacienteNombre}
              </p>
              <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>{formatearFechaCorta(e.fecha)}</span>
                {e.url && (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    Abrir
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendientes.length > 0 && (
        <SubirExamenDialog
          archivos={pendientes}
          pacientes={pacientes}
          onClose={() => setPendientes([])}
          onConfirmar={confirmarSubida}
        />
      )}
    </div>
  );
}
