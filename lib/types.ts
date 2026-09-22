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
  duenoId?: string;
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
  fechaCreacion: string;
};

export type Cita = {
  id: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
  mascotaId?: string;
  mascotaNombre: string;
  duenoId?: string;
  duenoNombre: string;
};

export type Boleta = {
  id: string;
  idBoleta: number;
  idCita?: number;
  idDueno: number;
  duenoNombre: string;
  pacienteNombre: string;
  montoTotal: number;
  estadoPago?: string;
  metodoPago?: string;
  fecha?: string;
};
