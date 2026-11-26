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
 * Clock themes. Each belongs to an occasion (src/occasions.ts): Classic, New Year's Eve, Birthday or Lunar New Year.
 * The background stays true black in every theme (see brand/README.md); a theme colors the
 * digits, the flip cards, the greeting and the midnight animation. Names and hints are in src/i18n (`themes`).
 */
export type ClockTheme = {
  /** digits */
  text: string
  /** AM/PM on the flip cards */
  muted: string
  /** flip-clock cards */
  surface: string
  /** soft glow around the simple digits */
  glow?: boolean
  /** firework, confetti and balloon colors, picked at random. Lanterns take their paper from the first two. */
  accents: string[]
}

export const THEMES = {
  classic: {
    text: colors.text,
    muted: colors.muted,
    surface: colors.surface,
    accents: [colors.ember, '#FFFFFF', '#FFB29E'],
  },
  champagne: {
    text: '#F2D58A',
    muted: '#A08A55',
    surface: '#1F1A10',
    glow: true,
    accents: ['#F2D58A', '#FFF4D6', '#E0A84A', '#FFFFFF'],
  },
  midnight: {
    text: '#D3E2FF',
    muted: '#7D8BA8',
    surface: '#0F1A33',
    accents: ['#7FB2FF', '#D3E2FF', '#FFFFFF', '#9C8CFF'],
  },
  party: {
    text: '#FF6AD5',
    muted: '#A35A90',
    surface: '#24102A',
    glow: true,
    accents: ['#FF6AD5', '#4FE3FF', '#B6FF5C', '#FFE15C', '#FF8A3D'],
  },
  // Birthday: candy pastels, softer than Party's neon. The shared gold is the candle flame.
  bubblegum: {
    text: '#FFA8D6',
    muted: '#A9728F',
    surface: '#2A1422',
    glow: true,
    accents: ['#FF7EBF', '#FFD1E8', '#C9A7FF', '#FFE08A', '#FFFFFF'],
  },
  sky: {
    text: '#8FD0FF',
    muted: '#6E8FA8',
    surface: '#0E1F2E',
    glow: true,
    accents: ['#4FAEFF', '#A8DCFF', '#7FE3C4', '#FFE08A', '#FFFFFF'],
  },
  sprinkles: {
    text: colors.text,
    muted: colors.muted,
    surface: colors.surface,
    accents: ['#FF8FC7', '#7CC8FF', '#FFE08A', '#8CE6B0', '#C9A7FF', '#FFB07A'],
  },
  // Lunar New Year: lantern red and gold. No glow; red first, so the lanterns are red.
  lantern: {
    // a crimson red, clear of ember's orange
    text: '#FF4D5A',
    muted: '#B0565D',
    surface: '#2A0C10',
    accents: ['#F0303A', '#C81E2C', '#FFC94A', '#FFF1DC'],
  },
  gilded: {
    // deeper and redder than Champagne's pale gold
    text: '#FFBA45',
    muted: '#B07E3A',
    surface: '#2A1607',
    accents: ['#E8262E', '#C41E3A', '#FFBA45', '#FFE3A0', '#FFFFFF'],
  },
  plum: {
    text: '#FFD3E3',
    muted: '#A87E8F',
    surface: '#2A1620',
    accents: ['#FF9CC0', '#E8487A', '#FFFFFF', '#F5C451'],
  },
} satisfies Record<string, ClockTheme>

export type ThemeId = keyof typeof THEMES

export const THEME_IDS = Object.keys(THEMES) as ThemeId[]
