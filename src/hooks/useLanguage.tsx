/**
 * useLanguage - Hook y contexto de internacionalización (i18n)
 * 
 * Provee soporte bilingüe (ES/EN) para toda la aplicación Djavu.
 * El idioma seleccionado se persiste en sessionStorage.
 * 
 * Uso:
 *   const { t, language, setLanguage } = useLanguage();
 *   <p>{t('home.hero.title')}</p>
 */
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { translations, Language, TranslationKeys } from "@/lib/translations";

interface LanguageContextType {
  /** Idioma actual: 'es' o 'en' */
  language: Language;
  /** Cambiar idioma */
  setLanguage: (lang: Language) => void;
  /** Función de traducción - devuelve el texto en el idioma actual */
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Obtiene el idioma guardado en sessionStorage o devuelve 'es' por defecto
 */
function getStoredLanguage(): Language {
  const stored = sessionStorage.getItem("djavu_lang");
  return stored === "en" ? "en" : "es";
}

/**
 * Accede a un valor anidado en un objeto usando una clave con notación de punto
 * Ejemplo: getNestedValue(obj, "home.hero.title") → obj.home.hero.title
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Devolver la clave si no se encuentra la traducción
    }
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  /** Actualiza el idioma y lo guarda en sessionStorage */
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    sessionStorage.setItem("djavu_lang", lang);
  }, []);

  /** Función de traducción principal */
  const t = useCallback(
    (key: string): string => {
      return getNestedValue(translations[language] as unknown as Record<string, unknown>, key);
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
