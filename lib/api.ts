import { API_URL, NEGOCIO_ID } from "@/lib/config";
import type { Paciente, Dueno, Solicitud, Cita, Boleta, Vacuna, RegistroVacuna } from "@/lib/types";
import { ApiError, extraerMensajeBackend, pistaParaError } from "@/lib/errors";
import { logApiFallo, logApiOk, logInfo, logWarn } from "@/lib/logger";
import { aFechaBackend } from "@/lib/fechas";

logInfo(`API_URL = ${API_URL} | NEGOCIO_ID = ${NEGOCIO_ID}`);

// base de las llamadas al back (fetch + errores + logs)
async function ejecutar(
  path: string,
  options?: RequestInit,
): Promise<{ texto: string; status: number }> {
  const method = (options?.method ?? "GET").toUpperCase();
  const url = `${API_URL}${path}`;
  const inicio = Date.now();

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch (causa) {
    const detalle = causa instanceof Error ? causa.message : String(causa);
    const pista = pistaParaError(0, method);
    const mensaje = "No se pudo conectar con el servidor. Revisa que el backend esté corriendo.";
    logApiFallo({
      metodo: method,
      url,
      status: 0,
      ms: Date.now() - inicio,
      mensaje,
      respuesta: detalle,
      pista,
      body: options?.body,
    });
    throw new ApiError(mensaje, { status: 0, method, url, respuesta: detalle, pista });
  }

  const ms = Date.now() - inicio;
  const texto = await res.text().catch(() => "");

  if (!res.ok) {
    const mensaje = extraerMensajeBackend(texto) || `Error ${res.status} al llamar ${path}`;
    const pista = pistaParaError(res.status, method);
    logApiFallo({
      metodo: method,
      url,
      status: res.status,
      ms,
      mensaje,
      respuesta: texto,
      pista,
      body: options?.body,
    });
    throw new ApiError(mensaje, { status: res.status, method, url, respuesta: texto, pista });
  }

  logApiOk({ metodo: method, path, status: res.status, ms, body: options?.body });
  return { texto, status: res.status };
}

// igual pero parsea el json
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { texto, status } = await ejecutar(path, options);
  if (!texto) return undefined as T;

  try {
    return JSON.parse(texto) as T;
  } catch (err) {
    const method = (options?.method ?? "GET").toUpperCase();
    const pista =
      "El backend respondió 2xx pero el cuerpo no es JSON. Revisa que el controlador devuelva el objeto y no un texto.";
    logApiFallo({
      metodo: method,
      url: `${API_URL}${path}`,
      status,
      ms: 0,
      mensaje: "La respuesta del backend no es JSON válido.",
      respuesta: texto,
      pista,
    });
    throw new ApiError("La respuesta del backend no tiene el formato esperado.", {
      status,
      method,
      url: `${API_URL}${path}`,
      respuesta: texto,
      pista,
    });
  }
}

// para los patch/delete que no devuelven nada util
async function requestSinRespuesta(path: string, options?: RequestInit): Promise<void> {
  await ejecutar(path, options);
}

// evita mandar /undefined al back
function validarId(id: string | number, recurso: string): void {
  const texto = String(id);
  if (!texto || texto === "undefined" || texto === "null" || Number.isNaN(Number(texto))) {
    const mensaje = `Id inválido al actualizar ${recurso}: "${texto}".`;
    logWarn(mensaje);
    throw new Error(mensaje);
  }
}

// ---------- duenos ----------
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
  const data = await request<DuenoBackend[]>(`/duenos?negocioId=${NEGOCIO_ID}`);
  return data.map(mapDueno);
}

