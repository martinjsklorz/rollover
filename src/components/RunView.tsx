import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Maximize, Pause, Play, Radio, RotateCcw, SkipForward, Sun, SunDim } from 'lucide-react'
import { useStore } from '../store'
import { themeById } from '../model/themes'
import { useFrame, useRollover } from '../lib/useFrame'
import { useBroadcast } from '../lib/useBroadcast'
import { makeBurst } from '../lib/celebrate'
import { chime, tick, unlockAudio } from '../lib/audio'
import { enterFullscreen, exitFullscreen, keepAwake, vibrate } from '../lib/device'
import { useHost } from '../lib/remote'
import Clock from './Clock'
import PairModal from './PairModal'

function fmtRemain(ms: number) {
  const s = Math.ceil(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function RunView() {
  const m = useStore((s) => s.moment)
  const run = useStore((s) => s.run)
  const brightness = useStore((s) => s.brightness)
  const setBrightness = useStore((s) => s.setBrightness)
  const { beginRunning, togglePause, restart, jumpToRollover, stop, setView, start } = useStore.getState()
  const connected = useHost((s) => s.connected)
  const theme = themeById(m.theme)

  const [controls, setControls] = useState(false)
  const [pairOpen, setPairOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [shift, setShift] = useState({ x: 0, y: 0 })
  const hideTimer = useRef(0)
  const canvas = useRef<HTMLCanvasElement>(null)
  const burst = useRef<ReturnType<typeof makeBurst> | null>(null)

  const [waitLeft, setWaitLeft] = useState(0)
  const onTick = useCallback(
    (now: number) => {
      const r = useStore.getState().run
      if (r.status !== 'waiting') return
      if (now >= r.waitUntil) beginRunning()
      else setWaitLeft(Math.ceil((r.waitUntil - now) / 1000))
    },
    [beginRunning],
  )
  const frame = useFrame(m, run, onTick)
  useBroadcast(frame)

  // keep the screen on while the clock is visible
  useEffect(() => {
    void keepAwake(true)
    if (useStore.getState().run.status === 'idle') start()
    return () => void keepAwake(false)
  }, [start])

  useEffect(() => {
    if (canvas.current) burst.current = makeBurst(canvas.current)
    return () => burst.current?.reset()
  }, [])

  // burn-in protection: drift a few pixels every 90s
  useEffect(() => {
    const id = setInterval(() => setShift({ x: Math.round((Math.random() - 0.5) * 14), y: Math.round((Math.random() - 0.5) * 10) }), 90_000)
    return () => clearInterval(id)
  }, [])

  const active = m.mode === 'live' || run.status === 'running'
  useRollover(
    frame,
    active,
    () => {
      setCelebrating(true)
      if (m.celebration === 'confetti') burst.current?.fire(theme)
      if (m.sound !== 'off') chime()
      vibrate([60, 80, 60])
    },
    () => {
      setCelebrating(false)
      burst.current?.reset()
    },
  )

  // ticking for the last 10 seconds
  const sec = Math.ceil(frame.remaining / 1000)
  useEffect(() => {
    if (!active || m.sound !== 'ticks' || frame.phase !== 'lead') return
    if (sec <= 10 && sec >= 1) tick(sec <= 3)
  }, [sec, active, m.sound, frame.phase])

  const poke = useCallback(() => {
    setControls(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setControls(false), 4000)
  }, [])

  const back = useCallback(() => {
    stop()
    void exitFullscreen()
    setView('studio')
  }, [stop, setView])

  // keyboard & presentation clickers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if (k === ' ' || k === 'k') togglePause()
      else if (k === 'r' || k === 'R') restart()
      else if (k === 'j' || k === 'J') jumpToRollover(10)
      else if (k === 'n' || k === 'N' || k === 'PageDown' || k === 'ArrowRight') jumpToRollover(3)
      else if (k === 'f' || k === 'F') void enterFullscreen()
      else if (k === 'ArrowUp') setBrightness(useStore.getState().brightness + 0.1)
      else if (k === 'ArrowDown') setBrightness(useStore.getState().brightness - 0.1)
      else if (k === 'Escape' && !document.fullscreenElement) back()
      else return
      e.preventDefault()
      unlockAudio()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePause, restart, jumpToRollover, setBrightness, back])

  const waiting = run.status === 'waiting'

  let status: string
  if (m.mode === 'live') status = frame.phase === 'lead' ? `Live · ${fmtRemain(frame.remaining)} to go` : 'Live · rolled over'
  else if (run.status === 'paused') status = 'Paused'
  else if (waiting) status = `Starting in ${waitLeft}s`
  else if (frame.phase === 'lead') status = `Rolls over in ${fmtRemain(frame.remaining)}`
  else status = m.loop ? `Again in ${fmtRemain(m.hold * 1000 - frame.since)}` : 'Rolled over'

  return (
    <div className={`run ${controls ? 'show-controls' : 'idle'}`} onPointerDown={poke} onPointerMove={(e) => e.pointerType === 'mouse' && poke()}>
      <Clock moment={m} frame={frame} celebrating={celebrating && m.celebration !== 'none'} style={{ transform: `translate(${shift.x}px, ${shift.y}px)` }} />
      <canvas ref={canvas} className="confetti-canvas" />
      <div className="dimmer" style={{ opacity: 1 - brightness }} />

      {waiting && (
        <div className="waiting">
          <div className="waiting-ring" style={{ ['--n' as string]: waitLeft }}>{waitLeft}</div>
          <p>Place your phone. The clock starts by itself.</p>
        </div>
      )}

      <div className="controls" onPointerDown={(e) => { e.stopPropagation(); poke() }}>
        <div className="controls-top">
          <button className="pill-btn" onClick={back}>
            <ArrowLeft size={18} /> Studio
          </button>
          <div className="status-pill">
            <span className={`dot ${run.status === 'paused' ? 'paused' : frame.phase}`} />
            {status}
          </div>
          <div className="controls-top-right">
            <button className="pill-btn" onClick={() => setPairOpen(true)} aria-label="Remote control">
              <Radio size={18} />
              {connected > 0 && <span className="badge">{connected}</span>}
            </button>
            <button className="pill-btn" onClick={() => void enterFullscreen()} aria-label="Fullscreen">
              <Maximize size={18} />
            </button>
          </div>
        </div>
        <div className="controls-bottom">
          {m.mode === 'staged' && (
            <div className="transport">
              <button className="round-btn" onClick={restart} aria-label="Restart" title="Restart (R)">
                <RotateCcw size={22} />
              </button>
              <button className="round-btn big" onClick={() => (waiting ? beginRunning() : togglePause())} aria-label={run.status === 'paused' ? 'Resume' : 'Pause'} title="Pause (Space)">
                {run.status === 'paused' || waiting ? <Play size={28} fill="currentColor" /> : <Pause size={28} fill="currentColor" />}
              </button>
              <button className="round-btn" onClick={() => jumpToRollover(10)} aria-label="Skip to 10 seconds before" title="Skip to 10s before (J)">
                <SkipForward size={22} />
              </button>
            </div>
          )}
          <label className="dim-slider">
            <SunDim size={18} />
            <input type="range" min={0.08} max={1} step={0.01} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} aria-label="Brightness" />
            <Sun size={18} />
          </label>
        </div>
      </div>

      <PairModal open={pairOpen} onClose={() => setPairOpen(false)} />
    </div>
  )
}
