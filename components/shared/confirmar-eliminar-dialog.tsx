"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mensajeParaUsuario } from "@/lib/errors";

// confirmacion antes de borrar algo. onConfirmar hace el borrado (y lo que haya que actualizar
// en pantalla); si lanza error se muestra aca y el dialogo queda abierto para reintentar.
export function ConfirmarEliminarDialog({
  titulo,
  children,
  etiquetaConfirmar = "Eliminar",
  onConfirmar,
  onClose,
}: {
  titulo: string;
  children: React.ReactNode;
  etiquetaConfirmar?: string;
  onConfirmar: () => Promise<void>;
  onClose: () => void;
}) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    setEliminando(true);
    setError(null);
    try {
      await onConfirmar();
      onClose();
    } catch (err) {
      console.error("No se pudo eliminar:", err);
      setError(mensajeParaUsuario(err, "No se pudo eliminar, intenta de nuevo."));
      setEliminando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !eliminando && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {titulo}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose} disabled={eliminando}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" className="rounded-full" onClick={confirmar} disabled={eliminando}>
            {eliminando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {etiquetaConfirmar}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
