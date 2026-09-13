import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Paciente } from "@/lib/types";

export function PacientesTable({ pacientes }: { pacientes: Paciente[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Especie / Raza</TableHead>
          <TableHead>Sexo</TableHead>
          <TableHead>Dueño</TableHead>
          <TableHead>Microchip</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pacientes.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.nombre}</TableCell>
            <TableCell>
              {p.especie} · {p.raza}
            </TableCell>
            <TableCell>{p.sexo}</TableCell>
            <TableCell>{p.duenoNombre}</TableCell>
            <TableCell>{p.microchip ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
