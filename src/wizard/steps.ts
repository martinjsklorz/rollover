import { NAME_MAX, type MidnightAnimation, type Settings } from '../settings'
import { formatTime, loopTime } from '../clock/time'
import { OCCASIONS, OCCASION_IDS } from '../occasions'
import { THEMES, THEME_IDS, themeOf } from '../theme'

export type Choice = {
  label: string
  /** a fixed hint, or one that depends on the current settings (e.g. 12/24h) */
  hint?: string | ((s: Settings) => string)
  /** the settings this choice applies */
  value: Partial<Settings>
  /** offered only when this holds, e.g. the themes of the chosen occasion */
  when?: (s: Settings) => boolean
}

/** A text field instead of choices. */
export type TextField = {
  /** the setting it edits */
  setting: 'name'
  /** names the field for screen readers */
  label: string
  placeholder: string
  maxLength: number
}

export type Step = {
  id: string
  title: string
  subtitle?: string | ((s: Settings) => string)
  /** short name for the summary on the last page */
  name: string
  /** the options; a step has these or a text field */
  choices?: Choice[]
  text?: TextField
  /** shown only when this holds, e.g. the name page for a birthday */
  when?: (s: Settings) => boolean
  /** text for the summary on the last page */
  summary: (s: Settings) => string
}

const SECONDS = [5, 10, 30, 60]

const ANIMATION_NAMES: Record<MidnightAnimation, string> = {
  fireworks: 'Fireworks',
  confetti: 'Confetti',
  balloons: 'Balloons',
  none: 'No animation',
}

const offersAnimation = (animation: MidnightAnimation) => (s: Settings) => OCCASIONS[s.occasion].animations.includes(animation)

/**
 * One page per setting. Add a setting by adding a step here.
 * Keep each `id: '…',` on a line of its own: CI reads them to publish a page per step (.github/workflows/ci.yml).
 */
export const STEPS: Step[] = [
  {
    id: 'occasion',
    name: 'Occasion',
    title: "What's the occasion?",
    subtitle: 'It sets the colors and the midnight animation.',
    choices: OCCASION_IDS.map((o) => ({ label: OCCASIONS[o].name, hint: OCCASIONS[o].hint, value: { occasion: o } })),
    summary: (s) => OCCASIONS[s.occasion].name,
  },
  {
    id: 'name',
    name: 'Name',
    title: 'Whose birthday?',
    subtitle: 'Shown under the clock at midnight. Leave it empty for just “Happy birthday!”',
    text: { setting: 'name', label: 'Name', placeholder: 'Their name', maxLength: NAME_MAX },
    when: (s) => s.occasion === 'birthday',
    summary: (s) => s.name.trim() || 'No name',
  },
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
    subtitle: (s) => `Colors for ${s.occasion === 'birthday' ? 'the birthday' : "New Year's Eve"}.`,
    choices: THEME_IDS.map((id) => ({
      label: THEMES[id].name,
      hint: THEMES[id].hint,
      value: { theme: id },
      when: (s: Settings) => OCCASIONS[s.occasion].themes.includes(id),
    })),
    // Classic has a single theme
    when: (s) => OCCASIONS[s.occasion].themes.length > 1,
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
  },
  {
    id: 'animation',
    name: 'Midnight animation',
    title: 'Midnight animation',
    subtitle: 'It plays in the seconds after midnight, every time the clock rolls over.',
    choices: [
      {
        label: 'Balloons',
        hint: (s: Settings) => `Balloons float up at ${formatTime(0, s.hour12)}`,
        value: { animation: 'balloons' },
        when: offersAnimation('balloons'),
      },
      {
        label: 'Fireworks',
        hint: (s: Settings) => `Rockets go up at ${formatTime(0, s.hour12)}`,
        value: { animation: 'fireworks' },
        when: offersAnimation('fireworks'),
      },
      { label: 'Confetti', hint: (s: Settings) => `Confetti pops at ${formatTime(0, s.hour12)}`, value: { animation: 'confetti' } },
      { label: 'None', hint: 'Just the clock', value: { animation: 'none' } },
    ],
    summary: (s) => ANIMATION_NAMES[s.animation],
  },
]

export const isSelected = (choice: Choice, s: Settings) =>
  (Object.keys(choice.value) as (keyof Settings)[]).every((k) => choice.value[k] === s[k])

export const hintText = (choice: Choice, s: Settings) =>
  typeof choice.hint === 'function' ? choice.hint(s) : choice.hint

/** The wizard's pages for these settings: the name page only for a birthday, no theme page for Classic. */
export const stepsFor = (s: Settings) => STEPS.filter((step) => !step.when || step.when(s))

/** The choices a step offers for these settings. */
export const choicesFor = (step: Step, s: Settings) => (step.choices ?? []).filter((c) => !c.when || c.when(s))

export const subtitleText = (step: Step, s: Settings) => (typeof step.subtitle === 'function' ? step.subtitle(s) : step.subtitle)

const summaryOf = (id: string, s: Settings) => STEPS.find((step) => step.id === id)!.summary(s)

/**
 * The settings in three short lines: the occasion ("Birthday · Mia · Sky"), the look ("24-hour · Simple")
 * and the loop, from 23:59:50 to 00:00:10.
 */
export const describe = (s: Settings) => ({
  occasion: [
    OCCASIONS[s.occasion].name,
    s.occasion === 'birthday' && s.name.trim(),
    OCCASIONS[s.occasion].themes.length > 1 && themeOf(s.theme).name,
  ]
    .filter(Boolean)
    .join(' · '),
  look: `${summaryOf('format', s)} · ${summaryOf('style', s)}`,
  from: formatTime(loopTime(s.before, 0), s.hour12),
  to: formatTime(s.after, s.hour12),
})
