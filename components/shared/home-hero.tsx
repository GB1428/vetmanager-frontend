import { PawPrint, Clock3, Stethoscope, ShieldCheck } from "lucide-react";

const bullets = [
  { icon: Clock3, label: "Respuesta a la brevedad" },
  { icon: Stethoscope, label: "Equipo veterinario a cargo" },
  { icon: ShieldCheck, label: "Datos tratados con confidencialidad" },
];

export function HomeHero() {
  return (
    <div className="relative hidden overflow-hidden bg-primary px-12 py-16 text-primary-foreground lg:flex lg:w-[46%] lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0 bg-paw-pattern" />

      <PawPrint
        className="pointer-events-none absolute -right-10 top-16 h-40 w-40 rotate-12 text-primary-foreground/10"
        strokeWidth={1}
      />
      <PawPrint
        className="pointer-events-none absolute bottom-24 left-[-2rem] h-28 w-28 -rotate-[24deg] text-primary-foreground/10"
        strokeWidth={1}
      />
      <PawPrint
        className="pointer-events-none absolute right-16 bottom-10 h-16 w-16 rotate-45 text-primary-foreground/10"
        strokeWidth={1}
      />

      <div className="relative flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15">
          <PawPrint className="h-4 w-4" />
        </div>
        <span className="font-medium">VetManager</span>
      </div>

      <div className="relative space-y-5">
        <h1 className="font-display text-4xl italic leading-tight text-primary-foreground xl:text-5xl">
          Cuando tu mascota
          <br />
          te necesita, nosotros
          <br />
          estamos primero.
        </h1>
        <p className="max-w-sm text-sm text-primary-foreground/75">
          Cuéntanos qué está pasando y un miembro de nuestro equipo revisará tu
          solicitud lo antes posible.
        </p>
      </div>

      <ul className="relative space-y-3 text-sm text-primary-foreground/85">
        {bullets.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10">
              <Icon className="h-4 w-4" />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
