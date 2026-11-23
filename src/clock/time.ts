import { useEffect, useState } from 'react'

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
      id = setTimeout(tick, 1000 - ((Date.now() - startedAt) % 1000) + 5)
    }
    tick()
    return () => clearTimeout(id)
  }, [length, startedAt])
  return elapsed
}

const elapsedSince = (startedAt: number, length: number) => Math.floor((Date.now() - startedAt) / 1000) % (length + 1)

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
