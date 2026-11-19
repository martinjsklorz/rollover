import type { DataConnection, Peer as PeerT } from 'peerjs'
import { create } from 'zustand'
import { useStore } from '../store'
import type { ThemeId } from '../model/themes'
import { publicBaseUrl } from './device'

/* ---------- protocol ---------- */

export type Command =
  | { type: 'start' }
  | { type: 'restart' }
  | { type: 'toggle' }
  | { type: 'jump'; seconds: number }
  | { type: 'stop' }
  | { type: 'dim'; value: number }
  | { type: 'theme'; value: ThemeId }
  | { type: 'hello' }

export interface Status {
  type: 'status'
  view: string
  run: string
  mode: string
  time: string
  date: string
  phase: string
  remaining: number
  brightness: number
  theme: ThemeId
  title: string
  message: string
  loop: boolean
}

const PREFIX = 'rollover-'
const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(5)), (b) => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('')

/* ---------- host (the clock) ---------- */

interface HostState {
  code: string | null
  connected: number
  error: string | null
  starting: boolean
}
export const useHost = create<HostState>(() => ({ code: null, connected: 0, error: null, starting: false }))

let hostPeer: PeerT | null = null
const conns = new Set<DataConnection>()
let lastStatus: Status | null = null

function applyCommand(c: Command) {
  const s = useStore.getState()
  switch (c.type) {
    case 'start':
      s.start(0)
      s.setView('run')
      break
    case 'restart':
      s.restart()
      if (s.view === 'studio') s.setView('run')
      break
    case 'toggle':
      if (s.run.status === 'idle') {
        s.start(0)
        s.setView('run')
      } else s.togglePause()
      break
    case 'jump':
      s.jumpToRollover(c.seconds)
      if (s.view === 'studio') s.setView('run')
      break
    case 'stop':
      s.stop()
      s.setView('studio')
      break
    case 'dim':
      s.setBrightness(c.value)
      break
    case 'theme':
      s.update({ theme: c.value })
      break
    case 'hello':
      break
  }
}

export async function startHosting(): Promise<string> {
  const st = useHost.getState()
  if (hostPeer && st.code && !hostPeer.destroyed) return st.code
  useHost.setState({ starting: true, error: null })
  const { Peer } = await import('peerjs')
  const code = randomId()
  return new Promise((resolve, reject) => {
    const peer = new Peer(PREFIX + code, { debug: 0 })
    hostPeer = peer
    peer.on('open', () => {
      useHost.setState({ code, starting: false })
      resolve(code)
    })
    peer.on('connection', (conn) => {
      conn.on('open', () => {
        conns.add(conn)
        useHost.setState({ connected: conns.size })
        if (lastStatus) conn.send(lastStatus)
      })
      conn.on('data', (d) => applyCommand(d as Command))
      const drop = () => {
        conns.delete(conn)
        useHost.setState({ connected: conns.size })
      }
      conn.on('close', drop)
      conn.on('error', drop)
    })
    peer.on('disconnected', () => {
      try {
        peer.reconnect()
      } catch {
        /* ignore */
      }
    })
    peer.on('error', (e) => {
      useHost.setState({ error: friendlyError(e), starting: false })
      reject(e)
    })
  })
}

export function broadcast(s: Status) {
  lastStatus = s
  for (const c of conns) if (c.open) c.send(s)
}

export function remoteUrl(code: string) {
  return `${publicBaseUrl()}#/remote/${code}`
}

/* ---------- controller (the remote) ---------- */

interface CtrlState {
  state: 'connecting' | 'connected' | 'lost' | 'error'
  status: Status | null
  error: string | null
}
export const useController = create<CtrlState>(() => ({ state: 'connecting', status: null, error: null }))

let ctrlPeer: PeerT | null = null
let ctrlConn: DataConnection | null = null

export async function connectController(code: string) {
  useController.setState({ state: 'connecting', error: null })
  const { Peer } = await import('peerjs')
  ctrlPeer?.destroy()
  const peer = new Peer({ debug: 0 })
  ctrlPeer = peer
  peer.on('open', () => {
    const conn = peer.connect(PREFIX + code.toLowerCase().trim(), { reliable: true })
    ctrlConn = conn
    conn.on('open', () => {
      useController.setState({ state: 'connected' })
      conn.send({ type: 'hello' } satisfies Command)
    })
    conn.on('data', (d) => {
      const s = d as Status
      if (s?.type === 'status') useController.setState({ status: s })
    })
    conn.on('close', () => useController.setState({ state: 'lost' }))
  })
  peer.on('error', (e) => useController.setState({ state: 'error', error: friendlyError(e) }))
}

export function send(c: Command) {
  if (ctrlConn?.open) ctrlConn.send(c)
}

export function disconnectController() {
  ctrlPeer?.destroy()
  ctrlPeer = null
  ctrlConn = null
}

function friendlyError(e: unknown): string {
  const type = (e as { type?: string })?.type
  if (type === 'peer-unavailable') return 'That clock isn’t reachable. Check the code and that the clock is still open.'
  if (type === 'network' || type === 'server-error' || type === 'socket-error') return 'No connection to the pairing service. Are you online?'
  if (type === 'browser-incompatible') return 'This browser can’t do peer-to-peer connections.'
  return 'Something went wrong while pairing.'
}
