import { useEffect, useMemo, useRef, useState } from 'react'
import { Bookmark, Download, Play, Radio, Share2, Trash2, Moon, BellOff, BatteryCharging, Video } from 'lucide-react'
import { useStore } from '../store'
import { PRESETS, presetById, shareUrl, type Moment } from '../model/moment'
import { THEMES, themeById } from '../model/themes'
import { IDLE_RUN, targetInstant, type RunState } from '../model/engine'
import { useFrame, useRollover } from '../lib/useFrame'
import { makeBurst } from '../lib/celebrate'
import { formatDate, humanDuration, timeParts } from '../lib/format'
import { enterFullscreen, keepAwake } from '../lib/device'
import { unlockAudio } from '../lib/audio'
import { useHost } from '../lib/remote'
import Clock from './Clock'
import PairModal from './PairModal'
import { Logo, Modal, Row, Section, Segmented, Toggle } from './ui'
import { useInstall } from '../lib/install'
import { useBroadcast } from '../lib/useBroadcast'

/** Keeps connected remotes informed while the studio is open. */
function StudioBroadcast({ moment }: { moment: Moment }) {
  const frame = useFrame(moment, IDLE_RUN)
  useBroadcast(frame)
  return null
}

const PREVIEW_LEAD = 6
const PREVIEW_HOLD = 5

function Preview({ moment }: { moment: Moment }) {
  const pm = useMemo<Moment>(
    () => ({ ...moment, leadIn: Math.min(moment.leadIn, PREVIEW_LEAD), hold: PREVIEW_HOLD, loop: true }),
    [moment],
  )
  const [run] = useState<RunState>(() => ({ status: 'running', startedAt: Date.now(), pausedAt: null, waitUntil: 0 }))
  const frame = useFrame(pm, run)
  const [celebrating, setCelebrating] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const burst = useRef<ReturnType<typeof makeBurst> | null>(null)
  useEffect(() => {
    if (canvas.current) burst.current = makeBurst(canvas.current)
    return () => burst.current?.reset()
  }, [])
  useRollover(
    frame,
    true,
    () => {
      setCelebrating(true)
      if (pm.celebration === 'confetti') burst.current?.fire(themeById(pm.theme), 0.5)
    },
    () => setCelebrating(false),
  )
  return (
    <div className="preview">
      <Clock moment={pm} frame={frame} celebrating={celebrating && pm.celebration !== 'none'} />
      <canvas ref={canvas} className="confetti-canvas" />
      <div className="preview-badge">
        <span className={`dot ${frame.phase}`} />
        {pm.mode === 'live'
          ? 'Live preview'
          : frame.phase === 'lead'
            ? `Preview · rolls over in ${Math.ceil(frame.remaining / 1000)}s`
            : 'Preview · rolled over'}
      </div>
    </div>
  )
}

function Summary({ m }: { m: Moment }) {
  if (m.mode === 'live') {
    return (
      <p className="summary">
        Shows the <b>real time</b>. Celebrates at <b>{m.time}</b> on <b>{formatDate(targetInstant(m), true)}</b>
        {' '}(or the next {m.time} if that has passed).
      </p>
    )
  }
  const t = targetInstant(m)
  const from = t - m.leadIn * 1000
  const p0 = timeParts(from, m.hour12)
  const p1 = timeParts(t, m.hour12)
  return (
    <p className="summary">
      Starts at <b>{p0.h}:{p0.m}:{p0.s}{p0.ampm && ' ' + p0.ampm}</b> on {formatDate(from, false)}, rolls over to{' '}
      <b>{p1.h}:{p1.m}{p1.ampm && ' ' + p1.ampm}</b> on <b>{formatDate(t, m.showYear)}</b>
      {m.loop ? <> — then again, every {humanDuration(m.leadIn + m.hold)}.</> : '.'}
    </p>
  )
}

