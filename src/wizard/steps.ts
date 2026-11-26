import { useMemo } from 'react'
import { MESSAGE_MAX, NAME_MAX, type MidnightAnimation, type Settings } from '../settings'
import { useStrings, type Strings } from '../i18n'
import en from '../i18n/languages/en'
import { formatTime, loopTime } from '../clock/time'
import { OCCASIONS, OCCASION_IDS } from '../occasions'
import { THEME_IDS } from '../theme'
import { playTune, stopTune } from '../sound'

export type Choice = {
  label: string
  /** a fixed hint, or one that depends on the current settings (e.g. 12/24h) */
  hint?: string | ((s: Settings) => string)
  /** the settings this choice applies */
  value: Partial<Settings>
  /** offered only when this holds, e.g. the themes of the chosen occasion */
  when?: (s: Settings) => boolean
  /** runs when the user picks it (a tap, or Select on a TV; not a focus change), with the new settings */
  onPress?: (s: Settings) => void
}

/** A text field instead of choices. */
export type TextField = {
  /** the setting it edits */
  setting: 'name' | 'message'
  /** names the field for screen readers */
  label: string
  placeholder: string
  maxLength: number
  /** a name starts every word with a capital, a message only the first */
  autoCapitalize: 'words' | 'sentences'
}

export type Step = {
  id: string
  title: string
  subtitle?: string | ((s: Settings) => string | undefined)
  /** short name for the summary on the last page */
  name: string
  /** the options; a step has these or a text field */
  choices?: Choice[]
  text?: TextField
  /** shown only when this holds, e.g. the name page for a birthday, the message page for Classic */
  when?: (s: Settings) => boolean
  /** text for the summary on the last page */
  summary: (s: Settings) => string
}

const SECONDS = [5, 10, 30, 60]

const offersAnimation = (animation: MidnightAnimation) => (s: Settings) => OCCASIONS[s.occasion].animations.includes(animation)

/**
 * One page per setting, in the language of `t`. Add a setting by adding a step here.
 * Keep each `id: '…',` on a line of its own: CI reads them to publish a page per step (.github/workflows/ci.yml).
 */
