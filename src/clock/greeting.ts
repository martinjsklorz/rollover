import type { Strings } from '../i18n'
import type { Settings } from '../settings'

/**
 * The year a New Year's Eve countdown rolls into, from the local date it runs on.
 * In January the new year has just begun (an early midnight for the kids on 1 January,
 * a re-shoot the morning after), so it's this year; any other month counts towards the next one.
 */
export function newYearOf(now: Date): number {
  const year = now.getFullYear()
  return now.getMonth() === 0 ? year : year + 1
}

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

/**
 * The line under the digits at midnight, or null for none:
 * New Year's Eve "Happy New Year 2027!", Birthday "Happy birthday, Mia!",
 * Lunar New Year the coming year's zodiac animal ("Happy Year of the Goat!"),
 * Classic the user's own message (none when it's empty).
 */
export function greetingFor(s: Settings, t: Strings, now: Date): string | null {
  switch (s.occasion) {
    case 'newyear':
      return t.clock.newYear(newYearOf(now))
    case 'birthday': {
      const name = s.name.trim()
      return name ? t.clock.birthdayName(name) : t.clock.birthday
    }
    case 'lunar':
      return t.clock.lunarNewYear(zodiacOf(lunarYear(now)))
    case 'classic':
      return s.message.trim() || null
  }
}
