import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ClockStyle = 'simple' | 'flip'

export type Settings = {
  /** 12-hour clock with AM/PM instead of 24-hour */
  hour12: boolean
  style: ClockStyle
  /** seconds shown before midnight, e.g. 5 → starts at 23:59:55 */
  before: number
  /** seconds shown after midnight, e.g. 10 → runs until 00:00:10, then repeats */
  after: number
}

export const DEFAULT_SETTINGS: Settings = {
  hour12: false,
  style: 'simple',
  before: 10,
  after: 10,
}

const STORAGE_KEY = 'rollover.settings.v1'

type SettingsContext = {
  /** settings the clock was last started with; null until the wizard has been completed once */
  saved: Settings | null
  /** working copy: the wizard edits it, the preview and the clock show it */
  settings: Settings
  update: (patch: Partial<Settings>) => void
  /** start the wizard from the saved settings (or the defaults) */
  beginSetup: () => void
  /** use the saved settings as they are (Start on the home screen) */
  restoreSaved: () => void
  /** remember the current settings (Start at the end of the wizard) */
  save: () => void
}

const Context = createContext<SettingsContext | null>(null)

async function load(): Promise<Settings | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    // merge with the defaults so settings added later get a value
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : null
  } catch {
    return null
  }
}

/** Renders nothing until the saved settings are loaded; `onReady` fires once they are. */
export function SettingsProvider({ children, onReady }: { children: ReactNode; onReady?: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState<Settings | null>(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    load().then((s) => {
      setSaved(s)
      if (s) setSettings(s)
      setLoaded(true)
      onReady?.()
    })
  }, []) // load once on startup

  const value: SettingsContext = {
    saved,
    settings,
    update: (patch) => setSettings((s) => ({ ...s, ...patch })),
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
