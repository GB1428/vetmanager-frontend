import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VistaPendiente({ titulo }: { titulo: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Contenido próximamente.</CardContent>
    </Card>
  );
}
