import { createContext, useContext, useEffect, useEffectEvent, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { THEME_IDS, type ThemeId } from './theme'

export type ClockStyle = 'simple' | 'flip'

export type Settings = {
  /** 12-hour clock with AM/PM instead of 24-hour */
  hour12: boolean
  style: ClockStyle
  theme: ThemeId
  /** fireworks after midnight */
  fireworks: boolean
  /** seconds shown before midnight, e.g. 5 → starts at 23:59:55 */
  before: number
  /** seconds shown after midnight, e.g. 10 → runs until 00:00:10, then repeats */
  after: number
}

export const DEFAULT_SETTINGS: Settings = {
  hour12: false,
  style: 'simple',
  theme: 'classic',
  fireworks: true,
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
  /** working copy: the wizard edits it, the preview and the clock show it */
  settings: Settings
  /** when before or after last changed (Date.now()), so the wizard preview can restart its loop */
  loopChangedAt: number
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
  return {
    hour12: typeof v.hour12 === 'boolean' ? v.hour12 : DEFAULT_SETTINGS.hour12,
    style: v.style === 'simple' || v.style === 'flip' ? v.style : DEFAULT_SETTINGS.style,
    theme: THEME_IDS.includes(v.theme as ThemeId) ? (v.theme as ThemeId) : DEFAULT_SETTINGS.theme,
    fireworks: typeof v.fireworks === 'boolean' ? v.fireworks : DEFAULT_SETTINGS.fireworks,
    before: seconds(v.before, DEFAULT_SETTINGS.before),
    after: seconds(v.after, DEFAULT_SETTINGS.after),
  }
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
  const [loopChangedAt, setLoopChangedAt] = useState(0)
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
    loopChangedAt,
    update: (patch) => {
      const loopChanges = (['before', 'after'] as const).some((k) => patch[k] !== undefined && patch[k] !== settings[k])
      if (loopChanges) setLoopChangedAt(Date.now())
      setSettings((s) => ({ ...s, ...patch }))
    },
    beginSetup: () => setSettings(saved ?? DEFAULT_SETTINGS),
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
