import { Suspense } from "react";
import type { Metadata } from "next";

import { DocumentoLegal } from "@/components/legal/documento-legal";
import { PRIVACIDAD } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidad · VetManager",
};

export default function Pagina() {
  return (
    <Suspense fallback={null}>
      <DocumentoLegal contenido={PRIVACIDAD} clave="privacidad" />
    </Suspense>
  );
}
