import confetti from 'canvas-confetti'
import type { ThemeDef } from '../model/themes'

export type Burst = (theme: ThemeDef, intensity?: number) => void

/** Confetti bound to our own canvas so the dimmer overlay also dims it. */
export function makeBurst(canvas: HTMLCanvasElement, fitToWindow = true): { fire: Burst; reset: () => void } {
  const c = confetti.create(canvas, { resize: fitToWindow, useWorker: false, disableForReducedMotion: true })
  const fire: Burst = (theme, intensity = 1) => {
    const colors = theme.burst
    const n = Math.round(90 * intensity)
    const base = { colors, ticks: 260, gravity: 0.9, scalar: 1.1, disableForReducedMotion: true }
    void c({ ...base, particleCount: n, spread: 75, startVelocity: 48, origin: { x: 0.5, y: 0.62 } })
    setTimeout(() => {
      void c({ ...base, particleCount: Math.round(n / 2), angle: 60, spread: 60, origin: { x: 0, y: 0.8 } })
      void c({ ...base, particleCount: Math.round(n / 2), angle: 120, spread: 60, origin: { x: 1, y: 0.8 } })
    }, 220)
    setTimeout(() => {
      void c({ ...base, particleCount: Math.round(n / 1.5), spread: 160, startVelocity: 30, origin: { x: 0.5, y: 0.35 }, shapes: ['star'] })
    }, 650)
  }
  return { fire, reset: () => c.reset() }
}
