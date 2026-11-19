import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Download, RefreshCw, RotateCcw, Share2, SkipForward, SwitchCamera, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { computeFrame } from '../model/engine'
import { themeById } from '../model/themes'
import { OverlayRenderer, loadOverlayFonts, type OverlayStyle } from '../lib/overlay'
import { audioStreamForRecording, chime, tick, unlockAudio } from '../lib/audio'
import { keepAwake, vibrate } from '../lib/device'
import { makeBurst } from '../lib/celebrate'
import { Segmented } from './ui'
import fixWebmDuration from 'fix-webm-duration'

const MIME_CANDIDATES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
]
const pickMime = () => (typeof MediaRecorder === 'undefined' ? '' : MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) ?? '')

interface Result {
  url: string
  blob: Blob
  name: string
}

export default function CameraView() {
  const m = useStore((s) => s.moment)
  const setView = useStore((s) => s.setView)
  const { restart, jumpToRollover, stop, start } = useStore.getState()

  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const fx = useRef<HTMLCanvasElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const renderer = useRef(new OverlayRenderer())

  const [facing, setFacing] = useState<'environment' | 'user'>('environment')
  const [style, setStyle] = useState<OverlayStyle>('camcorder')
  const [error, setError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [recStart, setRecStart] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<Result | null>(null)

  // camera on
  useEffect(() => {
    let cancelled = false
    void keepAwake(true)
    void loadOverlayFonts()
    ;(async () => {
      try {
        stream.current?.getTracks().forEach((t) => t.stop())
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
          audio: { echoCancellation: false, noiseSuppression: false },
        }).catch(() => navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false }))
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream.current = s
        if (video.current) {
          video.current.srcObject = s
          await video.current.play().catch(() => {})
        }
        setError(null)
      } catch {
        setError('Camera not available. Allow camera access in your browser settings, or use a device with a camera.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [facing])

  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop())
      if (recorder.current?.state === 'recording') recorder.current.stop()
      void keepAwake(false)
      stop()
    },
    [stop],
  )

  // render loop: camera frame + clock overlay + confetti → canvas (what gets recorded)
  useEffect(() => {
    let raf = 0
    const burst = fx.current ? makeBurst(fx.current, false) : null
    let lastPhase = ''
    let lastCycle = -1
    let lastSec = -1
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const v = video.current
      const c = canvas.current
      if (!c) return
      const st = useStore.getState()
      const mm = st.moment
      const now = Date.now()
      const f = computeFrame(mm, st.run, now)
      const vw = v?.videoWidth || 1280
      const vh = v?.videoHeight || 720
      if (c.width !== vw || c.height !== vh) {
        c.width = vw
        c.height = vh
        if (fx.current) {
          fx.current.width = vw
          fx.current.height = vh
        }
      }
      const ctx = c.getContext('2d')
      if (!ctx) return
      if (v && v.readyState >= 2) {
        if (facing === 'user') {
          ctx.save()
          ctx.translate(vw, 0)
          ctx.scale(-1, 1)
          ctx.drawImage(v, 0, 0, vw, vh)
          ctx.restore()
        } else ctx.drawImage(v, 0, 0, vw, vh)
      } else {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, vw, vh)
      }
      const live = mm.mode === 'live' || st.run.status === 'running'
      if (live && f.phase === 'after' && lastPhase === 'lead' && f.cycle === lastCycle) {
        if (mm.celebration === 'confetti') burst?.fire(themeById(mm.theme), 1.2)
        if (mm.sound !== 'off') chime()
        vibrate(60)
      }
      if (f.phase === 'lead' && (lastPhase === 'after' || f.cycle !== lastCycle)) burst?.reset()
      const sec = Math.ceil(f.remaining / 1000)
      if (live && mm.sound === 'ticks' && f.phase === 'lead' && sec !== lastSec && sec <= 10 && sec >= 1 && lastSec !== -1) tick(sec <= 3)
      lastSec = sec
      lastPhase = f.phase
      lastCycle = f.cycle
      renderer.current.draw(ctx, vw, vh, mm, f, style, now)
      if (fx.current) ctx.drawImage(fx.current, 0, 0)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      burst?.reset()
    }
  }, [facing, style])

  useEffect(() => {
    if (!recording) return
    const id = setInterval(() => setElapsed(Date.now() - recStart), 250)
    return () => clearInterval(id)
  }, [recording, recStart])

  const startRec = useCallback(() => {
    unlockAudio()
    const c = canvas.current
    if (!c) return
    const out = c.captureStream(30)
    // mic + synthesized chime → one mixed audio track
    const mic = stream.current?.getAudioTracks()[0]
    const mix = audioStreamForRecording(mic)
    if (mix) mix.getAudioTracks().forEach((t) => out.addTrack(t))
    else if (mic) out.addTrack(mic)
    const mime = pickMime()
    let rec: MediaRecorder
    try {
      rec = new MediaRecorder(out, mime ? { mimeType: mime, videoBitsPerSecond: 8_000_000 } : undefined)
    } catch {
      setError('Recording isn’t supported in this browser.')
      return
    }
    chunks.current = []
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
    const t0 = Date.now()
    rec.onstop = async () => {
      const type = rec.mimeType || mime || 'video/webm'
      let blob = new Blob(chunks.current, { type })
      // Chrome writes WebM without a duration — players then can't seek
      if (type.includes('webm')) blob = await fixWebmDuration(blob, Date.now() - t0, { logger: false }).catch(() => blob)
      const ext = type.includes('mp4') ? 'mp4' : 'webm'
      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
      setResult({ blob, url: URL.createObjectURL(blob), name: `rollover-${stamp}.${ext}` })
    }
    rec.start(1000)
    recorder.current = rec
    setRecStart(Date.now())
    setElapsed(0)
    setRecording(true)
    start(0)
  }, [start])

  const stopRec = useCallback(() => {
    recorder.current?.stop()
    setRecording(false)
    stop()
  }, [stop])

  const save = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = result.name
    a.click()
  }
  const share = async () => {
    if (!result) return
    const file = new File([result.blob], result.name, { type: result.blob.type })
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: m.title || 'Rollover' })
      else save()
    } catch {
      /* cancelled */
    }
  }
  const discard = () => {
    if (result) URL.revokeObjectURL(result.url)
    setResult(null)
  }

  const mmss = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`

  return (
    <div className="camera">
      <video ref={video} playsInline muted className="cam-src" />
      <canvas ref={fx} className="cam-fx" />
      <canvas ref={canvas} className="cam-canvas" />

      {error && <div className="cam-error">{error}</div>}

      <div className="cam-top">
        <button className="pill-btn" onClick={() => { if (recording) stopRec(); setView('studio') }}>
          <ArrowLeft size={18} /> Studio
        </button>
        {recording ? (
          <div className="rec-pill"><span className="rec-dot" /> REC {mmss(elapsed)}</div>
        ) : (
          <Segmented value={style} onChange={setStyle} label="Overlay style" options={[{ value: 'camcorder', label: 'Camcorder' }, { value: 'theme', label: themeById(m.theme).name }]} />
        )}
        <button className="pill-btn" onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))} disabled={recording} aria-label="Switch camera">
          <SwitchCamera size={18} />
        </button>
      </div>

      <div className="cam-bottom">
        <button className="round-btn" onClick={restart} disabled={!recording || m.mode === 'live'} aria-label="Restart the clock">
          <RotateCcw size={22} />
        </button>
        <button className={`rec-btn ${recording ? 'on' : ''}`} onClick={recording ? stopRec : startRec} aria-label={recording ? 'Stop recording' : 'Start recording'}>
          <span />
        </button>
        <button className="round-btn" onClick={() => jumpToRollover(10)} disabled={!recording || m.mode === 'live'} aria-label="Skip to 10 seconds before">
          <SkipForward size={22} />
        </button>
      </div>
      {!recording && !result && (
        <p className="cam-hint">
          {m.mode === 'live' ? 'Records the real clock.' : `Recording starts the clock at the lead-in — it rolls over after ${m.leadIn}s.`}
        </p>
      )}

      {result && (
        <div className="result">
          <div className="result-card">
            <video src={result.url} controls playsInline autoPlay loop />
            <div className="result-actions">
              <button className="btn ghost" onClick={discard}><Trash2 size={18} /> Discard</button>
              <button className="btn ghost" onClick={() => { discard(); startRec() }}><RefreshCw size={18} /> Retake</button>
              <button className="btn ghost" onClick={save}><Download size={18} /> Save</button>
              <button className="btn primary" onClick={share}><Share2 size={18} /> Share</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
