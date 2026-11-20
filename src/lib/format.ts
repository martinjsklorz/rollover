export interface TimeParts {
  h: string
  m: string
  s: string
  ampm: string
}

const pad = (n: number) => String(n).padStart(2, '0')

export function timeParts(t: number, hour12: boolean): TimeParts {
  const d = new Date(t)
  const H = d.getHours()
  if (hour12) {
    const h = H % 12 || 12
    return { h: pad(h), m: pad(d.getMinutes()), s: pad(d.getSeconds()), ampm: H < 12 ? 'AM' : 'PM' }
  }
  return { h: pad(H), m: pad(d.getMinutes()), s: pad(d.getSeconds()), ampm: '' }
}

const dateFmtCache = new Map<string, Intl.DateTimeFormat>()

export function formatDate(t: number, withYear: boolean, style: 'long' | 'short' = 'long'): string {
  const key = `${withYear}-${style}`
  let f = dateFmtCache.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat(undefined, style === 'long'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: withYear ? 'numeric' : undefined }
      : { day: 'numeric', month: 'short', year: 'numeric' })
    dateFmtCache.set(key, f)
  }
  return f.format(new Date(t))
}

export function humanDuration(sec: number): string {
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m}m ${s}s` : `${m} min`
}
