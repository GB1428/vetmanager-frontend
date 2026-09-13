"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Inbox,
  Calendar,
  PawPrint,
  User,
  FolderOpen,
  Syringe,
  Receipt,
  BarChart3,
  Users,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getSolicitudesPendientesCount } from "@/lib/solicitudes-storage";

const links = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/solicitudes", label: "Solicitudes", icon: Inbox },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: PawPrint },
  { href: "/dashboard/duenos", label: "Dueños", icon: User },
  { href: "/dashboard/expedientes", label: "Expedientes", icon: FolderOpen },
  { href: "/dashboard/vacunas", label: "Vacunas", icon: Syringe },
  { href: "/dashboard/boletas", label: "Boletas", icon: Receipt },
  { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    setPendientes(getSolicitudesPendientesCount());
  }, [pathname]);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <PawPrint className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold">VetManager</span>
      </div>

      <div className="p-2">
        <Link
          href="/dashboard/agenda/nueva"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Agregar nueva cita
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2 pt-0">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {href === "/dashboard/solicitudes" && pendientes > 0 && (
                <span
                  className={cn(
                    "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {pendientes}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
