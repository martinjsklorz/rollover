/** Tiny synthesized sound kit — no audio files, works offline. */
let ctx: AudioContext | null = null

export function unlockAudio() {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    /* audio unsupported */
  }
}

function out(): AudioContext | null {
  if (!ctx) unlockAudio()
  return ctx
}

function connect(node: AudioNode, c: AudioContext) {
  node.connect(c.destination)
}

export function tick(accent = false) {
  const c = out()
  if (!c) return
  const t = c.currentTime
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'triangle'
  o.frequency.value = accent ? 1760 : 1320
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(accent ? 0.25 : 0.12, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  o.connect(g)
  connect(g, c)
  o.start(t)
  o.stop(t + 0.1)
}

/** A soft bell: inharmonic partials with long decay. */
export function chime() {
  const c = out()
  if (!c) return
  const t0 = c.currentTime
  const master = c.createGain()
  master.gain.value = 0.35
  connect(master, c)
  const notes = [659.25, 783.99, 1046.5] // E5 G5 C6 — a little arpeggio
  notes.forEach((f, i) => {
    const t = t0 + i * 0.16
    ;[1, 2.76, 5.4].forEach((ratio, j) => {
      const o = c.createOscillator()
      const g = c.createGain()
      o.type = 'sine'
      o.frequency.value = f * ratio
      const peak = [0.5, 0.18, 0.06][j]
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(peak, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8 - j * 0.6)
      o.connect(g)
      g.connect(master)
      o.start(t)
      o.stop(t + 3)
    })
  })
}
