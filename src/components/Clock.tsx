import { useState, type CSSProperties } from 'react'
import type { Frame } from '../model/engine'
import type { Moment } from '../model/moment'
import { themeById, type DigitAnim } from '../model/themes'
import { formatDate, timeParts } from '../lib/format'

/* ---------- a single character that rolls when it changes ---------- */

function useChange<T>(value: T) {
  const [s, setS] = useState({ cur: value, prev: null as T | null, n: 0 })
  if (value !== s.cur) {
    const next = { cur: value, prev: s.cur, n: s.n + 1 }
    setS(next)
    return next
  }
  return s
}

function RollChar({ ch, anim }: { ch: string; anim: DigitAnim }) {
  const s = useChange(ch)
  if (anim === 'instant') return <span className="ch">{ch}</span>
  return (
    <span className="ch">
      {s.prev !== null && (
        <span key={`o${s.n}`} className={`ch-out ch-${anim}`} aria-hidden>
          {s.prev}
        </span>
      )}
      <span key={`i${s.n}`} className={s.n ? `ch-in ch-${anim}` : undefined}>
        {s.cur}
      </span>
    </span>
  )
}

/* ---------- split-flap card (two digits per card) ---------- */

function FlipCard({ value }: { value: string }) {
  const s = useChange(value)
  const prev = s.prev ?? s.cur
  return (
    <span className="flip-card">
      <span className="fc-half fc-top"><span>{s.cur}</span></span>
      <span className="fc-half fc-bottom"><span>{prev}</span></span>
      {s.prev !== null && (
        <>
          <span key={`a${s.n}`} className="fc-half fc-top fc-flap-top"><span>{s.prev}</span></span>
          <span key={`b${s.n}`} className="fc-half fc-bottom fc-flap-bottom"><span>{s.cur}</span></span>
        </>
      )}
      <span className="fc-hinge" />
    </span>
  )
}

/* ---------- groups ---------- */

function Group({ value, anim, ghost }: { value: string; anim: DigitAnim; ghost?: boolean }) {
  if (anim === 'flip') return <FlipCard value={value} />
  return (
    <span className="grp">
      {ghost && <span className="ghost" aria-hidden>{'8'.repeat(value.length)}</span>}
      {value.split('').map((c, i) => (
        <RollChar key={i} ch={c} anim={anim} />
      ))}
    </span>
  )
}

function Line({ text, className }: { text: string; className: string }) {
  const s = useChange(text)
  return (
    <div className={className}>
      {s.prev !== null && (
        <span key={`o${s.n}`} className="line-out" aria-hidden>
          {s.prev}
        </span>
      )}
      <span key={`i${s.n}`} className={s.n ? 'line-in' : undefined}>
        {s.cur}
      </span>
    </div>
  )
}

export interface ClockProps {
  moment: Moment
  frame: Frame
  /** fire celebratory styling (glow pulse) */
  celebrating?: boolean
  className?: string
  style?: CSSProperties
}

export default function Clock({ moment: m, frame, celebrating, className = '', style }: ClockProps) {
  const theme = themeById(m.theme)
  const anim = theme.anim
  const p = timeParts(frame.t, m.hour12)
  const ghost = theme.id === 'lcd'
  const after = frame.phase === 'after'
  const countdown = m.countdown && frame.phase === 'lead' && frame.remaining <= 10_000 && frame.remaining > 0
  const cd = Math.ceil(frame.remaining / 1000)
  const sep = <span className="sep">:</span>
  // DSEG fonts render "!" as a full-width blank; a normal space is too narrow to read
  const seg = (txt: string) => (ghost ? txt.replace(/ /g, '!') : txt)

  return (
    <div
      className={`clock theme-${theme.id} ${m.showSeconds ? 'with-sec' : 'no-sec'} ${after ? 'is-after' : 'is-lead'} ${celebrating ? 'celebrate' : ''} ${className}`}
      style={style}
    >
      <div className="clock-inner">
        <div className="title">{seg(m.title)}</div>
        <div className="time" aria-label={`${p.h}:${p.m}${m.showSeconds ? ':' + p.s : ''} ${p.ampm}`}>
          <Group value={p.h} anim={anim} ghost={ghost} />
          {sep}
          <Group value={p.m} anim={anim} ghost={ghost} />
          {m.showSeconds && (
            <>
              {sep}
              <Group value={p.s} anim={anim} ghost={ghost} />
            </>
          )}
          {m.hour12 && <span className="ampm">{p.ampm}</span>}
        </div>
        {m.showDate && <Line className="date" text={seg(formatDate(frame.t, m.showYear))} />}
        <div className="message-slot">
          {countdown ? (
            <span key={cd} className="countdown">{cd}</span>
          ) : (
            <span key={`m${frame.cycle}-${after}`} className={`message ${after && m.message ? 'show' : ''}`}>
              {seg(m.message)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
