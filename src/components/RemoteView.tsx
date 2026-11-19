import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, SkipForward, Square, Sun, SunDim, Zap } from 'lucide-react'
import { connectController, disconnectController, send, useController } from '../lib/remote'
import { THEMES } from '../model/themes'
import { Logo } from './ui'

export default function RemoteView({ code: initial }: { code: string }) {
  const [code, setCode] = useState(initial)
  const [input, setInput] = useState(initial)
  const { state, status, error } = useController()
  const [dim, setDim] = useState<number | null>(null)

  useEffect(() => {
    if (!code) return
    void connectController(code)
    return () => disconnectController()
  }, [code])

  const brightness = dim ?? status?.brightness ?? 1
  const running = status?.run === 'running'
  const idle = !status || status.run === 'idle'
  const staged = status?.mode !== 'live'

  if (!code || state === 'error') {
    return (
      <div className="remote">
        <header className="remote-head"><Logo /> <span>Rollover Remote</span></header>
        <div className="remote-pair">
          <h1>Pair with a clock</h1>
          <p className="muted">On the clock, tap <b>Remote</b> and scan the QR code — or type the code shown there.</p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={(e) => { e.preventDefault(); setCode(input.trim().toLowerCase()) }}>
            <input className="code-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="ABCDE" maxLength={8} autoCapitalize="characters" autoFocus />
            <button className="btn primary" type="submit">Connect</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="remote">
      <header className="remote-head">
        <Logo /> <span>Rollover Remote</span>
        <span className={`conn ${state}`}>{state === 'connected' ? `● ${code.toUpperCase()}` : state === 'lost' ? 'Disconnected' : 'Connecting…'}</span>
      </header>

      <section className={`mirror theme-${status?.theme ?? 'nightlight'}`}>
        <div className="mirror-title">{status?.title}</div>
        <div className="mirror-time">{status?.time ?? '--:--:--'}</div>
        <div className="mirror-date">{status?.date}</div>
        <div className="mirror-state">
          {!status ? 'Waiting for the clock…'
            : status.run === 'waiting' ? 'Starting…'
            : status.run === 'paused' ? 'Paused'
            : status.phase === 'lead' ? `Rolls over in ${Math.ceil(status.remaining / 1000)}s`
            : status.message || 'Rolled over'}
        </div>
      </section>

      {state === 'lost' && (
        <button className="btn primary wide" onClick={() => void connectController(code)}>Reconnect</button>
      )}

      <section className="remote-pad">
        {staged ? (
          <>
            <button className="pad-btn main" disabled={state !== 'connected'} onClick={() => send(idle ? { type: 'start' } : { type: 'toggle' })}>
              {idle ? <><Play size={30} fill="currentColor" /> Start</> : running ? <><Pause size={30} fill="currentColor" /> Pause</> : <><Play size={30} fill="currentColor" /> Resume</>}
            </button>
            <button className="pad-btn" disabled={state !== 'connected'} onClick={() => send({ type: 'restart' })}><RotateCcw size={22} /> Restart</button>
            <button className="pad-btn" disabled={state !== 'connected'} onClick={() => send({ type: 'jump', seconds: 10 })}><SkipForward size={22} /> 10s before</button>
            <button className="pad-btn accent" disabled={state !== 'connected'} onClick={() => send({ type: 'jump', seconds: 3 })}><Zap size={22} /> Roll now</button>
            <button className="pad-btn" disabled={state !== 'connected' || idle} onClick={() => send({ type: 'stop' })}><Square size={20} /> Stop</button>
          </>
        ) : (
          <p className="muted center">The clock is in real-time mode.</p>
        )}
      </section>

      <section className="remote-sec">
        <label className="dim-slider wide">
          <SunDim size={18} />
          <input
            type="range" min={0.08} max={1} step={0.01} value={brightness} aria-label="Brightness"
            onChange={(e) => { const v = Number(e.target.value); setDim(v); send({ type: 'dim', value: v }) }}
            onPointerUp={() => setDim(null)}
          />
          <Sun size={18} />
        </label>
        <div className="remote-themes">
          {THEMES.map((t) => (
            <button key={t.id} className={`swatch mini sw-${t.id} ${status?.theme === t.id ? 'on' : ''}`} style={{ background: t.swatch[0], color: t.swatch[1] }} onClick={() => send({ type: 'theme', value: t.id })} aria-label={t.name} title={t.name}>
              12
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
