import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_MOMENT, type Moment } from './model/moment'
import { IDLE_RUN, jumpStartedAt, type RunState } from './model/engine'

export type View = 'studio' | 'run' | 'camera' | 'remote'

export interface SavedMoment {
  id: string
  name: string
  moment: Moment
  savedAt: number
}

interface State {
  moment: Moment
  saved: SavedMoment[]
  brightness: number
  view: View
  run: RunState
  remotePeer: string | null

  update: (patch: Partial<Moment>) => void
  setMoment: (m: Moment) => void
  setBrightness: (b: number) => void
  setView: (v: View) => void

  start: (delaySec?: number) => void
  beginRunning: () => void
  pause: () => void
  resume: () => void
  togglePause: () => void
  restart: () => void
  jumpToRollover: (secondsBefore?: number) => void
  stop: () => void

  saveCurrent: () => void
  removeSaved: (id: string) => void
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      moment: DEFAULT_MOMENT,
      saved: [],
      brightness: 0.7,
      view: 'studio',
      run: IDLE_RUN,
      remotePeer: null,

      update: (patch) => set((s) => ({ moment: { ...s.moment, ...patch } })),
      setMoment: (m) => set({ moment: m }),
      setBrightness: (b) => set({ brightness: Math.min(1, Math.max(0.08, b)) }),
      setView: (view) => set({ view }),

      start: (delaySec) => {
        const now = Date.now()
        const d = delaySec ?? get().moment.startDelay
        if (d > 0) set({ run: { status: 'waiting', startedAt: now + d * 1000, pausedAt: null, waitUntil: now + d * 1000 } })
        else set({ run: { status: 'running', startedAt: now, pausedAt: null, waitUntil: 0 } })
      },
      beginRunning: () => {
        const r = get().run
        if (r.status === 'waiting') set({ run: { ...r, status: 'running', startedAt: Date.now() } })
      },
      pause: () => {
        const r = get().run
        if (r.status === 'running') set({ run: { ...r, status: 'paused', pausedAt: Date.now() } })
      },
      resume: () => {
        const r = get().run
        if (r.status === 'paused' && r.pausedAt != null) {
          set({ run: { ...r, status: 'running', startedAt: r.startedAt + (Date.now() - r.pausedAt), pausedAt: null } })
        }
      },
      togglePause: () => (get().run.status === 'paused' ? get().resume() : get().pause()),
      restart: () => set({ run: { status: 'running', startedAt: Date.now(), pausedAt: null, waitUntil: 0 } }),
      jumpToRollover: (secondsBefore = 10) => {
        const now = Date.now()
        set({ run: { status: 'running', startedAt: jumpStartedAt(get().moment, now, secondsBefore), pausedAt: null, waitUntil: 0 } })
      },
      stop: () => set({ run: IDLE_RUN }),

      saveCurrent: () => {
        const m = get().moment
        const name = [m.title, m.message].filter(Boolean).join(' · ') || 'Untitled moment'
        const item: SavedMoment = { id: crypto.randomUUID?.() ?? String(Date.now()), name, moment: m, savedAt: Date.now() }
        set((s) => ({ saved: [item, ...s.saved].slice(0, 30) }))
      },
      removeSaved: (id) => set((s) => ({ saved: s.saved.filter((x) => x.id !== id) })),
    }),
    {
      name: 'rollover:v1',
      partialize: (s) => ({ moment: s.moment, saved: s.saved, brightness: s.brightness }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>
        return { ...current, ...p, moment: { ...DEFAULT_MOMENT, ...(p.moment ?? {}) } }
      },
    },
  ),
)
