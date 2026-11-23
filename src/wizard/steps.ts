import type { Settings } from '../settings'
import { formatTime, loopTime } from '../clock/time'
import { THEMES, THEME_IDS, themeOf } from '../theme'

export type Choice = {
  label: string
  /** a fixed hint, or one that depends on the current settings (e.g. 12/24h) */
  hint?: string | ((s: Settings) => string)
  /** the settings this choice applies */
  value: Partial<Settings>
}

export type Step = {
  id: string
  title: string
  subtitle?: string
  /** short name for the summary on the last page */
  name: string
  choices: Choice[]
  /** text for the summary on the last page */
  summary: (s: Settings) => string
  /** where the preview starts: the start of the loop, or just before midnight (shows the end sooner) */
  preview?: 'start' | 'midnight'
}

const SECONDS = [5, 10, 30, 60]

/** One page per setting. Add a setting by adding a step here. */
export const STEPS: Step[] = [
  {
    id: 'format',
    name: 'Format',
    title: '24-hour or AM/PM?',
    choices: [
      { label: '24-hour', hint: '23:59:59 → 00:00:00', value: { hour12: false } },
      { label: '12-hour', hint: '11:59:59 PM → 12:00:00 AM', value: { hour12: true } },
    ],
    summary: (s) => (s.hour12 ? '12-hour' : '24-hour'),
  },
  {
    id: 'style',
    name: 'Style',
    title: 'Pick a style',
    choices: [
      { label: 'Simple', hint: 'Thin white digits', value: { style: 'simple' } },
      { label: 'Flip clock', hint: 'Split-flap cards', value: { style: 'flip' } },
    ],
    summary: (s) => (s.style === 'flip' ? 'Flip clock' : 'Simple'),
  },
  {
    id: 'theme',
    name: 'Theme',
    title: 'Pick a theme',
    subtitle: "Colors for New Year's Eve, or any midnight.",
    choices: THEME_IDS.map((id) => ({ label: THEMES[id].name, hint: THEMES[id].hint, value: { theme: id } })),
    summary: (s) => themeOf(s.theme).name,
  },
  {
    id: 'before',
    name: 'Before midnight',
    title: 'How long before midnight?',
    subtitle: 'Time to get ready before the clock rolls over.',
    choices: SECONDS.map((sec) => ({
      label: `${sec} seconds`,
      hint: (s: Settings) => `Starts at ${formatTime(loopTime(sec, 0), s.hour12)}`,
      value: { before: sec },
    })),
    summary: (s) => `${s.before} seconds`,
  },
  {
    id: 'after',
    name: 'After midnight',
    title: 'How long after midnight?',
    subtitle: 'Then the clock starts over.',
    choices: SECONDS.map((sec) => ({
      label: `${sec} seconds`,
      hint: (s: Settings) => `Until ${formatTime(sec, s.hour12)}, then repeats`,
      value: { after: sec },
    })),
    summary: (s) => `${s.after} seconds`,
    preview: 'midnight',
  },
  {
    id: 'fireworks',
    name: 'Fireworks',
    title: 'Fireworks at midnight?',
    subtitle: 'They light up the seconds after midnight, every time the clock rolls over.',
    choices: [
      { label: 'Fireworks', hint: (s: Settings) => `Rockets go up at ${formatTime(0, s.hour12)}`, value: { fireworks: true } },
      { label: 'No fireworks', hint: 'Just the clock', value: { fireworks: false } },
    ],
    summary: (s) => (s.fireworks ? 'Fireworks' : 'No fireworks'),
  },
]

export const isSelected = (choice: Choice, s: Settings) =>
  (Object.keys(choice.value) as (keyof Settings)[]).every((k) => choice.value[k] === s[k])

export const hintText = (choice: Choice, s: Settings) =>
  typeof choice.hint === 'function' ? choice.hint(s) : choice.hint

export const stepIndex = (id: string) => STEPS.findIndex((s) => s.id === id)

const summaryOf = (id: string, s: Settings) => STEPS[stepIndex(id)].summary(s)

/** The settings in two short lines: "24-hour · Simple" and the loop, from 23:59:50 to 00:00:10. */
export const describe = (s: Settings) => ({
  look: `${summaryOf('format', s)} · ${summaryOf('style', s)}`,
  from: formatTime(loopTime(s.before, 0), s.hour12),
  to: formatTime(s.after, s.hour12),
})
