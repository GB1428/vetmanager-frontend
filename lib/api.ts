import { API_URL, NEGOCIO_ID } from "@/lib/config";
import type { Paciente, Dueno, Solicitud, Cita, Boleta } from "@/lib/types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const cuerpo = await res.text().catch(() => "");
    throw new Error(cuerpo || `Error ${res.status} al llamar ${path}`);
  }

  const texto = await res.text();
  return texto ? (JSON.parse(texto) as T) : (undefined as T);
}

type DuenoBackend = {
  id_dueno: number;
  rut: string;
  nombre_completo: string;
  telefono: string;
  correo: string;
  direccion: string;
};

function mapDueno(d: DuenoBackend): Dueno {
  return {
    id: String(d.id_dueno),
    nombre: d.nombre_completo,
    rut: d.rut,
    telefono: d.telefono,
    correo: d.correo,
    direccion: d.direccion,
  };
}

export async function listarDuenos(): Promise<Dueno[]> {
  const data = await request<DuenoBackend[]>("/duenos?negocioId=1");
  return data.map(mapDueno);
}

export async function crearDueno(datos: {
  nombre: string;
  rut: string;
  telefono: string;
  correo: string;
  direccion: string;
}): Promise<Dueno> {
  const creado = await request<DuenoBackend>("/duenos/1", {
    method: "POST",
    body: JSON.stringify({
      rut: datos.rut,
      nombre_completo: datos.nombre,
      telefono: datos.telefono,
      correo: datos.correo,
      direccion: datos.direccion,
      negocioId: { negocioId: NEGOCIO_ID },
    }),
  });
  return mapDueno(creado);
}

type EspecieBackend = {
  id_especie: number;
  nombre_especie: string;
};

type RazaBackend = {
  id_raza: number;
  nombre_raza: string;
};

export async function listarEspecies(): Promise<EspecieBackend[]> {
  return request<EspecieBackend[]>("/especies");
}

export async function listarRazas(): Promise<RazaBackend[]> {
  return request<RazaBackend[]>("/razas");
}

