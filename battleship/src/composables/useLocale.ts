import { ref, readonly } from 'vue'
import { translations, type Locale } from '../i18n/translations'

function detectLocale(): Locale {
  const saved = localStorage.getItem('locale')
  if (saved === 'nl' || saved === 'en') return saved

  /* c8 ignore next */
  const langs: readonly string[] = navigator.languages ?? []
  for (const lang of langs) {
    const lower = lang.toLowerCase()
    if (lower.startsWith('nl')) return 'nl'
    if (lower.startsWith('en')) return 'en'
  }
  return 'en'
}

const locale = ref<Locale>(detectLocale())

function t(key: string, vars?: Record<string, string>): string {
  const keys = key.split('.')
  let obj: any = translations[locale.value]
  for (const k of keys) obj = obj?.[k]

  if (typeof obj !== 'string') {
    // Fallback naar NL
    obj = translations.nl
    for (const k of keys) obj = obj?.[k]
  }

  let result = typeof obj === 'string' ? obj : key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(`{${k}}`, v)
    }
  }
  return result
}

function setLocale(l: Locale) {
  locale.value = l
  localStorage.setItem('locale', l)
}

export function useLocale() {
  return {
    locale: readonly(locale),
    t,
    setLocale,
  }
}
