"use client";

import { useEffect, useState } from "react";

export function Header() {
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem("usuario");
      if (guardado) {
        const usuario = JSON.parse(guardado) as { nombre?: string };
        if (usuario.nombre) setNombre(usuario.nombre);
      }
    } catch {}
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <span className="font-semibold">VetManager</span>
      <span className="text-sm text-muted-foreground">
        Bienvenido/a de nuevo{nombre ? `, ` : ""}
        {nombre && <span className="font-semibold text-foreground">{nombre}</span>}
      </span>
    </header>
  );
}
