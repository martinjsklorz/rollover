import type { MidnightAnimation, Settings } from './settings'
import type { ThemeId } from './theme'

/** What the midnight is for. Picked first in the wizard; it decides which themes and animations are offered. */
export type Occasion = 'classic' | 'newyear' | 'birthday'

type OccasionInfo = {
  name: string
  hint: string
  /** themes offered for it, the first is the default. With only one, the wizard skips the theme page. */
  themes: ThemeId[]
  /** midnight animations offered for it, the first is the default */
  animations: MidnightAnimation[]
}

export const OCCASIONS: Record<Occasion, OccasionInfo> = {
  classic: {
    name: 'Classic',
    hint: 'Any midnight, white and ember',
    themes: ['classic'],
    animations: ['fireworks', 'confetti', 'none'],
  },
  newyear: {
    name: "New Year's Eve",
    hint: 'Gold, ice blue or neon',
    themes: ['champagne', 'midnight', 'party'],
    animations: ['fireworks', 'confetti', 'none'],
  },
  birthday: {
    name: 'Birthday',
    hint: 'Candy colors, balloons and a name',
    themes: ['bubblegum', 'sky', 'sprinkles'],
    animations: ['balloons', 'confetti', 'none'],
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
