import { Suspense } from "react";
import type { Metadata } from "next";

import { DocumentoLegal } from "@/components/legal/documento-legal";
import { TERMINOS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos y Condiciones · VetManager",
};

export default function Pagina() {
  return (
    <Suspense fallback={null}>
      <DocumentoLegal contenido={TERMINOS} clave="terminos" />
    </Suspense>
  );
}
