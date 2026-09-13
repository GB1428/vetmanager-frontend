"use client";

import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type TipoConsultaCardProps = {
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
};

export function TipoConsultaCard({ label, icon: Icon, selected, onSelect }: TipoConsultaCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border-2 bg-secondary/40 px-4 py-6 text-center transition-colors",
        selected ? "border-primary bg-primary/5" : "border-transparent hover:bg-secondary/70"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          selected ? "bg-primary text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
