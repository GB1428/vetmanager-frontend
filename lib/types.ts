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
  duenoRut?: string;
  duenoTelefono?: string;
  duenoCorreo?: string;
  duenoDireccion?: string;
  alergias?: string;
  antecedentes?: string;
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
  duenoId?: string;
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
  idMascota?: number;
  duenoNombre: string;
  pacienteNombre: string;
  montoTotal: number;
  estadoPago?: string;
  metodoPago?: string;
  fecha?: string;
};

export type Vacuna = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  especie?: string;
};

export type RegistroVacuna = {
  id: string;
  vacunaId: string;
  vacunaNombre: string;
  vacunaDescripcion: string;
  precio: number;
  lote: string;
  fechaAplicacion: string;
  proximaDosis: string;
  observaciones: string;
};

export type MedicamentoReceta = {
  uid: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  unidadDuracion: string;
  instrucciones: string;
  precio: number;
};

export type PlantillaReceta = {
  id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  unidadDuracion: string;
  instrucciones: string;
  precio: number;
  antiparasitario: boolean;
};

export type CategoriaExamen = "sangre" | "radiografia" | "ecografia" | "general";

export type Examen = {
  id: string;
  nombreArchivo: string;
  tipoArchivo: "pdf" | "imagen";
  categoria: CategoriaExamen;
  pacienteId: string;
  pacienteNombre: string;
  fecha: string;
};

export type OrigenReceta = "cita" | "paciente";

export type RecetaCreada = {
  id: string;
  origen: OrigenReceta;
  pacienteId: string;
  pacienteNombre: string;
  citaId?: string;
  citaFecha?: string;
  citaHora?: string;
  citaMotivo?: string;
  medicamentos: MedicamentoReceta[];
  recomendaciones: string;
  fecha: string;
};

export type ItemBoleta = {
  uid: string;
  concepto: string;
  precio: string;
  incluido: boolean;
  origen: "vacuna" | "manual" | "receta";
};
