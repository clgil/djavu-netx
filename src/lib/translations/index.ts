/**
 * Módulo de traducciones - Exporta las traducciones ES/EN y tipos
 */
import { es } from "./es";
import { en } from "./en";

/** Idiomas soportados */
export type Language = "es" | "en";

/** Tipo recursivo para estructura de traducción */
export type TranslationKeys = Record<string, unknown>;

/** Mapa de traducciones por idioma */
export const translations: Record<Language, TranslationKeys> = { es, en };
