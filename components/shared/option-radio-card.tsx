"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type OptionRadioCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onSelect?: () => void;
  href?: string;
};

export function OptionRadioCard({ icon: Icon, title, description, selected, onSelect, href }: OptionRadioCardProps) {
  const className = cn(
    "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors",
    selected ? "border-primary bg-primary/5" : "border-input hover:bg-secondary/50"
  );

  const content = (
    <>
      <span
        className={cn(
          "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary" : "border-muted-foreground/40"
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <div className="space-y-1">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </span>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onSelect} className={className}>
      {content}
    </button>
  );
}