export const stepsIn = (t: Strings): Step[] => {
  const animationNames: Record<MidnightAnimation, string> = {
    fireworks: t.animation.fireworks,
    confetti: t.animation.confetti,
    balloons: t.animation.balloons,
    lanterns: t.animation.lanterns,
    none: t.animation.noneSummary,
  }
  const time = (seconds: number, hour12: boolean) => formatTime(seconds, hour12, t.dayPeriod)
  /** the last second before midnight and midnight, e.g. "23:59:59 → 00:00:00" */
  const rollover = (hour12: boolean) => `${time(loopTime(1, 0), hour12)} → ${time(0, hour12)}`
  return [
    {
      id: 'occasion',
      name: t.occasion.name,
      title: t.occasion.title,
      subtitle: t.occasion.subtitle,
      choices: OCCASION_IDS.map((o) => ({ label: t.occasions[o].name, hint: t.occasions[o].hint, value: { occasion: o } })),
      summary: (s) => t.occasions[s.occasion].name,
    },
    {
      id: 'name',
      name: t.name.name,
      title: t.name.title,
      subtitle: t.name.subtitle,
      text: { setting: 'name', label: t.name.label, placeholder: t.name.placeholder, maxLength: NAME_MAX, autoCapitalize: 'words' },
      when: (s) => s.occasion === 'birthday',
      summary: (s) => s.name.trim() || t.name.none,
    },
    {
      id: 'message',
      name: t.message.name,
      title: t.message.title,
      subtitle: t.message.subtitle,
      text: {
        setting: 'message',
        label: t.message.label,
        placeholder: t.message.placeholder,
        maxLength: MESSAGE_MAX,
        autoCapitalize: 'sentences',
      },
      when: (s) => s.occasion === 'classic',
      summary: (s) => (s.message.trim() ? t.message.quote(s.message.trim()) : t.message.none),
    },
    {
      id: 'format',
      name: t.format.name,
      title: t.format.title,
      choices: [
        { label: t.format.hour24, hint: rollover(false), value: { hour12: false } },
        { label: t.format.hour12, hint: rollover(true), value: { hour12: true } },
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
      subtitle: (s) => (s.occasion === 'classic' ? undefined : t.theme.subtitle[s.occasion]),
      choices: THEME_IDS.map((id) => ({
        label: t.themes[id].name,
        hint: t.themes[id].hint,
        value: { theme: id },
        when: (s: Settings) => OCCASIONS[s.occasion].themes.includes(id),
      })),
      // Classic has a single theme
      when: (s) => OCCASIONS[s.occasion].themes.length > 1,
      summary: (s) => t.themes[s.theme].name,
    },
    {
      id: 'before',
      name: t.before.name,
      title: t.before.title,
      subtitle: t.before.subtitle,
      choices: SECONDS.map((sec) => ({
        label: t.seconds(sec),
        hint: (s: Settings) => t.before.hint(time(loopTime(sec, 0), s.hour12)),
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
        hint: (s: Settings) => t.after.hint(time(sec, s.hour12)),
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
        {
          label: t.animation.balloons,
          hint: (s: Settings) => t.animation.balloonsHint(time(0, s.hour12)),
          value: { animation: 'balloons' },
          when: offersAnimation('balloons'),
        },
        {
          label: t.animation.lanterns,
          hint: (s: Settings) => t.animation.lanternsHint(time(0, s.hour12)),
          value: { animation: 'lanterns' },
          when: offersAnimation('lanterns'),
        },
        {
          label: t.animation.fireworks,
          hint: (s: Settings) => t.animation.fireworksHint(time(0, s.hour12)),
          value: { animation: 'fireworks' },
          when: offersAnimation('fireworks'),
        },
        {
          label: t.animation.confetti,
          hint: (s: Settings) => t.animation.confettiHint(time(0, s.hour12)),
          value: { animation: 'confetti' },
          when: offersAnimation('confetti'),
        },
        { label: t.animation.none, hint: t.animation.noneHint, value: { animation: 'none' }, when: offersAnimation('none') },
      ],
      summary: (s) => animationNames[s.animation],
    },
    {
      id: 'sound',
      name: t.sound.name,
      title: t.sound.title,
      subtitle: t.sound.subtitle,
      choices: [
        {
          label: t.sound.musicbox,
          hint: (s: Settings) => t.sound.musicboxHint[s.occasion](time(0, s.hour12)),
          value: { sound: 'musicbox' },
          // a sample of the tune; the preview above stays silent, it loops on every page
          onPress: (s: Settings) => playTune(s.occasion),
        },
        { label: t.sound.off, hint: t.sound.offHint, value: { sound: 'off' }, onPress: () => stopTune() },
      ],
      summary: (s) => (s.sound === 'musicbox' ? t.sound.musicbox : t.sound.off),
    },
  ]
}

/** All the steps in the app's language; stepsFor picks the ones the settings show. */
export function useSteps() {
  const t = useStrings()
  return useMemo(() => stepsIn(t), [t])
}

/** Every step's id in order, for routing; the same in every language. */
export const STEP_IDS = stepsIn(en).map((step) => step.id)

export const isSelected = (choice: Choice, s: Settings) =>
  (Object.keys(choice.value) as (keyof Settings)[]).every((k) => choice.value[k] === s[k])

export const hintText = (choice: Choice, s: Settings) =>
  typeof choice.hint === 'function' ? choice.hint(s) : choice.hint

/** The wizard's pages for these settings: the name page only for a birthday, the message page only for Classic, no theme page for Classic. */
export const stepsFor = (steps: Step[], s: Settings) => steps.filter((step) => !step.when || step.when(s))

/** The choices a step offers for these settings. */
export const choicesFor = (step: Step, s: Settings) => (step.choices ?? []).filter((c) => !c.when || c.when(s))

export const subtitleText = (step: Step, s: Settings) => (typeof step.subtitle === 'function' ? step.subtitle(s) : step.subtitle)

/**
 * The settings in three short lines: the occasion ("Birthday · Mia · Sky", "Classic · “We did it!”"), the look
 * ("24-hour · Simple", "24-hour · Simple · Music box" with sound) and the loop, from 23:59:50 to 00:00:10.
 * `steps` are all the steps, in the app's language `t`.
 */
export const describe = (s: Settings, steps: Step[], t: Strings) => {
  const summaryOf = (id: string) => steps.find((step) => step.id === id)!.summary(s)
  return {
    occasion: [
      summaryOf('occasion'),
      s.occasion === 'birthday' && s.name.trim(),
      s.occasion === 'classic' && s.message.trim() && summaryOf('message'),
      OCCASIONS[s.occasion].themes.length > 1 && summaryOf('theme'),
    ]
      .filter(Boolean)
      .join(' · '),
    look: [summaryOf('format'), summaryOf('style'), s.sound === 'musicbox' && t.sound.musicboxShort].filter(Boolean).join(' · '),
    from: formatTime(loopTime(s.before, 0), s.hour12, t.dayPeriod),
    to: formatTime(s.after, s.hour12, t.dayPeriod),
  }
}
