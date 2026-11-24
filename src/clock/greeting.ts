import type { Strings } from '../i18n'
import type { Settings } from '../settings'

/**
 * The twelve zodiac animals in the order of `year % 12`: 2020 Rat, 2024 Dragon, 2026 Horse, 2027 Goat.
 * Names are in src/i18n (`zodiac`).
 */
export const ZODIAC = ['monkey', 'rooster', 'dog', 'pig', 'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat'] as const

export type ZodiacAnimal = (typeof ZODIAC)[number]

/**
 * The year whose Lunar New Year a midnight on `now` stands for. Rollover never counts to a real date,
 * so there's no lunar calendar: in January and February it's this year (the festival falls between
 * 21 January and 20 February), later in the year it's the next one.
 */
export const lunarYear = (now: Date) => (now.getMonth() <= 1 ? now.getFullYear() : now.getFullYear() + 1)

export const zodiacOf = (year: number): ZodiacAnimal => ZODIAC[((year % 12) + 12) % 12]

/** The line that fades in under the digits at midnight, or null if the occasion has none. */
export function greetingFor(s: Settings, t: Strings, now: Date): string | null {
  switch (s.occasion) {
    case 'birthday': {
      const name = s.name.trim()
      return name ? t.clock.birthdayName(name) : t.clock.birthday
    }
    case 'lunar':
      return t.clock.lunarNewYear(zodiacOf(lunarYear(now)))
    default:
      return null
  }
}
