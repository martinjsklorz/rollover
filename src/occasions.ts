import type { MidnightAnimation, Settings } from './settings'
import type { ThemeId } from './theme'

/** What the midnight is for. Picked first in the wizard; it decides which themes and animations are offered. */
export type Occasion = 'classic' | 'newyear' | 'birthday' | 'lunar'

/** Names and hints are in src/i18n (`occasions`). */
type OccasionInfo = {
  /** themes offered for it, the first is the default. With only one, the wizard skips the theme page. */
  themes: ThemeId[]
  /** midnight animations offered for it, the first is the default */
  animations: MidnightAnimation[]
}

export const OCCASIONS: Record<Occasion, OccasionInfo> = {
  classic: {
    themes: ['classic'],
    animations: ['fireworks', 'confetti', 'none'],
  },
  newyear: {
    themes: ['champagne', 'midnight', 'party'],
    animations: ['fireworks', 'confetti', 'none'],
  },
  birthday: {
    themes: ['bubblegum', 'sky', 'sprinkles'],
    animations: ['balloons', 'confetti', 'none'],
  },
  // Spring Festival, Seollal, Tết: the countdown on Lunar New Year's Eve
  lunar: {
    themes: ['lantern', 'gilded', 'plum'],
    animations: ['lanterns', 'fireworks', 'confetti', 'none'],
  },
}

export const OCCASION_IDS = Object.keys(OCCASIONS) as Occasion[]

/** The settings with a theme and an animation the occasion offers: its defaults replace any it doesn't. */
export function fitOccasion(s: Settings): Settings {
  const { themes, animations } = OCCASIONS[s.occasion]
  return {
    ...s,
    theme: themes.includes(s.theme) ? s.theme : themes[0],
    animation: animations.includes(s.animation) ? s.animation : animations[0],
  }
}
