import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Dueno } from "@/lib/types";

export function DuenosTable({ duenos }: { duenos: Dueno[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>RUT</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Dirección</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {duenos.map((d) => (
          <TableRow key={d.id}>
            <TableCell className="font-medium">{d.nombre}</TableCell>
            <TableCell>{d.rut}</TableCell>
            <TableCell>{d.telefono}</TableCell>
            <TableCell>{d.correo ?? "—"}</TableCell>
            <TableCell>{d.direccion ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
