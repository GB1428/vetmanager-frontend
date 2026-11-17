import { API_URL, NEGOCIO_ID } from "@/lib/config";
import type {
  Paciente,
  Dueno,
  Solicitud,
  Cita,
  Boleta,
  Vacuna,
  RegistroVacuna,
  RecetaCreada,
  MedicamentoReceta,
  OrigenReceta,
  Examen,
  CategoriaExamen,
} from "@/lib/types";
import { CATEGORIAS_EXAMEN } from "@/lib/constants";
import { ApiError, extraerMensajeBackend, pistaParaError } from "@/lib/errors";
import { logApiFallo, logApiOk, logInfo, logWarn } from "@/lib/logger";
import { aFechaBackend } from "@/lib/fechas";
import { DateTime } from "luxon";
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
  ...(typeof FormData !== "undefined" && options?.body instanceof FormData
    ? {}
    : { "Content-Type": "application/json" }),
  ...(typeof window !== "undefined" &&
  sessionStorage.getItem("accessToken")
    ? {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      }
    : {}),
  ...(options?.headers ?? {}),
},
      cache: "no-store",
    });
  } catch (causa) {
    const detalle = causa instanceof Error ? causa.message : String(causa);
    const pista = pistaParaError(0, method);
    const mensaje = "no se pudo conectar con el servidor, revisa que el backend esté prendido";
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
  const creado = await request<DuenoBackend>("/duenos", {
    method: "POST",
    body: JSON.stringify({
      rut: datos.rut,
      nombre_completo: datos.nombre,
      telefono: datos.telefono,
      correo: datos.correo,
      direccion: datos.direccion,
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

// la raza es texto libre que escribe el cliente (se manda como string), solo la especie se busca por id
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
  especy?: { id_especie: number; nombre_especie: string };
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
    especie: m.especie ?? m.especy?.nombre_especie ?? m.id_especie?.nombre ?? "—",
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
  microchip?: string;
  observaciones?: string;
  antecedentes?: string;
  alergias?: string;
  idDueno: number;
}): Promise<Paciente> {
  const creado = await request<MascotaBackend>("/mascotas", {
    method: "POST",
    body: JSON.stringify({
      nombre: datos.nombre,
      raza: datos.raza,
      id_especie: {
        id_especie: datos.idEspecie,
      },

      sexo: datos.sexo,
      fecha_nacimiento: datos.fechaNacimiento || undefined,
      peso: datos.pesoKg,
      microchip: datos.microchip,
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
    duenoId: c.dueno?.id_dueno != null ? String(c.dueno.id_dueno) : undefined,
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

export async function eliminarSolicitud(id: string): Promise<void> {
  validarId(id, "la solicitud");
  await requestSinRespuesta(`/contacto-emergencia/${id}`, { method: "DELETE" });
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
  const fechaChile = DateTime.fromISO(fechaHora, {
    zone: "utc",
  }).setZone("America/Santiago");

  if (!fechaChile.isValid) {
    throw new Error(`Fecha inválida recibida del backend: ${fechaHora}`);
  }

  return {
    fecha: fechaChile.toFormat("yyyy-MM-dd"),
    hora: fechaChile.toFormat("HH:mm"),
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
function construirFechaHoraParaBackend(
  fechaISO: string,
  hora: string,
): string {
  const fechaChile = DateTime.fromISO(`${fechaISO}T${hora}`, {
    zone: "America/Santiago",
  });

  if (!fechaChile.isValid) {
    throw new Error(
      `Fecha u hora inválida: ${fechaISO} ${hora}`,
    );
  }

  return fechaChile.toUTC().toISO()!;
}

export async function listarCitas(): Promise<Cita[]> {
  const data = await request<CitaBackend[]>(`/citas/todas?negocioId=${NEGOCIO_ID}`);
  return data.map(mapCita);
}

// trae solo las citas entre dos dias (formato yyyy-MM-dd, ambos incluidos), asi no se cargan todas
// el rango se manda como instantes iso en utc calculados con la hora de chile, para no perder
// citas de la noche ni traer de mas por el desfase entre zonas horarias.
// ruta del back: GET /citas?fechaInicio=...&fechaFin=... (el negocio sale del token)
export async function listarCitasPorRango(desde: string, hasta: string): Promise<Cita[]> {
  const inicio = DateTime.fromISO(desde, { zone: "America/Santiago" }).startOf("day");
  const fin = DateTime.fromISO(hasta, { zone: "America/Santiago" }).endOf("day");

  if (!inicio.isValid || !fin.isValid || inicio > fin) {
    throw new Error(`Rango de fechas inválido: ${desde} a ${hasta}`);
  }

  const query =
    `fechaInicio=${encodeURIComponent(inicio.toUTC().toISO()!)}` +
    `&fechaFin=${encodeURIComponent(fin.toUTC().toISO()!)}`;

  let data: CitaBackend[];
  try {
    data = await request<CitaBackend[]>(`/citas?${query}`);
  } catch (err) {
    // el back anterior tenia la ruta como /citas/:negocioId, si no existe /citas probamos esa
    // (se puede borrar este catch cuando todos los back tengan la ruta nueva)
    if (err instanceof ApiError && err.status === 404) {
      data = await request<CitaBackend[]>(`/citas/${NEGOCIO_ID}?${query}`);
    } else {
      throw err;
    }
  }

  return data.map(mapCita).sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
}

export function listarCitasDelMes(anio: number, mes: number): Promise<Cita[]> {
  const primero = DateTime.fromObject({ year: anio, month: mes + 1, day: 1 });
  return listarCitasPorRango(primero.toFormat("yyyy-MM-dd"), primero.endOf("month").toFormat("yyyy-MM-dd"));
}

export async function crearCita(datos: {
  fecha: string;
  hora: string;
  motivo: string;
  idMascota: number;
  idDueno: number;
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
      id_dueno: {
        id_dueno: datos.idDueno,
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
  idDueno?: number;
  id_mascota?: number;
  dueno?: DuenoBackend;
  mascota?: MascotaBackend;
  montoTotal: number;
  estadoPago?: string;
  metodoPago?: string;
  fechaEmision?: string;
  cita?: CitaBackend;
};

function mapBoleta(b: BoletaBackend): Boleta {
  const mascota = b.mascota ?? b.cita?.mascota;
  const dueno = b.dueno ?? mascota?.dueno;

  return {
    id: `#BOL-${b.idBoleta}`,
    idBoleta: b.idBoleta,
    idCita: b.idCita ?? b.cita?.id_cita,

    idDueno: b.idDueno ?? dueno?.id_dueno ?? 0,
    idMascota: b.id_mascota ?? mascota?.id_mascota,
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

export type ItemCobrado = {
  concepto: string;
  precio: number;
  origen: "vacuna" | "receta" | "manual";
  claveOrigen?: string;
};

// manda la boleta con el detalle (items). si el back todavia no acepta "items" responde 400
// ("property items should not exist"), en ese caso se reintenta sin detalle y se avisa con
// itemsGuardadosEnBack=false para que el front use el respaldo local de lo cobrado.
export async function crearBoleta(datos: {
  idDueno: number;
  idMascota: number;
  idCita?: number;
  montoTotal: number;
  estadoPago?: string;
  metodoPago?: string;
  items?: ItemCobrado[];
}): Promise<{ boleta: Boleta; itemsGuardadosEnBack: boolean }> {
  const base = {
    idNegocio: NEGOCIO_ID,
    idCita: datos.idCita,
    idDueno: datos.idDueno,
    id_mascota: datos.idMascota,
    montoTotal: datos.montoTotal,
    estadoPago: datos.estadoPago,
    metodoPago: datos.metodoPago,
  };

  if (datos.items && datos.items.length > 0) {
    try {
      const creada = await request<BoletaBackend>("/boletas", {
        method: "POST",
        body: JSON.stringify({ ...base, items: datos.items }),
      });
      return { boleta: mapBoleta(creada), itemsGuardadosEnBack: true };
    } catch (err) {
      const backViejo = err instanceof ApiError && err.status === 400 && /items/i.test(err.message);
      if (!backViejo) throw err;
      logWarn("el back todavia no acepta items en POST /boletas, se crea la boleta sin detalle");
    }
  }

  const creada = await request<BoletaBackend>("/boletas", {
    method: "POST",
    body: JSON.stringify(base),
  });
  return { boleta: mapBoleta(creada), itemsGuardadosEnBack: false };
}

// claves ya cobradas de una mascota (["vacuna-12","receta-5::0"]). devuelve null si el back
// todavia no tiene el endpoint, para que el front use el respaldo local
export async function listarClavesCobradas(idMascota: string): Promise<string[] | null> {
  try {
    const data = await request<string[]>(`/boletas/items-cobrados?id_mascota=${encodeURIComponent(idMascota)}`);
    return Array.isArray(data) ? data : null;
  } catch (err) {
    // 404 = ruta inexistente; 400 = el back la toma como /boletas/:id (ParseIntPipe)
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
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

// ---------- eliminar ----------
// DELETE /mascotas/:id (el negocio sale del token)
export async function eliminarPaciente(id: string): Promise<void> {
  validarId(id, "la mascota a eliminar");
  await requestSinRespuesta(`/mascotas/${id}`, { method: "DELETE" });
}

// DELETE /duenos/:id. ojo: el back no borra solo lo que depende del dueño, por eso se usa
// eliminarDuenoConMascotas para borrar primero sus mascotas y solicitudes
export async function eliminarDueno(id: string): Promise<void> {
  validarId(id, "el dueño a eliminar");
  await requestSinRespuesta(`/duenos/${id}`, { method: "DELETE" });
}

// borra al dueño y todo lo que cuelga de el: mascotas y solicitudes de emergencia asociadas.
// se piden las mascotas de nuevo al back para no depender de una lista desactualizada
export async function eliminarDuenoConMascotas(id: string): Promise<{ mascotas: number }> {
  validarId(id, "el dueño a eliminar");

  const pacientes = await listarPacientes();
  const mascotas = pacientes.filter((p) => p.duenoId === id);

  for (const m of mascotas) {
    try {
      await eliminarPaciente(m.id);
    } catch (err) {
      const detalle = err instanceof Error ? err.message : "error desconocido";
      throw new Error(`No se pudo eliminar a la mascota ${m.nombre}: ${detalle}. El dueño no fue eliminado.`);
    }
  }

  // las solicitudes apuntan al dueño y pueden impedir que se borre, asi que se limpian antes
  try {
    const solicitudes = await listarSolicitudes();
    for (const s of solicitudes.filter((s) => s.duenoId === id)) {
      await eliminarSolicitud(s.id);
    }
  } catch (err) {
    logWarn(`no se pudieron limpiar las solicitudes del dueño ${id}, se intenta borrar igual`, err);
  }

  await eliminarDueno(id);
  return { mascotas: mascotas.length };
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
  precio?: number;
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
    precio: v.precio ?? 0,
    especie: v.especy?.nombre_especie,
  };
}

function mapRegistroVacuna(h: HistorialVacunaBackend): RegistroVacuna {
  return {
    id: String(h.id_historial),
    vacunaId: h.vacuna ? String(h.vacuna.id_vacuna) : "",
    vacunaNombre: h.vacuna?.nombre_vacuna ?? "Vacuna",
    vacunaDescripcion: h.vacuna?.descripcion ?? "",
    precio: h.vacuna?.precio ?? 0,
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

// el precio va en pesos y entero (el back lo pide @IsInt)
export async function crearVacuna(datos: {
  nombre: string;
  descripcion: string;
  precio: number;
  idEspecie: number;
}): Promise<Vacuna> {
  const creada = await request<VacunaBackend>("/vacunas", {
    method: "POST",
    body: JSON.stringify({
      nombre_vacuna: datos.nombre,
      descripcion: datos.descripcion,
      precio: datos.precio,
      id_especie: { id_especie: datos.idEspecie },
    }),
  });
  return mapVacuna(creada);
}

// el back tira 404 cuando la mascota no tiene nada, aqui eso es lista vacia
export async function listarHistorialVacunas(idMascota: string): Promise<RegistroVacuna[]> {
  try {
    const { texto } = await ejecutar(
      `/historial-vacunas?negocioId=${NEGOCIO_ID}&id_mascota=${idMascota}`,
    );
    // si la mascota no tiene vacunas el back puede devolver un texto ("no hay historial...") en vez de un array
    let data: HistorialVacunaBackend[];
    try {
      const parseado: unknown = JSON.parse(texto);
      if (!Array.isArray(parseado)) return [];
      data = parseado as HistorialVacunaBackend[];
    } catch {
      return [];
    }
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


// ---------- recetas ----------
// el back guarda la receta como un solo texto (medicamentos_indicaciones),
// asi que mandamos un json con todo y lo leemos de vuelta al listar
type RecetaBackend = {
  id_receta: number;
  fecha: string;
  medicamentos_indicaciones: string;
  mascota?: { id_mascota: number; nombre: string } | null;
};

type ContenidoReceta = {
  origen?: OrigenReceta;
  citaId?: string;
  citaFecha?: string;
  citaHora?: string;
  citaMotivo?: string;
  medicamentos?: MedicamentoReceta[];
  recomendaciones?: string;
};

function mapReceta(r: RecetaBackend): RecetaCreada {
  let contenido: ContenidoReceta = {};
  try {
    const parseado: unknown = JSON.parse(r.medicamentos_indicaciones);
    if (parseado && typeof parseado === "object") contenido = parseado as ContenidoReceta;
  } catch {
    // receta vieja o escrita como texto plano: la mostramos como recomendaciones
    contenido = { recomendaciones: r.medicamentos_indicaciones };
  }

  return {
    id: String(r.id_receta),
    origen: contenido.origen ?? "paciente",
    pacienteId: r.mascota?.id_mascota != null ? String(r.mascota.id_mascota) : "",
    pacienteNombre: r.mascota?.nombre ?? "—",
    citaId: contenido.citaId,
    citaFecha: contenido.citaFecha,
    citaHora: contenido.citaHora,
    citaMotivo: contenido.citaMotivo,
    medicamentos: contenido.medicamentos ?? [],
    recomendaciones: contenido.recomendaciones ?? "",
    fecha: r.fecha ? DateTime.fromISO(r.fecha).toISODate() ?? r.fecha.slice(0, 10) : "",
  };
}

export async function listarRecetas(): Promise<RecetaCreada[]> {
  const data = await request<RecetaBackend[]>(`/recetas-medicas?negocioId=${NEGOCIO_ID}`);
  return (data ?? []).map(mapReceta);
}

export async function crearReceta(datos: {
  idMascota: string;
  origen: OrigenReceta;
  citaId?: string;
  citaFecha?: string;
  citaHora?: string;
  citaMotivo?: string;
  medicamentos: MedicamentoReceta[];
  recomendaciones: string;
}): Promise<RecetaCreada> {
  validarId(datos.idMascota, "la mascota de la receta");
  const contenido: ContenidoReceta = {
    origen: datos.origen,
    citaId: datos.citaId,
    citaFecha: datos.citaFecha,
    citaHora: datos.citaHora,
    citaMotivo: datos.citaMotivo,
    medicamentos: datos.medicamentos,
    recomendaciones: datos.recomendaciones,
  };

  const creada = await request<RecetaBackend>(`/recetas-medicas/${datos.idMascota}`, {
    method: "POST",
    body: JSON.stringify({ medicamentos_indicaciones: JSON.stringify(contenido) }),
  });
  return mapReceta(creada);
}


// ---------- examenes (storage + supabase) ----------
type ExamenBackend = {
  id_examen: number;
  tipo_examen: string;
  fecha_realizacion: string;
  resultado_detalles?: string;
  archivo_path: string;
  url: string;
  mascota: string;
  id_mascota?: number;
};

function categoriaDesdeTipo(tipo: string): CategoriaExamen {
  const t = normalizarTexto(tipo);
  const encontrada = CATEGORIAS_EXAMEN.find(
    (c) => normalizarTexto(c.label) === t || normalizarTexto(c.value) === t,
  );
  return encontrada?.value ?? "general";
}

// el back guarda la ruta como examenes/mascota-7/<prefijo>-<nombre>; se muestra solo el nombre
function nombreDesdeRuta(ruta: string): string {
  const archivo = ruta.split("/").pop() ?? ruta;
  return archivo.replace(/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d{10,})[-_]/i, "");
}

function mapExamen(e: ExamenBackend): Examen {
  const nombre = nombreDesdeRuta(e.archivo_path);
  return {
    id: String(e.id_examen),
    nombreArchivo: nombre,
    tipoArchivo: nombre.toLowerCase().endsWith(".pdf") ? "pdf" : "imagen",
    categoria: categoriaDesdeTipo(e.tipo_examen),
    pacienteId: e.id_mascota != null ? String(e.id_mascota) : "",
    pacienteNombre: e.mascota ?? "—",
    fecha: e.fecha_realizacion,
    url: e.url,
  };
}

// GET /storage/examenes (el negocio sale del token). las urls firmadas duran 1 hora
export async function listarExamenes(): Promise<Examen[]> {
  const data = await request<ExamenBackend[]>("/storage/examenes");
  return (data ?? []).map(mapExamen);
}

// POST /storage/examen (multipart). el campo del archivo se llama "archivo"
export async function subirExamen(datos: {
  archivo: File;
  idMascota: string;
  categoria: CategoriaExamen;
  fecha: string;
}): Promise<void> {
  validarId(datos.idMascota, "la mascota del examen");
  const etiqueta = CATEGORIAS_EXAMEN.find((c) => c.value === datos.categoria)?.label ?? "General";

  const form = new FormData();
  form.append("archivo", datos.archivo, datos.archivo.name);
  form.append("id_mascota", datos.idMascota);
  form.append("tipo_examen", etiqueta);
  form.append("fecha_realizacion", datos.fecha);
  form.append("resultado_detalles", "");

  await requestSinRespuesta("/storage/examen", { method: "POST", body: form });
}