function normalizarTexto(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function buscarReferenciasMascota(
  nombreEspecie: string,
  nombreRaza: string,
): Promise<{ idEspecie: number; idRaza: number }> {
  const [especies, razas] = await Promise.all([
    listarEspecies(),
    listarRazas(),
  ]);

  const especie = especies.find(
    (item) =>
      normalizarTexto(item.nombre_especie) === normalizarTexto(nombreEspecie),
  );

  if (!especie) {
    throw new Error(
      `La especie "${nombreEspecie}" no existe en la base de datos.`,
    );
  }

  const raza = razas.find(
    (item) => normalizarTexto(item.nombre_raza) === normalizarTexto(nombreRaza),
  );

  if (!raza) {
    throw new Error(`La raza "${nombreRaza}" no existe en la base de datos.`);
  }

  return {
    idEspecie: especie.id_especie,
    idRaza: raza.id_raza,
  };
}

type MascotaBackend = {
  id_mascota: number;
  nombre: string;
  especie?: string;
  raza?: string;
  id_especie?: { id_especie: number; nombre?: string };
  id_raza?: { id_raza: number; nombre?: string };
  sexo: string;
  fecha_nacimiento: string | null;
  peso: number;
  microchip: number | null;
  dueno?: DuenoBackend;
};

function mapPaciente(m: MascotaBackend): Paciente {
  return {
    id: String(m.id_mascota),
    nombre: m.nombre,
    especie: m.especie ?? m.id_especie?.nombre ?? "—",
    raza: m.raza ?? m.id_raza?.nombre ?? "—",
    sexo: m.sexo,
    fechaNacimiento: m.fecha_nacimiento ?? undefined,
    pesoKg: m.peso,
    microchip: m.microchip != null ? String(m.microchip) : undefined,
    duenoNombre: m.dueno?.nombre_completo ?? "—",
    duenoId: m.dueno?.id_dueno != null ? String(m.dueno.id_dueno) : undefined,
  };
}

export async function listarPacientes(): Promise<Paciente[]> {
  const data = await request<MascotaBackend[]>("/mascotas");
  return data.map(mapPaciente);
}

export async function crearPaciente(datos: {
  nombre: string;
  especie: string;
  raza: string;
  idEspecie: number;
  idRaza: number;
  sexo: string;
  fechaNacimiento?: string;
  pesoKg: number;
  microchip?: number;
  observaciones?: string;
  antecedentes?: string;
  alergias?: string;
  idDueno: number;
}): Promise<Paciente> {
  const creado = await request<MascotaBackend>("/mascotas", {
    method: "POST",
    body: JSON.stringify({
      nombre: datos.nombre,
      especie: datos.especie,
      raza: datos.raza,

      id_especie: {
        id_especie: datos.idEspecie,
      },

      id_raza: {
        id_raza: datos.idRaza,
      },

      sexo: datos.sexo,
      fecha_nacimiento: datos.fechaNacimiento || undefined,
      peso: datos.pesoKg,
      microchip: datos.microchip,
      observaciones: datos.observaciones,
      antecedentes: datos.antecedentes,
      alergias: datos.alergias,

      id_dueno: {
        id_dueno: datos.idDueno,
      },
    }),
  });

  return mapPaciente(creado);
}

type ContactoBackend = {
  id_contacto: number;
  razon_consulta: string;
  nom_mascota: string;
  estado: string;
  fecha_solicitud: string;
  dueno?: DuenoBackend;
};

function mapSolicitud(c: ContactoBackend): Solicitud {
  const estado = (c.estado || "pendiente").toLowerCase();
  return {
    id: String(c.id_contacto),
    nombreDueno: c.dueno?.nombre_completo ?? "—",
    rut: c.dueno?.rut ?? "—",
    mascota: c.nom_mascota,
    telefono: c.dueno?.telefono ?? "—",
    correo: c.dueno?.correo ?? "—",
    direccion: c.dueno?.direccion ?? "—",
    motivo: c.razon_consulta,
    estado:
      estado === "aceptada" || estado === "rechazada" ? estado : "pendiente",
    fechaCreacion: c.fecha_solicitud,
  };
}

export async function listarSolicitudes(): Promise<Solicitud[]> {
  const data = await request<ContactoBackend[]>(
    "/contacto-emergencia?negocioId=1",
  );
  return data.map(mapSolicitud);
}

export async function crearSolicitud(datos: {
  nombreDueno: string;
  rut: string;
  mascota: string;
  telefono: string;
  correo: string;
  direccion: string;
  motivo: string;
}): Promise<Solicitud> {
  const creada = await request<ContactoBackend>("/contacto-emergencia", {
    method: "POST",
    body: JSON.stringify({
      razon_consulta: datos.motivo,
      nom_mascota: datos.mascota,
      negocioId: { negocioId: NEGOCIO_ID },
      dueno: {
        rut: datos.rut,
        nombre_completo: datos.nombreDueno,
        telefono: datos.telefono,
        correo: datos.correo,
        direccion: datos.direccion,
      },
    }),
  });
  return mapSolicitud(creada);
}

export async function actualizarEstadoSolicitud(
  id: string,
  estado: Solicitud["estado"],
): Promise<Solicitud> {
  const actualizada = await request<ContactoBackend>(
    `/contacto-emergencia/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    },
  );
  return mapSolicitud(actualizada);
}

type CitaBackend = {
  id_cita: number;
  fecha_hora: string;

  motivo: string;
  estado: string;
  mascota?: MascotaBackend;
  dueno?: DuenoBackend;
};
function separarFechaHora(fechaHora: string): {
  fecha: string;
  hora: string;
} {
  const fecha = new Date(fechaHora);

  return {
    fecha: fecha.toISOString().slice(0, 10),
    hora: fecha.toISOString().slice(11, 16),
  };
}
function mapCita(c: CitaBackend): Cita {
  const fechaHora = separarFechaHora(c.fecha_hora);

  return {
    id: String(c.id_cita),
    fecha: fechaHora.fecha,
    hora: fechaHora.hora,
    motivo: c.motivo ?? "",
    estado: c.estado ?? "",
    mascotaId:
      c.mascota?.id_mascota != null
        ? String(c.mascota.id_mascota)
        : undefined,
    mascotaNombre: c.mascota?.nombre ?? "—",
    duenoId:
      c.dueno?.id_dueno != null
        ? String(c.dueno.id_dueno)
        : undefined,
    duenoNombre: c.dueno?.nombre_completo ?? "—",
  };
}

function calcularInstanteUtcParaHorarioChile(
  fechaISO: string,
  hora: string,
): Date {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia, horas + 3, minutos, 0));
}

function compensarDesfaseHorarioBackend(instanteUtc: Date): Date {
  const TRES_HORAS_EN_MS = 3 * 60 * 60 * 1000;
  return new Date(instanteUtc.getTime() - TRES_HORAS_EN_MS);
}

function construirFechaHoraParaBackend(fechaISO: string, hora: string): string {
  const instanteCorrecto = calcularInstanteUtcParaHorarioChile(fechaISO, hora);
  const instanteCompensado = compensarDesfaseHorarioBackend(instanteCorrecto);
  return instanteCompensado.toISOString();
}

export async function listarCitas(): Promise<Cita[]> {
  const data = await request<CitaBackend[]>("/citas?negocioId=1");
  return data.map(mapCita);
}

export async function crearCita(datos: {
  fecha: string;
  hora: string;
  motivo: string;
  idMascota: number;
  idDueno: number;
  estado?: string;
}): Promise<Cita> {
  const creada = await request<CitaBackend>("/citas/1", {
    method: "POST",
    body: JSON.stringify({
      fecha_hora: construirFechaHoraParaBackend(datos.fecha, datos.hora),
      motivo: datos.motivo,
      estado: datos.estado ?? "Pendiente",
id_mascota: {
  id_mascota: datos.idMascota,
},
id_dueno: {
  id_dueno: datos.idDueno,
},
    }),
  });
  return mapCita(creada);
}

type BoletaBackend = {
  idBoleta: number;
  idNegocio: number;
  idCita?: number;
  idDueno: number;
  montoTotal: number;
  estadoPago?: string;
  metodoPago?: string;
  fechaEmision?: string;
  dueno?: DuenoBackend;
  cita?: CitaBackend;
};

function mapBoleta(b: BoletaBackend): Boleta {
  return {
    id: `#BOL-${b.idBoleta}`,
    idBoleta: b.idBoleta,
    idCita: b.idCita ?? b.cita?.id_cita,
    idDueno: b.idDueno,
    duenoNombre:
      b.dueno?.nombre_completo ?? b.cita?.dueno?.nombre_completo ?? "—",
    pacienteNombre: b.cita?.mascota?.nombre ?? "—",
    montoTotal: b.montoTotal,
    estadoPago: b.estadoPago,
    metodoPago: b.metodoPago,
    fecha: b.fechaEmision,
  };
}

export async function listarBoletas(): Promise<Boleta[]> {
  const data = await request<BoletaBackend[]>("/boletas");
  return data.map(mapBoleta);
}

export async function crearBoleta(datos: {
  idDueno: number;
  idCita?: number;
  montoTotal: number;
  estadoPago?: string;
  metodoPago?: string;
}): Promise<Boleta> {
  const creada = await request<BoletaBackend>("/boletas", {
    method: "POST",
    body: JSON.stringify({
      idNegocio: NEGOCIO_ID,
      idCita: datos.idCita,
      idDueno: datos.idDueno,
      montoTotal: datos.montoTotal,
      estadoPago: datos.estadoPago,
      metodoPago: datos.metodoPago,
    }),
  });
  return mapBoleta(creada);
}
