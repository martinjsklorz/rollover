import { useMemo } from 'react'
import type { Settings } from '../settings'
import { useStrings, type Strings } from '../i18n'
import en from '../i18n/languages/en'
import { formatTime, loopTime } from '../clock/time'
import { THEME_IDS, themeId } from '../theme'

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
}

const SECONDS = [5, 10, 30, 60]

/** One page per setting, in the language of `t`. Add a setting by adding a step here. */
export const stepsIn = (t: Strings): Step[] => [
  {
    id: 'format',
    name: t.format.name,
    title: t.format.title,
    choices: [
      { label: t.format.hour24, hint: '23:59:59 → 00:00:00', value: { hour12: false } },
      { label: t.format.hour12, hint: '11:59:59 PM → 12:00:00 AM', value: { hour12: true } },
    ],
    summary: (s) => (s.hour12 ? t.format.hour12 : t.format.hour24),
  },
  {
    id: 'style',
    name: t.style.name,
    title: t.style.title,
    choices: [
      { label: t.style.simple, hint: t.style.simpleHint, value: { style: 'simple' } },
      { label: t.style.flip, hint: t.style.flipHint, value: { style: 'flip' } },
    ],
    summary: (s) => (s.style === 'flip' ? t.style.flip : t.style.simple),
  },
  {
    id: 'theme',
    name: t.theme.name,
    title: t.theme.title,
    subtitle: t.theme.subtitle,
    choices: THEME_IDS.map((id) => ({ label: t.themes[id].name, hint: t.themes[id].hint, value: { theme: id } })),
    summary: (s) => t.themes[themeId(s.theme)].name,
  },
  {
    id: 'before',
    name: t.before.name,
    title: t.before.title,
    subtitle: t.before.subtitle,
    choices: SECONDS.map((sec) => ({
      label: t.seconds(sec),
      hint: (s: Settings) => t.before.hint(formatTime(loopTime(sec, 0), s.hour12)),
      value: { before: sec },
    })),
    summary: (s) => t.seconds(s.before),
  },
  {
    id: 'after',
    name: t.after.name,
    title: t.after.title,
    subtitle: t.after.subtitle,
    choices: SECONDS.map((sec) => ({
      label: t.seconds(sec),
      hint: (s: Settings) => t.after.hint(formatTime(sec, s.hour12)),
      value: { after: sec },
    })),
    summary: (s) => t.seconds(s.after),
  },
  {
    id: 'animation',
    name: t.animation.name,
    title: t.animation.title,
    subtitle: t.animation.subtitle,
    choices: [
      { label: t.animation.fireworks, hint: (s: Settings) => t.animation.fireworksHint(formatTime(0, s.hour12)), value: { animation: 'fireworks' } },
      { label: t.animation.confetti, hint: (s: Settings) => t.animation.confettiHint(formatTime(0, s.hour12)), value: { animation: 'confetti' } },
      { label: t.animation.none, hint: t.animation.noneHint, value: { animation: 'none' } },
    ],
    summary: (s) =>
      s.animation === 'fireworks' ? t.animation.fireworks : s.animation === 'confetti' ? t.animation.confetti : t.animation.noneSummary,
  },
]

/** The steps in the app's language. */
export function useSteps() {
  const t = useStrings()
  return useMemo(() => stepsIn(t), [t])
}

/** The steps' ids in order, for routing; the same in every language. */
export const STEP_IDS = stepsIn(en).map((step) => step.id)

export const isSelected = (choice: Choice, s: Settings) =>
  (Object.keys(choice.value) as (keyof Settings)[]).every((k) => choice.value[k] === s[k])

export const hintText = (choice: Choice, s: Settings) =>
  typeof choice.hint === 'function' ? choice.hint(s) : choice.hint

export const stepIndex = (id: string) => STEP_IDS.indexOf(id)

/** The settings in two short lines: "24-hour · Simple" and the loop, from 23:59:50 to 00:00:10. */
export const describe = (s: Settings, steps: Step[]) => {
  const summaryOf = (id: string) => steps[stepIndex(id)].summary(s)
  return {
    look: `${summaryOf('format')} · ${summaryOf('style')}`,
    from: formatTime(loopTime(s.before, 0), s.hour12),
    to: formatTime(s.after, s.hour12),
  }
}
