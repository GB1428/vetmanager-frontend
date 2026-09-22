export function Footer() {
  return (
    <footer className="border-t bg-background px-6 py-3 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} VetManager · Planificador de Recursos de Veterinaria
    </footer>
  );
}
