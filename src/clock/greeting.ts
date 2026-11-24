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
 * The line under the digits at midnight, or null for none:
 * New Year's Eve "Happy New Year 2027!", Birthday "Happy birthday, Mia!",
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
    case 'classic':
      return s.message.trim() || null
  }
}
