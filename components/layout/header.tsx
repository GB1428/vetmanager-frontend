import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <span className="font-semibold">VetManager</span>
      <Button variant="outline" size="sm" disabled>
        Iniciar sesión
      </Button>
    </header>
  );
}
