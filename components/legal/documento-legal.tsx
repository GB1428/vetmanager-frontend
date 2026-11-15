"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, PawPrint } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DocumentoLegalContenido } from "@/lib/legal";

export function DocumentoLegal({
  contenido,
  clave,
}: {
  contenido: DocumentoLegalContenido;
  clave: "terminos" | "privacidad";
}) {
  const router = useRouter();
  const desdeFormulario = useSearchParams().get("desde") === "emergencia";
  const [acepto, setAcepto] = useState(false);

  function volverAlFormulario(aceptado: boolean) {
    try {
      if (aceptado) sessionStorage.setItem(`emergencia:acepto:${clave}`, "1");
      sessionStorage.setItem("emergencia:reabrir", "1");
    } catch {}
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <PawPrint className="h-4 w-4 text-primary-foreground" />
            </span>
            VetManager
          </Link>
          {desdeFormulario ? (
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => volverAlFormulario(false)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Volver
              </Link>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <article className="rounded-2xl border bg-background p-6 shadow-sm sm:p-10">
          <h1 className="font-display text-3xl">{contenido.titulo}</h1>
          <p className="mt-1 text-xs text-muted-foreground">Última actualización: {contenido.actualizado}</p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{contenido.intro}</p>

          {contenido.destacado && (
            <aside className="mt-6 rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
              <h2 className="text-base font-semibold text-primary">{contenido.destacado.titulo}</h2>
              <div className="mt-2 space-y-2">
                {contenido.destacado.parrafos.map((p) => (
                  <p key={p} className="text-sm font-medium leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </aside>
          )}

          <div className="mt-8 space-y-6">
            {contenido.secciones.map((s) => (
              <section key={s.titulo} className="space-y-2">
                <h2 className="text-base font-semibold">{s.titulo}</h2>
                {s.parrafos.map((p) => (
                  <p key={p} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>

          {desdeFormulario && (
            <div className="mt-10 space-y-4 border-t pt-6">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={acepto}
                  onChange={(e) => setAcepto(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span>He leído y acepto {clave === "terminos" ? "los Términos y Condiciones" : "la Política de Privacidad"}.</span>
              </label>
              <Button className="w-full rounded-full sm:w-auto" disabled={!acepto} onClick={() => volverAlFormulario(true)}>
                Aceptar y volver al formulario
              </Button>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
