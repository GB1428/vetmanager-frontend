export type Paciente = {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  fechaNacimiento?: string;
  pesoKg?: number;
  microchip?: string;
  duenoNombre: string;
};

export type Dueno = {
  id: string;
  nombre: string;
  rut: string;
  telefono: string;
  correo?: string;
  direccion?: string;
};

export type Solicitud = {
  id: string;
  nombreDueno: string;
  rut: string;
  mascota: string;
  telefono: string;
  correo: string;
  direccion: string;
  motivo: string;
  estado: "pendiente" | "aceptada" | "rechazada";
  fechaCreacion: string; // ISO
};
