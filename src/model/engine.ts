import type { Moment } from './moment'

/**
 * The run clock. All timing derives from wall time + these few numbers, so pausing,
 * restarting, remote commands and background tabs can never drift the display.
 */
export interface RunState {
  status: 'idle' | 'waiting' | 'running' | 'paused'
  /** wall ms at which virtual elapsed = 0 */
  startedAt: number
  /** wall ms when paused (null when not paused) */
  pausedAt: number | null
  /** wall ms when a delayed start begins running */
  waitUntil: number
}

export const IDLE_RUN: RunState = { status: 'idle', startedAt: 0, pausedAt: null, waitUntil: 0 }

export type Phase = 'lead' | 'after'

export interface Frame {
  /** virtual time to display (ms epoch, not floored) */
  t: number
  phase: Phase
  /** ms until the rollover (lead phase), else 0 */
  remaining: number
  /** ms since the rollover (after phase), else 0 */
  since: number
  /** increments every loop, so the UI can detect a restart */
  cycle: number
  /** the rollover instant (ms epoch) */
  target: number
}

export function targetInstant(m: Pick<Moment, 'date' | 'time'>): number {
  const [y, mo, d] = m.date.split('-').map(Number)
  const [h, mi] = m.time.split(':').map(Number)
  return new Date(y, (mo || 1) - 1, d || 1, h || 0, mi || 0, 0, 0).getTime()
}

/** For live mode: the configured target, or — if it has passed — the next daily occurrence. */
export function liveTarget(m: Moment, now: number): number {
  let t = targetInstant(m)
  const grace = m.hold * 1000
  if (t + grace >= now) return t
  const [h, mi] = m.time.split(':').map(Number)
  const d = new Date(now)
  d.setHours(h || 0, mi || 0, 0, 0)
  t = d.getTime()
  if (t + grace < now) {
    d.setDate(d.getDate() + 1)
    t = d.getTime()
  }
  return t
}

export function elapsedOf(run: RunState, now: number): number {
  if (run.status === 'idle') return 0
  if (run.status === 'waiting') return 0
  const ref = run.pausedAt ?? now
  return Math.max(0, ref - run.startedAt)
}

export function computeFrame(m: Moment, run: RunState, now: number): Frame {
  if (m.mode === 'live') {
    const target = liveTarget(m, now)
    const lead = now < target
    return { t: now, phase: lead ? 'lead' : 'after', remaining: lead ? target - now : 0, since: lead ? 0 : now - target, cycle: 0, target }
  }
  const target = targetInstant(m)
  const leadMs = m.leadIn * 1000
  const cycleMs = Math.max(1000, (m.leadIn + m.hold) * 1000)
  const elapsed = elapsedOf(run, now)
  let e = elapsed
  let cycle = 0
  if (m.loop) {
    cycle = Math.floor(elapsed / cycleMs)
    e = elapsed - cycle * cycleMs
  }
  const t = target - leadMs + e
  const lead = t < target
  return { t, phase: lead ? 'lead' : 'after', remaining: lead ? target - t : 0, since: lead ? 0 : t - target, cycle, target }
}

/** Jump so the rollover happens in `secondsBefore` seconds. */
export function jumpStartedAt(m: Moment, now: number, secondsBefore: number): number {
  const lead = Math.min(m.leadIn, secondsBefore)
  return now - (m.leadIn - lead) * 1000
}
