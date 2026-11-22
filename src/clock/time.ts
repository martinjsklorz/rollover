import { useEffect, useState } from 'react'

const DAY = 24 * 3600

/**
 * Seconds since the loop started, counting 0 … length and then starting over.
 * Remount (e.g. with a `key`) to restart the loop.
 */
export function useLoop(length: number) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => (e + 1) % (length + 1)), 1000)
    return () => clearInterval(id)
  }, [length])
  return elapsed
}

/** Time of day in seconds: `before` seconds before midnight plus the elapsed loop time. */
export function loopTime(before: number, elapsed: number) {
  return (DAY - before + elapsed) % DAY
}

const pad = (n: number) => String(n).padStart(2, '0')

export type TimeParts = { hh: string; mm: string; ss: string; ampm: '' | 'AM' | 'PM' }

export function timeParts(t: number, hour12: boolean): TimeParts {
  const h = Math.floor(t / 3600)
  const mm = pad(Math.floor(t / 60) % 60)
  const ss = pad(t % 60)
  if (!hour12) return { hh: pad(h), mm, ss, ampm: '' }
  return { hh: pad(h % 12 || 12), mm, ss, ampm: h < 12 ? 'AM' : 'PM' }
}

export function formatTime(t: number, hour12: boolean) {
  const p = timeParts(t, hour12)
  return `${p.hh}:${p.mm}:${p.ss}${p.ampm ? ' ' + p.ampm : ''}`
}
