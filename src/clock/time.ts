import { useEffect, useState } from 'react'
import type { Strings } from '../i18n'

const DAY = 24 * 3600

/**
 * Seconds since `startedAt` (a Date.now() timestamp), counting 0 … length and then starting over.
 * Read from the real time, so a remount, a stalled timer or a throttled tab doesn't shift the loop.
 */
export function useLoop(length: number, startedAt: number) {
  const [elapsed, setElapsed] = useState(() => elapsedSince(startedAt, length))
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>
    const tick = () => {
      setElapsed(elapsedSince(startedAt, length))
      // wake just after the next whole second since startedAt
      id = setTimeout(tick, 1000 - mod(Date.now() - startedAt, 1000) + 5)
    }
    tick()
    return () => clearTimeout(id)
  }, [length, startedAt])
  return elapsed
}

/** Remainder that is never negative, also when the device's clock is set back past `startedAt`. */
const mod = (n: number, m: number) => ((n % m) + m) % m

const elapsedSince = (startedAt: number, length: number) => mod(Math.floor((Date.now() - startedAt) / 1000), length + 1)

/** Time of day in seconds: `before` seconds before midnight plus the elapsed loop time. */
export function loopTime(before: number, elapsed: number) {
  return (DAY - before + elapsed) % DAY
}

const pad = (n: number) => String(n).padStart(2, '0')

/** AM/PM in one language: the words, and whether they go before or after the time (see languages/en.ts) */
export type DayPeriod = Strings['dayPeriod']

/** `period` is which half of the day, not its name: the name comes from the language's DayPeriod */
export type TimeParts = { hh: string; mm: string; ss: string; period: '' | 'am' | 'pm' }

export function timeParts(t: number, hour12: boolean): TimeParts {
  const h = Math.floor(t / 3600)
  const mm = pad(Math.floor(t / 60) % 60)
  const ss = pad(t % 60)
  if (!hour12) return { hh: pad(h), mm, ss, period: '' }
  return { hh: pad(h % 12 || 12), mm, ss, period: h < 12 ? 'am' : 'pm' }
}

/** The AM/PM marker for these parts in this language, '' on a 24-hour clock. */
export const periodText = (p: TimeParts, dayPeriod: DayPeriod) => (p.period ? dayPeriod[p.period] : '')

/** e.g. "23:59:50", "11:59:50 PM", "午後11:59:50", "오후 11:59:50" */
export function formatTime(t: number, hour12: boolean, dayPeriod: DayPeriod) {
  const p = timeParts(t, hour12)
  const time = `${p.hh}:${p.mm}:${p.ss}`
  const marker = periodText(p, dayPeriod)
  if (!marker) return time
  // a no-break space, so a hint never wraps between the time and its marker
  const space = dayPeriod.spaced ? '\u00a0' : ''
  return dayPeriod.position === 'before' ? marker + space + time : time + space + marker
}
