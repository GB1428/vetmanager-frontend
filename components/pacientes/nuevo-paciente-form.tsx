"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  UserPlus,
  Search,
  PawPrint,
  ClipboardList,
  Save,
  CheckCircle2,
  Info,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptionRadioCard } from "@/components/shared/option-radio-card";
import { PhotoUpload } from "@/components/pacientes/photo-upload";

const alergiasSugeridas = ["Sin alergias conocidas", "Penicilina", "DAPP (Pulgas)"];

export function NuevoPacienteForm() {
  const [alergias, setAlergias] = useState("");
  const [especie, setEspecie] = useState("perro");
  const [sexo, setSexo] = useState("macho-castrado");

  function agregarAlergia(tag: string) {
    setAlergias((prev) => (prev.trim().length === 0 ? tag : `${prev}, ${tag}`));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: mandar esto al backend
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav className="text-xs text-muted-foreground">
            <Link href="/dashboard/pacientes" className="hover:text-foreground">
              Pacientes
            </Link>
            <span className="mx-1">/</span>
            <span>Nuevo Registro</span>
          </nav>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">Registro de Mascota Nueva</h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              Formulario Clínico
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Completa los datos del paciente y vincula a su tutor responsable.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/dashboard/pacientes">Cancelar</Link>
          </Button>
          <Button type="submit" form="nuevo-paciente-form" className="rounded-full">
            <Save className="mr-1.5 h-4 w-4" />
            Guardar Paciente
          </Button>
        </div>
      </div>

      <form id="nuevo-paciente-form" onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Tutor Responsable */}
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-semibold">1. Tutor Responsable</h2>
            </div>
            <p className="pl-10 text-sm text-muted-foreground">
              Selecciona si la mascota pertenece a un cliente ya registrado o no tiene dueño todavía.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tipo de asignación de tutor
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionRadioCard
                icon={Search}
                title="Elegir Dueño Existente"
                description="Vincular a un cliente ya ingresado en el sistema"
                selected
              />
              <OptionRadioCard
                icon={UserPlus}
                title="No hay Dueño"
                description="Te llevamos al formulario para registrar al tutor primero"
                selected={false}
                href="/dashboard/duenos/nuevo"
              />
            </div>

            <div className="space-y-2">
              <Label>Buscar y seleccionar tutor registrado *</Label>
              <div className="flex h-10 w-full items-center rounded-lg border border-dashed border-input bg-secondary/30 px-3 text-sm text-muted-foreground">
                No hay tutores registrados todavía
              </div>
              <p className="text-xs text-muted-foreground">
                Si el dueño no está en el sistema, usa la opción &quot;No hay Dueño&quot; de arriba para crearlo primero.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Identificación del Paciente */}
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PawPrint className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-semibold">2. Identificación del Paciente</h2>
            </div>
            <p className="pl-10 text-sm text-muted-foreground">Información biológica y clínica básica del animal.</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
              <div className="space-y-2">
                <PhotoUpload />
                <p className="text-center text-xs text-muted-foreground">Opcional</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mascota-nombre">Nombre de la Mascota *</Label>
                  <Input id="mascota-nombre" name="mascotaNombre" placeholder="Ej: Thor, Kira, Rocky" required />
                </div>
                <div className="space-y-2">
                  <Label>Especie *</Label>
                  <Select value={especie} onValueChange={setEspecie}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perro">Perro</SelectItem>
                      <SelectItem value="gato">Gato</SelectItem>
                      <SelectItem value="caballo">Caballo</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mascota-raza">Raza *</Label>
                  <Input id="mascota-raza" name="mascotaRaza" placeholder="Ej: Mestizo, Beagle, Siamés" required />
                </div>
                <div className="space-y-2">
                  <Label>Sexo y Esterilización *</Label>
                  <Select value={sexo} onValueChange={setSexo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="macho">Macho</SelectItem>
                      <SelectItem value="macho-castrado">Macho - Castrado / Esterilizado</SelectItem>
                      <SelectItem value="hembra">Hembra</SelectItem>
                      <SelectItem value="hembra-esterilizada">Hembra - Esterilizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mascota-nacimiento">Fecha de Nacimiento (Aprox.)</Label>
                  <Input id="mascota-nacimiento" name="mascotaFechaNacimiento" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mascota-peso">Peso Inicial (Kg) *</Label>
                  <Input
                    id="mascota-peso"
                    name="mascotaPesoKg"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Ej: 14.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mascota-microchip">Número de Microchip</Label>
                  <Input id="mascota-microchip" name="mascotaMicrochip" placeholder="Ej: 981020002849182" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mascota-color">Color y Señas Particulares</Label>
                  <Input
                    id="mascota-color"
                    name="mascotaColor"
                    placeholder="Ej: café dorado con mancha blanca en el pecho"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Antecedentes Médicos y Alergias */}
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ClipboardList className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-semibold">3. Antecedentes Médicos y Alergias</h2>
            </div>
            <p className="pl-10 text-sm text-muted-foreground">
              Registra alertas sobre alergias conocidas, patologías previas o tratamientos.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="alergias">Alergias o Reacciones Conocidas</Label>
                  <span className="text-xs text-muted-foreground">Opcional</span>
                </div>
                <Textarea
                  id="alergias"
                  name="alergias"
                  value={alergias}
                  onChange={(e) => setAlergias(e.target.value)}
                  placeholder="Ej: ojo con la penicilina, se rasca harto con las pulgas..."
                  className="min-h-[90px]"
                />
                <div className="flex flex-wrap gap-2">
                  {alergiasSugeridas.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => agregarAlergia(tag)}
                      className="rounded-full border border-input px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="motivo-ingreso">Motivo de Ingreso / Primera Consulta</Label>
                  <span className="text-xs text-muted-foreground">Opcional</span>
                </div>
                <Textarea
                  id="motivo-ingreso"
                  name="motivoIngreso"
                  placeholder="Ej: vino por sus vacunas, se veía un poco decaído, revisar en 2 semanas"
                  className="min-h-[90px]"
                />
                <p className="text-xs text-muted-foreground">
                  Piénsalo como una nota rápida para el primer control, no tiene que ser formal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 rounded-xl border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Los campos marcados con (*) son obligatorios para generar la ficha clínica.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/dashboard/pacientes">Cancelar</Link>
            </Button>
            <Button type="submit" className="rounded-full">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Registrar Mascota
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
