import { Capacitor } from '@capacitor/core'
import { KeepAwake } from '@capacitor-community/keep-awake'
import { StatusBar } from '@capacitor/status-bar'

/* ---------- keep the screen on ---------- */

let sentinel: WakeLockSentinel | null = null
let wanted = false

async function acquireWeb() {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      sentinel = await navigator.wakeLock.request('screen')
      sentinel.addEventListener('release', () => (sentinel = null))
    }
  } catch {
    /* denied or unsupported */
  }
}

document.addEventListener('visibilitychange', () => {
  if (wanted && document.visibilityState === 'visible' && !sentinel) void acquireWeb()
})

export async function keepAwake(on: boolean) {
  wanted = on
  if (Capacitor.isNativePlatform()) {
    try {
      await (on ? KeepAwake.keepAwake() : KeepAwake.allowSleep())
    } catch {
      /* ignore */
    }
    return
  }
  if (on) await acquireWeb()
  else {
    await sentinel?.release().catch(() => {})
    sentinel = null
  }
}

/* ---------- fullscreen ---------- */

export function canFullscreen() {
  return !!document.documentElement.requestFullscreen
}

export async function enterFullscreen() {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.hide().catch(() => {})
    return
  }
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    }
  } catch {
    /* iOS Safari: not available for non-video elements; the PWA runs standalone anyway */
  }
}

export async function exitFullscreen() {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.show().catch(() => {})
    return
  }
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
  } catch {
    /* ignore */
  }
}

export const isNative = () => Capacitor.isNativePlatform()

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* ignore */
  }
}

/**
 * Base URL other devices can open. Inside the native app the page lives at
 * capacitor://localhost, so links must point at the hosted web app instead.
 */
export function publicBaseUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_URL as string | undefined
  if (configured) return configured.replace(/\/?$/, '/')
  return location.href.split('#')[0]
}
