import type { ThemeId } from './themes'
import { publicBaseUrl } from '../lib/device'

export type PresetId = 'birthday' | 'newyear' | 'anniversary' | 'milestone' | 'oncue' | 'live'
export type Mode = 'staged' | 'live'
export type Celebration = 'glow' | 'confetti' | 'none'
export type Sound = 'off' | 'chime' | 'ticks'

export interface Moment {
  preset: PresetId
  mode: Mode
  /** target date, local, YYYY-MM-DD */
  date: string
  /** target time, local, HH:MM */
  time: string
  title: string
  message: string
  theme: ThemeId
  hour12: boolean
  showSeconds: boolean
  showDate: boolean
  showYear: boolean
  /** seconds shown before the rollover */
  leadIn: number
  /** seconds shown after the rollover before looping */
  hold: number
  loop: boolean
  /** seconds to wait after pressing start (place the phone) */
  startDelay: number
  celebration: Celebration
  sound: Sound
  countdown: boolean
}

export interface PresetDef {
  id: PresetId
  label: string
  emoji: string
  hint: string
  apply: (base: Moment) => Moment
}

const pad = (n: number) => String(n).padStart(2, '0')
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return isoDate(d)
}

export function nextNewYear(): string {
  return `${new Date().getFullYear() + 1}-01-01`
}

export const DEFAULT_MOMENT: Moment = {
  preset: 'birthday',
  mode: 'staged',
  date: tomorrow(),
  time: '00:00',
  title: 'Mia',
  message: 'One year old today',
  theme: 'nightlight',
  hour12: false,
  showSeconds: true,
  showDate: true,
  showYear: false,
  leadIn: 30,
  hold: 30,
  loop: true,
  startDelay: 5,
  celebration: 'glow',
  sound: 'off',
  countdown: false,
}

export const PRESETS: PresetDef[] = [
  {
    id: 'birthday',
    label: 'Birthday',
    emoji: '🎂',
    hint: 'Film the moment they turn a year older — while they sleep.',
    apply: (m) => ({
      ...m, preset: 'birthday', mode: 'staged', time: '00:00',
      title: m.preset === 'birthday' ? m.title : 'Mia',
      message: m.preset === 'birthday' ? m.message : 'One year old today',
      theme: 'nightlight', celebration: 'glow', sound: 'off', countdown: false, showYear: false,
      leadIn: 30, hold: 30, loop: true, startDelay: 5,
    }),
  },
  {
    id: 'newyear',
    label: 'New Year',
    emoji: '🎆',
    hint: 'Midnight at 19:30. For kids who can’t stay up.',
    apply: (m) => ({
      ...m, preset: 'newyear', mode: 'staged', date: nextNewYear(), time: '00:00',
      title: '', message: 'Happy New Year!', theme: 'neon', celebration: 'confetti', sound: 'ticks',
      countdown: true, showYear: true, leadIn: 30, hold: 60, loop: true, startDelay: 5,
    }),
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    emoji: '💍',
    hint: 'The day you said yes, again and again.',
    apply: (m) => ({
      ...m, preset: 'anniversary', mode: 'staged', time: '00:00',
      title: 'Anna & Ben', message: 'Ten years together', theme: 'keepsake', celebration: 'glow',
      sound: 'chime', countdown: false, showYear: true, leadIn: 30, hold: 30, loop: true, startDelay: 5,
    }),
  },
  {
    id: 'milestone',
    label: 'Milestone',
    emoji: '🏁',
    hint: 'Sober days, due dates, last day at work, first day of freedom.',
    apply: (m) => ({
      ...m, preset: 'milestone', mode: 'staged', time: '00:00',
      title: 'Day 365', message: 'One year. Every day counted.', theme: 'bedside', celebration: 'glow',
      sound: 'chime', countdown: false, showYear: false, leadIn: 30, hold: 30, loop: true, startDelay: 5,
    }),
  },
  {
    id: 'oncue',
    label: 'On cue',
    emoji: '🎭',
    hint: 'A prop clock for stage & film. Any time, triggered by remote.',
    apply: (m) => ({
      ...m, preset: 'oncue', mode: 'staged', time: '00:00',
      title: '', message: '', theme: 'flip', celebration: 'none', sound: 'off',
      countdown: false, showYear: false, leadIn: 60, hold: 20, loop: false, startDelay: 0,
    }),
  },
  {
    id: 'live',
    label: 'Real time',
    emoji: '🌙',
    hint: 'The actual clock. Celebrates at the real moment.',
    apply: (m) => ({
      ...m, preset: 'live', mode: 'live', time: '00:00', date: tomorrow(),
      title: '', message: 'It’s a new day', theme: 'bedside', celebration: 'glow', sound: 'off',
      countdown: false, loop: false, startDelay: 0,
    }),
  },
]

export const presetById = (id: PresetId) => PRESETS.find((p) => p.id === id) ?? PRESETS[0]

/* ---------- share links: the whole moment lives in the URL ---------- */

export function encodeMoment(m: Moment): string {
  const json = JSON.stringify(m)
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeMoment(s: string): Partial<Moment> | null {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    const obj = JSON.parse(new TextDecoder().decode(bytes))
    return typeof obj === 'object' && obj ? obj : null
  } catch {
    return null
  }
}

export function shareUrl(m: Moment): string {
  return `${publicBaseUrl()}#/m/${encodeMoment(m)}`
}
