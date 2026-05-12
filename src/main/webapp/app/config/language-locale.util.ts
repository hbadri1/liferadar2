const DEFAULT_LANGUAGE = 'en';

export function getCurrentLanguage(langKey?: string | null): string {
  return (langKey ?? DEFAULT_LANGUAGE).toLowerCase();
}

export function toAngularLocale(langKey?: string | null): string {
  const currentLanguage = getCurrentLanguage(langKey);
  if (currentLanguage === 'ar-ly') {
    return 'ar-LY';
  }
  if (currentLanguage.startsWith('fr')) {
    return 'fr';
  }
  return 'en';
}

export function toDayjsLocale(langKey?: string | null): string {
  const currentLanguage = getCurrentLanguage(langKey);
  if (currentLanguage === 'ar-ly') {
    return 'ar-ly';
  }
  if (currentLanguage.startsWith('fr')) {
    return 'fr';
  }
  return 'en';
}
