import type { Frame } from '../model/engine'
import type { Moment } from '../model/moment'
import type { ThemeId } from '../model/themes'
import { camcorderDate, formatDate, timeParts } from './format'

export type OverlayStyle = 'camcorder' | 'theme'

interface Look {
  font: (px: number, weight?: number) => string
  color: string
  glow?: string
  roll: boolean
}

const LOOKS: Record<ThemeId, Look> = {
  nightlight: { font: (px, w = 300) => `${w} ${px}px "Inter Variable", system-ui, sans-serif`, color: '#ff4a2b', glow: 'rgba(255,60,20,.55)', roll: true },
  bedside: { font: (px, w = 250) => `${w} ${px}px "Inter Variable", system-ui, sans-serif`, color: '#ffffff', roll: true },
  flip: { font: (px, w = 600) => `${w} ${px}px "Oswald Variable", system-ui, sans-serif`, color: '#ffffff', roll: true },
  lcd: { font: (px) => `bold italic ${px}px "DSEG7 Classic", monospace`, color: '#59ff7a', glow: 'rgba(89,255,122,.6)', roll: false },
  neon: { font: (px) => `400 ${px}px "Tilt Neon", system-ui, sans-serif`, color: '#ff8ae6', glow: '#ff4fd8', roll: true },
  keepsake: { font: (px, w = 300) => `${w} ${px}px "Fraunces Variable", Georgia, serif`, color: '#fff6e8', roll: true },
}

export async function loadOverlayFonts() {
  const fams = ['300 40px "Inter Variable"', '600 40px "Oswald Variable"', 'bold italic 40px "DSEG7 Classic"', 'bold 40px "DSEG14 Classic"', '400 40px "Tilt Neon"', '300 40px "Fraunces Variable"']
  await Promise.all(fams.map((f) => document.fonts.load(f).catch(() => null)))
}

/* ---------- rolling characters on canvas ---------- */

type CharState = { cur: string; prev: string | null; at: number }
const ROLL_MS = 420
const ease = (p: number) => 1 - Math.pow(1 - p, 3)

export class OverlayRenderer {
  private chars = new Map<string, CharState>()
  private messageAt = 0
  private lastPhase = ''
  private lastCycle = -1
  flashAt = 0

