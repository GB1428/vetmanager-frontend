import { SEXOS, resolverOpcion } from "@/lib/constants";

const ETIQUETAS_ESPECIE: Record<string, string> = {
  perro: "Canino",
  gato: "Felino",
  caballo: "Equino",
};

function normalizar(valor?: string): string {
  return (valor ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function etiquetaEspecie(especie?: string): string {
  if (!especie || especie === "—") return "";
  return ETIQUETAS_ESPECIE[normalizar(especie)] ?? especie;
}

export function etiquetaSexo(valor?: string): string {
  if (!valor) return "";
  const v = resolverOpcion(SEXOS, valor);
  const label = SEXOS.find((o) => o.value === v)?.label ?? valor;
  return label.split(" - ")[0];
}

export function especieRaza(especie?: string, raza?: string, separador = ", "): string {
  return [etiquetaEspecie(especie), raza && raza !== "—" ? raza : ""].filter(Boolean).join(separador);
}
