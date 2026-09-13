import Link from "next/link";
import { Check, Plus } from "lucide-react";

export function MascotaToggle() {
  return (
    <div className="inline-flex rounded-full bg-secondary/60 p-1">
      <span className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
        <Check className="h-3.5 w-3.5" />
        Mascota Existente
      </span>
      <Link
        href="/dashboard/pacientes"
        className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Mascota Nueva
      </Link>
    </div>
  );
}