  private rollText(ctx: CanvasRenderingContext2D, key: string, text: string, x: number, y: number, align: 'left' | 'center' | 'right', size: number, roll: boolean, now: number) {
    const ws = [...text].map((c) => ctx.measureText(c).width)
    const total = ws.reduce((a, b) => a + b, 0)
    let cx = align === 'left' ? x : align === 'center' ? x - total / 2 : x - total
    ctx.textAlign = 'left'
    ;[...text].forEach((c, i) => {
      const id = `${key}${i}`
      let s = this.chars.get(id)
      if (!s) {
        s = { cur: c, prev: null, at: 0 }
        this.chars.set(id, s)
      } else if (s.cur !== c) {
        s.prev = s.cur
        s.cur = c
        s.at = now
      }
      const p = roll && s.prev !== null ? Math.min(1, (now - s.at) / ROLL_MS) : 1
      const e = ease(p)
      const d = size * 0.55
      const a0 = ctx.globalAlpha
      if (p < 1 && s.prev !== null) {
        ctx.globalAlpha = a0 * (1 - e)
        ctx.fillText(s.prev, cx, y - d * e)
        ctx.globalAlpha = a0 * e
        ctx.fillText(s.cur, cx, y + d * (1 - e))
        ctx.globalAlpha = a0
      } else {
        ctx.fillText(s.cur, cx, y)
      }
      cx += ws[i]
    })
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, m: Moment, f: Frame, style: OverlayStyle, now: number) {
    if (f.phase !== this.lastPhase || f.cycle !== this.lastCycle) {
      if (f.phase === 'after' && this.lastPhase === 'lead') {
        this.messageAt = now
        this.flashAt = now
      }
      if (f.phase === 'lead') this.messageAt = 0
      if (f.phase === 'after' && !this.lastPhase) this.messageAt = now - 2000
      this.lastPhase = f.phase
      this.lastCycle = f.cycle
    }
    const p = timeParts(f.t, m.hour12)
    const time = `${p.h}:${p.m}${m.showSeconds ? ':' + p.s : ''}`
    const short = Math.min(w, h)
    ctx.save()
    ctx.textBaseline = 'alphabetic'

    if (style === 'camcorder') {
      const size = short * 0.085
      const margin = short * 0.06
      ctx.fillStyle = '#ffb02e'
      ctx.shadowColor = 'rgba(0,0,0,.7)'
      ctx.shadowBlur = size * 0.12
      ctx.shadowOffsetX = size * 0.05
      ctx.shadowOffsetY = size * 0.05
      ctx.font = `bold italic ${size}px "DSEG7 Classic", monospace`
      this.rollText(ctx, 't', time + (p.ampm ? ' ' : ''), w - margin, h - margin, 'right', size, false, now)
      if (m.showDate) {
        ctx.font = `bold italic ${size * 0.62}px "DSEG14 Classic", monospace`
        ctx.textAlign = 'right'
        ctx.fillText(camcorderDate(f.t).replace(/ /g, '!'), w - margin, h - margin - size * 1.35)
      }
      ctx.font = `bold italic ${size * 0.55}px "DSEG14 Classic", monospace`
      ctx.textAlign = 'left'
      if (m.title) ctx.fillText(m.title.toUpperCase().replace(/ /g, '!'), margin, margin + size * 0.55)
      if (this.messageAt && m.message) {
        const blink = Math.floor((now - this.messageAt) / 600) % 2 === 0 || now - this.messageAt > 3600
        if (blink) ctx.fillText(m.message.toUpperCase().replace(/ /g, '!'), margin, h - margin)
      }
      ctx.restore()
      return
    }

    // theme style: lower-third, the theme's typeface
    const look = LOOKS[m.theme]
    const len = time.length + (p.ampm ? 1.4 : 0)
    const size = Math.min(short * 0.2, (w * 0.8) / (len * 0.62))
    const cx = w / 2
    const baseY = h - short * 0.2
    ctx.fillStyle = look.color
    const glowBoost = this.flashAt ? Math.max(0, 1 - (now - this.flashAt) / 2500) : 0
    ctx.shadowColor = look.glow ?? 'rgba(0,0,0,.65)'
    ctx.shadowBlur = size * (look.glow ? 0.25 + glowBoost * 0.6 : 0.12)
    ctx.font = look.font(size)
    this.rollText(ctx, 't', time + (p.ampm ? ' ' + p.ampm : ''), cx, baseY, 'center', size, look.roll, now)
    ctx.shadowColor = 'rgba(0,0,0,.65)'
    ctx.shadowBlur = size * 0.1
    if (m.showDate) {
      ctx.font = look.font(size * 0.22, 400)
      ctx.globalAlpha = 0.9
      this.rollText(ctx, 'd', formatDate(f.t, m.showYear), cx, baseY + size * 0.42, 'center', size * 0.22, look.roll, now)
      ctx.globalAlpha = 1
    }
    if (m.title) {
      ctx.font = look.font(size * 0.2, 500)
      ctx.textAlign = 'center'
      ctx.fillText(m.title, cx, baseY - size * 0.95)
    }
    if (this.messageAt && m.message) {
      const a = Math.min(1, (now - this.messageAt) / 900)
      ctx.globalAlpha = ease(a)
      ctx.font = look.font(size * 0.3, 400)
      ctx.textAlign = 'center'
      ctx.fillText(m.message, cx, short * 0.14 + size * 0.3 * (1 - ease(a)) * 0.5 + size * 0.15)
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }
}
