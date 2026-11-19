import { useEffect } from 'react'
import { useStore } from '../store'
import { broadcast, useHost } from './remote'
import { formatDate, timeParts } from './format'
import type { Frame } from '../model/engine'

/** Mirror the clock to any connected remotes once per visible second. */
export function useBroadcast(frame: Frame) {
  const connected = useHost((s) => s.connected)
  const view = useStore((s) => s.view)
  const run = useStore((s) => s.run)
  const m = useStore((s) => s.moment)
  const brightness = useStore((s) => s.brightness)
  useEffect(() => {
    if (!connected && !useHost.getState().code) return
    const p = timeParts(frame.t, m.hour12)
    broadcast({
      type: 'status',
      view,
      run: run.status,
      mode: m.mode,
      time: `${p.h}:${p.m}:${p.s}${p.ampm ? ' ' + p.ampm : ''}`,
      date: formatDate(frame.t, m.showYear),
      phase: frame.phase,
      remaining: frame.remaining,
      brightness,
      theme: m.theme,
      title: m.title,
      message: m.message,
      loop: m.loop,
    })
  }, [frame, connected, view, run.status, m, brightness])
}
