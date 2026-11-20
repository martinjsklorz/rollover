import { useEffect, useState } from 'react'
import { useStore } from './store'
import { decodeMoment, DEFAULT_MOMENT } from './model/moment'
import Studio from './components/Studio'
import RunView from './components/RunView'
import RemoteView from './components/RemoteView'

function readRemoteCode(): string | null {
  const m = location.hash.match(/^#\/remote\/?([a-z0-9]*)/i)
  return m ? m[1] : null
}

export default function App() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const [remoteCode, setRemoteCode] = useState<string | null>(readRemoteCode)

  useEffect(() => {
    const route = () => {
      const h = location.hash
      const shared = h.match(/^#\/m\/(.+)$/)
      if (shared) {
        const m = decodeMoment(shared[1])
        if (m) useStore.getState().setMoment({ ...DEFAULT_MOMENT, ...m })
        history.replaceState(null, '', location.pathname + location.search)
        setView('studio')
      }
      setRemoteCode(readRemoteCode())
    }
    route()
    window.addEventListener('hashchange', route)
    return () => window.removeEventListener('hashchange', route)
  }, [setView])

  // the Android/desktop back button returns to the studio instead of leaving the app
  useEffect(() => {
    if (view === 'studio') return
    history.pushState({ rollover: view }, '')
    const onPop = () => {
      useStore.getState().stop()
      setView('studio')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [view, setView])

  if (remoteCode !== null) return <RemoteView code={remoteCode} />
  if (view === 'run') return <RunView />
  return <Studio />
}
