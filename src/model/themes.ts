export type ThemeId = 'nightlight' | 'bedside' | 'flip' | 'lcd' | 'neon' | 'keepsake'
export type DigitAnim = 'roll' | 'flip' | 'instant' | 'flicker'

export interface ThemeDef {
  id: ThemeId
  name: string
  note: string
  anim: DigitAnim
  /** swatch: [background, foreground] */
  swatch: [string, string]
  /** colours used for celebration effects */
  burst: string[]
  /** default dimmer brightness (0.1–1) suggested for this theme */
  brightness: number
}

export const THEMES: ThemeDef[] = [
  {
    id: 'nightlight', name: 'Nightlight', note: 'Ember red on black. Won’t wake anyone.',
    anim: 'roll', swatch: ['#000000', '#ff4a2b'], burst: ['#ff4a2b', '#ff7a3d', '#b3261e'], brightness: 0.7,
  },
  {
    id: 'bedside', name: 'Bedside', note: 'Soft white, thin and calm.',
    anim: 'roll', swatch: ['#0b0c10', '#e9edf5'], burst: ['#ffffff', '#c9d4ff', '#8fa2ff'], brightness: 1,
  },
  {
    id: 'flip', name: 'Flip', note: 'Split-flap cards that really flip.',
    anim: 'flip', swatch: ['#141414', '#f2f2f2'], burst: ['#f2f2f2', '#ffcf5a', '#ff7a59'], brightness: 1,
  },
  {
    id: 'lcd', name: 'LCD', note: 'The alarm clock from 1994.',
    anim: 'instant', swatch: ['#050805', '#59ff7a'], burst: ['#59ff7a', '#b6ff6a', '#1fd65f'], brightness: 1,
  },
  {
    id: 'neon', name: 'Neon', note: 'Glowing tubes for parties and reels.',
    anim: 'flicker', swatch: ['#0a0414', '#ff4fd8'], burst: ['#ff4fd8', '#39e6ff', '#fff36b', '#a46bff'], brightness: 1,
  },
  {
    id: 'keepsake', name: 'Keepsake', note: 'Warm paper & serif. A printed memory.',
    anim: 'roll', swatch: ['#f3ece0', '#2b2118'], burst: ['#c9a36b', '#e7c8a0', '#8e5b3a', '#ffffff'], brightness: 1,
  },
]

export const themeById = (id: ThemeId) => THEMES.find((t) => t.id === id) ?? THEMES[0]
