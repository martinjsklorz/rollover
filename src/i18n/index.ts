import { useMemo } from 'react'
import { useLocales, type Locale } from 'expo-localization'
import en, { type Strings } from './languages/en'
import de from './languages/de'
import es from './languages/es'
import fr from './languages/fr'
import hi from './languages/hi'
import id from './languages/id'
import it from './languages/it'
import ja from './languages/ja'
import ko from './languages/ko'
import nl from './languages/nl'
import pl from './languages/pl'
import pt from './languages/pt'
import ru from './languages/ru'
import tr from './languages/tr'
import uk from './languages/uk'
import zhHans from './languages/zh-Hans'
import zhHant from './languages/zh-Hant'

export type { Strings }

/**
 * The app's languages by BCP 47 tag. To add one, copy languages/en.ts, translate it, list it here
 * and in `supportedLocales` in app.json (that list offers it in the system's per-app language settings).
 */
export const LANGUAGES = {
  en,
  de,
  es,
  fr,
  hi,
  id,
  it,
  ja,
  ko,
  nl,
  pl,
  pt,
  ru,
  tr,
  uk,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
} satisfies Record<string, Strings>

export type Language = keyof typeof LANGUAGES

/** Chinese without a script in its tag: Traditional in these regions, Simplified elsewhere. */
const TRADITIONAL_REGIONS = ['TW', 'HK', 'MO']

/** The app's language for one of the user's preferred locales, or undefined if the app doesn't have it. */
export function languageOf(locale: Locale): Language | undefined {
  const code = locale.languageCode?.toLowerCase()
  if (code === 'zh') {
    const script = locale.languageScriptCode ?? /-(Hans|Hant)\b/i.exec(locale.languageTag)?.[1]
    if (script) return script.toLowerCase() === 'hant' ? 'zh-Hant' : 'zh-Hans'
    const region = locale.regionCode ?? /-([A-Z]{2})\b/.exec(locale.languageTag)?.[1]
    return region && TRADITIONAL_REGIONS.includes(region) ? 'zh-Hant' : 'zh-Hans'
  }
  // older Android versions report Indonesian under its legacy code
  if (code === 'in') return 'id'
  return code && Object.hasOwn(LANGUAGES, code) ? (code as Language) : undefined
}

/** The first of the user's preferred languages that the app has, English if none. */
export function pickLanguage(locales: readonly Locale[]): Language {
  for (const locale of locales) {
    const language = languageOf(locale)
    if (language) return language
  }
  return 'en'
}

/** The app's language, following the device (or browser) settings. Updates when they change. */
export function useLanguage(): Language {
  const locales = useLocales()
  return useMemo(() => pickLanguage(locales), [locales])
}

/** The strings in the app's language. */
export function useStrings(): Strings {
  return LANGUAGES[useLanguage()]
}