export async function crearDueno(datos: {
  nombre: string;
  rut: string;
  telefono: string;
  correo: string;
  direccion: string;
}): Promise<Dueno> {
  const creado = await request<DuenoBackend>(`/duenos/${NEGOCIO_ID}`, {
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

// ---------- especies y razas (se usan al crear/editar mascotas) ----------
type EspecieBackend = {
  id_especie: number;
  nombre_especie: string;
};

export async function listarEspecies(): Promise<EspecieBackend[]> {
  return request<EspecieBackend[]>("/especies");
}

// saca tildes y mayusculas para comparar nombres
function normalizarTexto(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// la raza es texto libre (se manda como string), solo la especie se busca por id
export async function buscarIdEspecie(nombreEspecie: string): Promise<number> {
  const especies = await listarEspecies();

  const especie = especies.find(
    (item) =>
      normalizarTexto(item.nombre_especie) === normalizarTexto(nombreEspecie),
  );

  if (!especie) {
    logWarn(
      `Especie "${nombreEspecie}" no encontrada. Especies disponibles en la BD:`,
      especies.map((e) => e.nombre_especie),
    );
    throw new Error(
      `La especie "${nombreEspecie}" no existe en la base de datos.`,
    );
  }

  return especie.id_especie;
}

// ---------- pacientes (mascotas) ----------
type MascotaBackend = {
  id_mascota: number;
  nombre: string;
  especie?: string;
  raza?: string;
  id_especie?: { id_especie: number; nombre?: string };
  sexo: string;
  fecha_nacimiento: string | null;
  peso: number;
  microchip: number | null;
  alergias?: string | null;
  antecedentes?: string | null;
  dueno?: DuenoBackend;
};

function mapPaciente(m: MascotaBackend): Paciente {
  return {
    id: String(m.id_mascota),
    nombre: m.nombre,
    especie: m.especie ?? m.id_especie?.nombre ?? "—",
    raza: m.raza ?? "—",
    sexo: m.sexo,
    fechaNacimiento: m.fecha_nacimiento ?? undefined,
    pesoKg: m.peso,
    microchip: m.microchip != null ? String(m.microchip) : undefined,
    duenoNombre: m.dueno?.nombre_completo ?? "—",
    duenoId: m.dueno?.id_dueno != null ? String(m.dueno.id_dueno) : undefined,
    duenoRut: m.dueno?.rut,
    duenoTelefono: m.dueno?.telefono,
    duenoCorreo: m.dueno?.correo,
    duenoDireccion: m.dueno?.direccion,
    alergias: m.alergias ?? undefined,
    antecedentes: m.antecedentes ?? undefined,
  };
}

export async function obtenerPaciente(id: string): Promise<Paciente> {
  const data = await request<MascotaBackend>(`/mascotas/${id}?negocioId=${NEGOCIO_ID}`);
  return mapPaciente(data);
}

export async function listarPacientes(): Promise<Paciente[]> {
  const data = await request<MascotaBackend[]>(`/mascotas?negocioId=${NEGOCIO_ID}`);
  return data.map(mapPaciente);
}

export async function crearPaciente(datos: {
  nombre: string;
  especie: string;
  raza: string;
  idEspecie: number;
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

// ---------- solicitudes (contacto emergencia) ----------
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
    `/contacto-emergencia?negocioId=${NEGOCIO_ID}`,
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
  const creada = await request<ContactoBackend>(`/contacto-emergencia/negocio/${NEGOCIO_ID}`, {
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
        negocioId:{negocioId:NEGOCIO_ID}
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

// ---------- citas ----------
type CitaBackend = {
  id_cita: number;
  fecha_hora: string;

  motivo: string;
  estado: string;
  mascota?: MascotaBackend;
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
  const dueno = c.mascota?.dueno;

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
      dueno?.id_dueno != null
        ? String(dueno.id_dueno)
        : undefined,

    duenoNombre: dueno?.nombre_completo ?? "—",
  };
}

// parche de horas, el back guarda las fechas con desfase
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
  const data = await request<CitaBackend[]>(`/citas/citas?negocioId=${NEGOCIO_ID}`);
  return data.map(mapCita);
}

export async function crearCita(datos: {
  fecha: string;
  hora: string;
  motivo: string;
  idMascota: number;
  estado?: string;
}): Promise<Cita> {
  const creada = await request<CitaBackend>(`/citas/${NEGOCIO_ID}`, {
    method: "POST",
    body: JSON.stringify({
      fecha_hora: construirFechaHoraParaBackend(datos.fecha, datos.hora),
      motivo: datos.motivo,
      estado: datos.estado ?? "Pendiente",
      id_mascota: {
        id_mascota: datos.idMascota,
      },
    }),
  });

  return mapCita(creada);
}

// ---------- boletas ----------
type BoletaBackend = {
  idBoleta: number;
  idNegocio: number;
  idCita?: number;
  montoTotal: number;
  estadoPago?: string;
  metodoPago?: string;
  fechaEmision?: string;
  cita?: CitaBackend;
};

function mapBoleta(b: BoletaBackend): Boleta {
  const mascota = b.cita?.mascota;
  const dueno = mascota?.dueno;

  return {
    id: `#BOL-${b.idBoleta}`,
    idBoleta: b.idBoleta,
    idCita: b.idCita ?? b.cita?.id_cita,

    idDueno: dueno?.id_dueno ?? 0,
    duenoNombre: dueno?.nombre_completo ?? "—",

    pacienteNombre: mascota?.nombre ?? "—",
    montoTotal: b.montoTotal,
    estadoPago: b.estadoPago,
    metodoPago: b.metodoPago,
    fecha: b.fechaEmision,
  };
}
export async function listarBoletas(): Promise<Boleta[]> {
  const data = await request<BoletaBackend[]>(`/boletas?negocioId=${NEGOCIO_ID}`);
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

export async function actualizarBoleta(
  idBoleta: number,
  cambios: { montoTotal?: number; estadoPago?: string; metodoPago?: string },
): Promise<void> {
  validarId(idBoleta, "la boleta");
  const body: Record<string, unknown> = {};
  if (cambios.montoTotal !== undefined) body.montoTotal = cambios.montoTotal;
  if (cambios.estadoPago !== undefined) body.estadoPago = cambios.estadoPago;
  if (cambios.metodoPago !== undefined) body.metodoPago = cambios.metodoPago;

  await requestSinRespuesta(`/boletas/${idBoleta}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ---------- updates sueltos ----------
export async function actualizarDueno(
  id: string,
  cambios: {
    nombre?: string;
    rut?: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
  },
): Promise<void> {
  validarId(id, "el dueño");
  const body: Record<string, unknown> = {};
  if (cambios.nombre !== undefined) body.nombre_completo = cambios.nombre;
  if (cambios.rut !== undefined) body.rut = cambios.rut;
  if (cambios.telefono !== undefined) body.telefono = cambios.telefono;
  if (cambios.correo !== undefined) body.correo = cambios.correo;
  if (cambios.direccion !== undefined) body.direccion = cambios.direccion;

  await requestSinRespuesta(`/duenos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function actualizarPaciente(
  id: string,
  cambios: {
    nombre?: string;
    especie?: string;
    raza?: string;
    idEspecie?: number;
    sexo?: string;
    fechaNacimiento?: string | null;
    pesoKg?: number;
    microchip?: number | null;
    idDueno?: number;
  },
): Promise<void> {
  validarId(id, "el paciente");
  const body: Record<string, unknown> = {};
  if (cambios.nombre !== undefined) body.nombre = cambios.nombre;
  if (cambios.especie !== undefined) body.especie = cambios.especie;
  if (cambios.raza !== undefined) body.raza = cambios.raza;
  if (cambios.idEspecie !== undefined) body.id_especie = { id_especie: cambios.idEspecie };
  if (cambios.sexo !== undefined) body.sexo = cambios.sexo;
  if (cambios.fechaNacimiento !== undefined) body.fecha_nacimiento = cambios.fechaNacimiento;
  if (cambios.pesoKg !== undefined) body.peso = cambios.pesoKg;
  if (cambios.microchip !== undefined) body.microchip = cambios.microchip;
  if (cambios.idDueno !== undefined) body.id_dueno = { id_dueno: cambios.idDueno };

  await requestSinRespuesta(`/mascotas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function actualizarCita(
  id: string,
  cambios: { estado?: string; motivo?: string },
): Promise<void> {
  validarId(id, "la cita");
  await requestSinRespuesta(`/citas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });
}

// ---------- aqui es vacunas ----------

// catalogo de vacunas (GET /vacunas)
type VacunaBackend = {
  id_vacuna: number;
  nombre_vacuna: string;
  descripcion: string;
  especy?: { id_especie: number; nombre_especie: string };
};

// un registro del historial (GET /historial-vacunas), ojo que la fecha viene con tilde
type HistorialVacunaBackend = {
  id_historial: number;
  observaciones: string;
  "fecha_aplicación": string;
  proxima_dosis: string;
  lote: string;
  vacuna?: VacunaBackend;
};

function mapVacuna(v: VacunaBackend): Vacuna {
  return {
    id: String(v.id_vacuna),
    nombre: v.nombre_vacuna,
    descripcion: v.descripcion,
    especie: v.especy?.nombre_especie,
  };
}

function mapRegistroVacuna(h: HistorialVacunaBackend): RegistroVacuna {
  return {
    id: String(h.id_historial),
    vacunaId: h.vacuna ? String(h.vacuna.id_vacuna) : "",
    vacunaNombre: h.vacuna?.nombre_vacuna ?? "Vacuna",
    vacunaDescripcion: h.vacuna?.descripcion ?? "",
    lote: h.lote,
    fechaAplicacion: h["fecha_aplicación"],
    proximaDosis: h.proxima_dosis,
    observaciones: h.observaciones,
  };
}

export async function listarVacunas(): Promise<Vacuna[]> {
  const data = await request<VacunaBackend[]>("/vacunas");
  return data.map(mapVacuna);
}

export async function crearVacuna(datos: {
  nombre: string;
  descripcion: string;
  idEspecie: number;
}): Promise<Vacuna> {
  const creada = await request<VacunaBackend>("/vacunas", {
    method: "POST",
    body: JSON.stringify({
      nombre_vacuna: datos.nombre,
      descripcion: datos.descripcion,
      id_especie: { id_especie: datos.idEspecie },
    }),
  });
  return mapVacuna(creada);
}

// el back tira 404 cuando la mascota no tiene nada, aqui eso es lista vacia
export async function listarHistorialVacunas(idMascota: string): Promise<RegistroVacuna[]> {
  try {
    const data = await request<HistorialVacunaBackend[]>(
      `/historial-vacunas?negocioId=${NEGOCIO_ID}&id_mascota=${idMascota}`,
    );
    return data
      .map(mapRegistroVacuna)
      .sort((a, b) => b.fechaAplicacion.localeCompare(a.fechaAplicacion));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404 && err.message.includes("No existe historial")) {
      return [];
    }
    throw err;
  }
}

// la fecha de aplicacion la pone el back sola (hoy), no se manda
export async function crearRegistroVacuna(datos: {
  idMascota: number;
  idVacuna: number;
  lote: string;
  proximaDosis: string;
  observaciones: string;
}): Promise<void> {
  await requestSinRespuesta("/historial-vacunas", {
    method: "POST",
    body: JSON.stringify({
      id_mascota: { id_mascota: datos.idMascota },
      id_vacuna: { id_vacuna: datos.idVacuna },
      lote: datos.lote,
      proxima_dosis: aFechaBackend(datos.proximaDosis),
      observaciones: datos.observaciones,
    }),
  });
}

// el dto de update del back pide proxima_dosis y observaciones siempre, por eso van los tres
export async function actualizarRegistroVacuna(
  id: string,
  datos: { lote: string; proximaDosis: string; observaciones: string },
): Promise<void> {
  validarId(id, "el registro de vacuna");
  await requestSinRespuesta(`/historial-vacunas/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      lote: datos.lote,
      proxima_dosis: aFechaBackend(datos.proximaDosis),
      observaciones: datos.observaciones,
    }),
  });
}