export default function Studio() {
  const m = useStore((s) => s.moment)
  const update = useStore((s) => s.update)
  const setMoment = useStore((s) => s.setMoment)
  const saved = useStore((s) => s.saved)
  const saveCurrent = useStore((s) => s.saveCurrent)
  const removeSaved = useStore((s) => s.removeSaved)
  const start = useStore((s) => s.start)
  const setView = useStore((s) => s.setView)
  const setBrightness = useStore((s) => s.setBrightness)
  const connected = useHost((s) => s.connected)
  const [pairOpen, setPairOpen] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const install = useInstall()
  const preset = presetById(m.preset)
  const staged = m.mode === 'staged'

  const flash = (t: string) => {
    setToast(t)
    setTimeout(() => setToast(null), 2200)
  }

  const go = () => {
    unlockAudio()
    void enterFullscreen()
    void keepAwake(true)
    start()
    setView('run')
  }

  const share = async () => {
    const url = shareUrl(m)
    try {
      if (navigator.share) await navigator.share({ title: 'Rollover', text: m.title || 'A Rollover moment', url })
      else {
        await navigator.clipboard.writeText(url)
        flash('Link copied — the whole setup is in it')
      }
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="studio">
      <header className="topbar">
        <div className="brand">
          <Logo />
          <span>Rollover</span>
        </div>
        <nav className="topnav">
          {install.canInstall && (
            <button className="btn ghost small" onClick={install.prompt}>
              <Download size={16} /> Install
            </button>
          )}
          <button className="icon-btn" onClick={() => setSavedOpen(true)} aria-label="Saved moments" title="Saved moments">
            <Bookmark size={18} />
          </button>
          <button className="icon-btn" onClick={share} aria-label="Share this moment" title="Share this moment">
            <Share2 size={18} />
          </button>
        </nav>
      </header>

      <main className="stage">
        <Preview moment={m} />
      </main>

      <aside className="sheet">
        <div className="sheet-scroll">
          <Section title="What’s the moment?">
            <div className="chips" role="radiogroup" aria-label="Moment preset">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  role="radio"
                  aria-checked={m.preset === p.id}
                  className={`chip ${m.preset === p.id ? 'on' : ''}`}
                  onClick={() => {
                    const next = p.apply(m)
                    setMoment(next)
                    setBrightness(themeById(next.theme).brightness)
                  }}
                >
                  <span className="chip-emoji">{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>
            <p className="hint">{preset.hint}</p>
          </Section>

          <Section title="When">
            <div className="grid2">
              <label className="field">
                <span>{staged ? 'Rolls over to' : 'Celebrate on'}</span>
                <input type="date" value={m.date} onChange={(e) => e.target.value && update({ date: e.target.value })} />
              </label>
              <label className="field">
                <span>At</span>
                <input type="time" value={m.time} onChange={(e) => e.target.value && update({ time: e.target.value })} />
              </label>
            </div>
            <Summary m={m} />
          </Section>

          <Section title="Words">
            <label className="field">
              <span>Title <small>always visible</small></span>
              <input type="text" value={m.title} maxLength={40} placeholder="e.g. Mia" onChange={(e) => update({ title: e.target.value })} />
            </label>
            <label className="field">
              <span>Message <small>revealed at the rollover</small></span>
              <input type="text" value={m.message} maxLength={60} placeholder="e.g. One year old today" onChange={(e) => update({ message: e.target.value })} />
            </label>
          </Section>

          <Section title="Look">
            <div className="themes" role="radiogroup" aria-label="Theme">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={m.theme === t.id}
                  className={`theme-card ${m.theme === t.id ? 'on' : ''}`}
                  onClick={() => {
                    update({ theme: t.id })
                    setBrightness(t.brightness)
                  }}
                  title={t.note}
                >
                  <span className={`swatch sw-${t.id}`} style={{ background: t.swatch[0], color: t.swatch[1] }}>
                    12:00
                  </span>
                  <span className="theme-name">{t.name}</span>
                </button>
              ))}
            </div>
            <p className="hint">{themeById(m.theme).note}</p>
            <Row label="Clock">
              <Segmented value={m.hour12 ? 12 : 24} onChange={(v) => update({ hour12: v === 12 })} options={[{ value: 24, label: '24h' }, { value: 12, label: '12h' }]} />
            </Row>
            <Toggle label="Seconds" checked={m.showSeconds} onChange={(v) => update({ showSeconds: v })} />
            <Toggle label="Date" checked={m.showDate} onChange={(v) => update({ showDate: v })} />
            {m.showDate && <Toggle label="Year in date" checked={m.showYear} onChange={(v) => update({ showYear: v })} />}
          </Section>

          {staged && (
            <Section title="Timing">
              <Row label="Lead-in" hint="time before the rollover">
                <Segmented value={m.leadIn} onChange={(v) => update({ leadIn: v })} options={[10, 30, 60, 300].map((v) => ({ value: v, label: humanDuration(v) }))} />
              </Row>
              <Row label="Hold" hint="time after the rollover">
                <Segmented value={m.hold} onChange={(v) => update({ hold: v })} options={[10, 30, 60, 300].map((v) => ({ value: v, label: humanDuration(v) }))} />
              </Row>
              <Row label="Start delay" hint="time to place your phone">
                <Segmented value={m.startDelay} onChange={(v) => update({ startDelay: v })} options={[0, 5, 10, 30].map((v) => ({ value: v, label: v ? `${v}s` : 'None' }))} />
              </Row>
              <Toggle label="Loop" hint="Roll over again and again — every take is a retake" checked={m.loop} onChange={(v) => update({ loop: v })} />
            </Section>
          )}

          <Section title="The moment itself">
            <Row label="Effect">
              <Segmented value={m.celebration} onChange={(v) => update({ celebration: v })} options={[{ value: 'glow', label: 'Glow' }, { value: 'confetti', label: 'Confetti' }, { value: 'none', label: 'None' }]} />
            </Row>
            <Row label="Sound">
              <Segmented value={m.sound} onChange={(v) => update({ sound: v })} options={[{ value: 'off', label: 'Silent' }, { value: 'chime', label: 'Chime' }, { value: 'ticks', label: 'Ticks + chime' }]} />
            </Row>
            <Toggle label="Big countdown" hint="10 · 9 · 8 … for parties" checked={m.countdown} onChange={(v) => update({ countdown: v })} />
          </Section>

          <Section title="Before you press start">
            <ul className="preflight">
              <li><BellOff size={16} /> Turn on Do Not Disturb — no notifications in your shot.</li>
              <li><BatteryCharging size={16} /> Plug in the charger for long loops.</li>
              <li><Moon size={16} /> Tap the running clock to dim it. Rollover keeps the screen awake.</li>
              <li><Video size={16} /> Start recording first, then the clock — Start in 5 s gives you time to step back.</li>
            </ul>
          </Section>
          <p className="fineprint center">Rollover works offline · nothing leaves your device</p>
        </div>

        <footer className="sheet-actions">
          <button className="btn ghost" onClick={() => setPairOpen(true)} title="Control from another phone">
            <Radio size={18} /> <span className="hide-xs">Remote</span>
            {connected > 0 && <span className="badge">{connected}</span>}
          </button>
          <button className="btn primary grow" onClick={go}>
            <Play size={18} fill="currentColor" /> Start{staged && m.startDelay ? ` in ${m.startDelay}s` : ''}
          </button>
        </footer>
      </aside>

      {connected > 0 && <StudioBroadcast moment={m} />}
      <PairModal open={pairOpen} onClose={() => setPairOpen(false)} />

      <Modal open={savedOpen} onClose={() => setSavedOpen(false)} title="Saved moments">
        <button className="btn primary small" onClick={() => { saveCurrent(); flash('Saved') }}>
          <Bookmark size={16} /> Save current moment
        </button>
        {saved.length === 0 ? (
          <p className="muted">Nothing saved yet. Save a setup to come back to it — like “Mia’s birthday” or “New Year’s Eve”.</p>
        ) : (
          <ul className="saved-list">
            {saved.map((s) => (
              <li key={s.id}>
                <button className="saved-open" onClick={() => { setMoment(s.moment); setSavedOpen(false) }}>
                  <span className={`swatch mini sw-${s.moment.theme}`} style={{ background: themeById(s.moment.theme).swatch[0], color: themeById(s.moment.theme).swatch[1] }}>
                    {presetById(s.moment.preset).emoji}
                  </span>
                  <span className="saved-text">
                    <b>{s.name}</b>
                    <small>{formatDate(targetInstant(s.moment), true)} · {themeById(s.moment.theme).name}</small>
                  </span>
                </button>
                <button className="icon-btn" aria-label="Delete" onClick={() => removeSaved(s.id)}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
