/** Brand palette. Same values as brand/README.md and brand/tools/build.mjs. */
export const colors = {
  bg: '#000000',
  text: '#FFFFFF',
  muted: '#8E8E93',
  /** card and pressed surfaces */
  surface: '#1C1C1E',
  /** hairlines and borders */
  line: '#2C2C2E',
  /** the one accent: midnight. At most one ember element per screen. */
  ember: '#FF5A36',
}

/**
 * Clock themes, for New Year's Eve or any midnight.
 * The background stays true black in every theme (see brand/README.md); a theme colors the
 * digits, the flip cards and the midnight animation.
 */
export type ClockTheme = {
  name: string
  hint: string
  /** digits */
  text: string
  /** AM/PM on the flip cards */
  muted: string
  /** flip-clock cards */
  surface: string
  /** soft glow around the simple digits */
  glow?: boolean
  /** firework and confetti colors, picked at random */
  accents: string[]
}

export const THEMES = {
  classic: {
    name: 'Classic',
    hint: 'White digits, ember and white sparkle',
    text: colors.text,
    muted: colors.muted,
    surface: colors.surface,
    accents: [colors.ember, '#FFFFFF', '#FFB29E'],
  },
  champagne: {
    name: 'Champagne',
    hint: 'Gold digits, golden sparkle',
    text: '#F2D58A',
    muted: '#A08A55',
    surface: '#1F1A10',
    glow: true,
    accents: ['#F2D58A', '#FFF4D6', '#E0A84A', '#FFFFFF'],
  },
  midnight: {
    name: 'Midnight blue',
    hint: 'Ice-blue digits, silver and blue sparkle',
    text: '#D3E2FF',
    muted: '#7D8BA8',
    surface: '#0F1A33',
    accents: ['#7FB2FF', '#D3E2FF', '#FFFFFF', '#9C8CFF'],
  },
  party: {
    name: 'Party',
    hint: 'Neon digits, sparkle in every color',
    text: '#FF6AD5',
    muted: '#A35A90',
    surface: '#24102A',
    glow: true,
    accents: ['#FF6AD5', '#4FE3FF', '#B6FF5C', '#FFE15C', '#FF8A3D'],
  },
} satisfies Record<string, ClockTheme>

export type ThemeId = keyof typeof THEMES

export const THEME_IDS = Object.keys(THEMES) as ThemeId[]

/** The theme for an id, Classic for an unknown one (e.g. settings saved by a newer version). */
export const themeOf = (id: string): ClockTheme => THEMES[id as ThemeId] ?? THEMES.classic
