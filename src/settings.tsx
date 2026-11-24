import { createContext, useContext, useEffect, useEffectEvent, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OCCASION_IDS, fitOccasion, type Occasion } from './occasions'
import { THEME_IDS, type ThemeId } from './theme'

export type ClockStyle = 'simple' | 'flip'

/** what plays over the clock after midnight */
export type MidnightAnimation = 'fireworks' | 'confetti' | 'balloons' | 'lanterns' | 'none'
const ANIMATIONS: MidnightAnimation[] = ['fireworks', 'confetti', 'balloons', 'lanterns', 'none']

/** longest birthday name, so the greeting fits on one line */
export const NAME_MAX = 20

export type Settings = {
  /** decides which themes and animations are offered (src/occasions.ts) */
  occasion: Occasion
  /** birthday: whose it is, shown under the clock at midnight; may be empty */
  name: string
  /** 12-hour clock with AM/PM instead of 24-hour */
  hour12: boolean
  style: ClockStyle
  theme: ThemeId
  /** plays from 00:00:00 until the loop starts over */
  animation: MidnightAnimation
  /** seconds shown before midnight, e.g. 5 → starts at 23:59:55 */
  before: number
  /** seconds shown after midnight, e.g. 10 → runs until 00:00:10, then repeats */
  after: number
}

export const DEFAULT_SETTINGS: Settings = {
  occasion: 'classic',
  name: '',
  hour12: false,
  style: 'simple',
  theme: 'classic',
  animation: 'fireworks',
  before: 10,
  after: 10,
}

const STORAGE_KEY = 'rollover.settings.v1'
/** the working copy, so a reload in the middle of the wizard (web) keeps the choices made so far */
const DRAFT_KEY = 'rollover.draft.v1'

/** the range the wizard offers for before / after, in whole seconds */
const MIN_SECONDS = 5
const MAX_SECONDS = 60

type SettingsContext = {
  /** settings the clock was last started with; null until the wizard has been completed once */
  saved: Settings | null
  /** working copy: the wizard edits it, the preview and the clock show it. Always fits its occasion (see fitOccasion). */
  settings: Settings
  /** start of the wizard preview's loop (Date.now()), shared by all wizard pages so it runs on between them */
  previewStartedAt: number
  update: (patch: Partial<Settings>) => void
  /** start the wizard from the saved settings (or the defaults) */
  beginSetup: () => void
  /** use the saved settings as they are (Start on the home screen) */
  restoreSaved: () => void
  /** remember the current settings (Start at the end of the wizard) */
  save: () => void
}

const Context = createContext<SettingsContext | null>(null)

/**
 * Stored settings, checked field by field: a missing or invalid field (an older version,
 * a setting added later, a damaged value) gets the default. Anything but an object is ignored.
 * A theme or animation the occasion doesn't offer gets the occasion's default.
 */
function parse(raw: string | null): Settings | null {
  let value: unknown
  try {
    value = raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const v = value as Record<string, unknown>
  const seconds = (n: unknown, fallback: number) =>
    typeof n === 'number' && Number.isInteger(n) && n >= MIN_SECONDS && n <= MAX_SECONDS ? n : fallback
  const theme = THEME_IDS.includes(v.theme as ThemeId) ? (v.theme as ThemeId) : DEFAULT_SETTINGS.theme
  return fitOccasion({
    occasion: OCCASION_IDS.includes(v.occasion as Occasion)
      ? (v.occasion as Occasion)
      : // saved before occasions existed: the Classic theme, or one of the New Year's Eve themes
        theme === 'classic'
        ? 'classic'
        : 'newyear',
    name: typeof v.name === 'string' ? v.name.slice(0, NAME_MAX) : DEFAULT_SETTINGS.name,
    hour12: typeof v.hour12 === 'boolean' ? v.hour12 : DEFAULT_SETTINGS.hour12,
    style: v.style === 'simple' || v.style === 'flip' ? v.style : DEFAULT_SETTINGS.style,
    theme,
    animation: ANIMATIONS.includes(v.animation as MidnightAnimation)
      ? (v.animation as MidnightAnimation)
      : // saved before confetti existed: fireworks on or off
        typeof v.fireworks === 'boolean'
        ? v.fireworks
          ? 'fireworks'
          : 'none'
        : DEFAULT_SETTINGS.animation,
    before: seconds(v.before, DEFAULT_SETTINGS.before),
    after: seconds(v.after, DEFAULT_SETTINGS.after),
  })
}

async function load(key: string): Promise<Settings | null> {
  try {
    return parse(await AsyncStorage.getItem(key))
  } catch {
    return null
  }
}

/** Renders nothing until the saved settings are loaded; `onReady` fires once they are. */
export function SettingsProvider({ children, onReady }: { children: ReactNode; onReady?: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState<Settings | null>(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [previewStartedAt, setPreviewStartedAt] = useState(Date.now)
  const ready = useEffectEvent(() => onReady?.())

  useEffect(() => {
    Promise.all([load(STORAGE_KEY), load(DRAFT_KEY)]).then(([s, draft]) => {
      setSaved(s)
      // the draft only matters when the app opens on a wizard page; home resets to the saved settings
      setSettings(draft ?? s ?? DEFAULT_SETTINGS)
      setLoaded(true)
      ready()
    })
  }, []) // load once on startup

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(settings)).catch(() => {})
  }, [loaded, settings])

  const value: SettingsContext = {
    saved,
    settings,
    previewStartedAt,
    update: (patch) => {
      const changes = (k: 'before' | 'after') => patch[k] !== undefined && patch[k] !== settings[k]
      // a new loop length restarts the preview where it shows: a new "before" from its new start,
      // a new "after" from midnight (the loop started `before` seconds ago)
      if (changes('before')) setPreviewStartedAt(Date.now())
      else if (changes('after')) setPreviewStartedAt(Date.now() - settings.before * 1000)
      // a new occasion brings its default theme and animation, unless it offers the current ones
      setSettings((s) => fitOccasion({ ...s, ...patch }))
    },
    beginSetup: () => {
      setSettings(saved ?? DEFAULT_SETTINGS)
      setPreviewStartedAt(Date.now())
    },
    restoreSaved: () => saved && setSettings(saved),
    save: () => {
      setSaved(settings)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {})
    },
  }

  if (!loaded) return null
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useSettings() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>')
  return ctx
}
