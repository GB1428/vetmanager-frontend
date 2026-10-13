const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function soloFecha(valor?: string | null): string {
  return valor ? valor.slice(0, 10) : "";
}

export function hoyLocalISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function formatearFechaCorta(valor?: string | null): string {
  const iso = soloFecha(valor);
  const [anio, mes, dia] = iso.split("-").map(Number);
  if (!anio || !mes || !dia) return "—";
  return `${dia} ${MESES_CORTOS[mes - 1]} ${anio}`;
}

export function fechaLocalDeInstante(valor?: string | null): string {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function formatearInstanteCorto(valor?: string | null): string {
  return formatearFechaCorta(fechaLocalDeInstante(valor));
}

export function aFechaBackend(iso: string): string {
  return `${soloFecha(iso)}T12:00:00.000Z`;
}

export function diasHasta(valor: string): number {
  const [anio, mes, dia] = soloFecha(valor).split("-").map(Number);
  const hoy = hoyLocalISO().split("-").map(Number);
  const destino = Date.UTC(anio, mes - 1, dia);
  const base = Date.UTC(hoy[0], hoy[1] - 1, hoy[2]);
  return Math.round((destino - base) / 86400000);
}

export function calcularEdad(fechaNacimiento?: string, corta = false): string | null {
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento);
  if (Number.isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
  if (hoy.getDate() < nac.getDate()) meses -= 1;
  if (meses < 0) return null;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const textoAnios = `${anios} ${anios === 1 ? "año" : "años"}`;
  const textoMeses = `${resto} ${resto === 1 ? "mes" : "meses"}`;
  if (corta) return anios > 0 ? textoAnios : textoMeses;
  const partes: string[] = [];
  if (anios > 0) partes.push(textoAnios);
  if (resto > 0 || anios === 0) partes.push(textoMeses);
  return partes.join(" y ");
}
