import { useCallback, useEffect, useEffectEvent, type RefObject } from 'react'
import { Platform } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { activateKeepAwakeAsync, useKeepAwake } from 'expo-keep-awake'

/** Browser-only behaviour. Every helper here does nothing on iOS and Android. */
const web = Platform.OS === 'web' && typeof document !== 'undefined'

/**
 * Full screen in the browser, so the address bar doesn't show on the clock.
 * Call it from the tap that starts the clock: browsers only allow it during a user gesture.
 * iPhone Safari has no full screen for pages; there the app is full screen once added to the home screen.
 */
export function enterFullscreen() {
  if (web && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
}

export function exitFullscreen() {
  if (web && document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
}

/** Hides the browser's focus ring on an element that takes focus only to guide screen readers. */
export const noFocusRing = (web ? { outlineStyle: 'none' } : {}) as object

/** False in a browser without the Screen Wake Lock API, where the screen may sleep while the clock runs. */
export const canKeepAwake = !web || 'wakeLock' in navigator

const KEEP_AWAKE_TAG = 'rollover-clock'

/**
 * Keeps the screen on. Browsers drop the wake lock whenever the page is hidden
 * (another app, the phone locked), so it is asked for again when the page comes back.
 */
export function useKeepScreenOn() {
  // suppress: leaving before the wake lock is granted (e.g. a browser that refuses it) is harmless
  useKeepAwake(KEEP_AWAKE_TAG, { suppressDeactivateWarnings: true })
  useEffect(() => {
    if (!web) return
    const onChange = () => {
      if (document.visibilityState === 'visible') activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {})
    }
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
}

/** Calls `onKey` with the key name for key presses while the screen is mounted. */
export function useKeys(onKey: (key: string) => void) {
  const handle = useEffectEvent((e: KeyboardEvent) => onKey(e.key))
  useEffect(() => {
    if (!web) return
    const listener = (e: KeyboardEvent) => handle(e)
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [])
}

/**
 * Moves keyboard and screen reader focus to `ref` each time the screen comes into focus,
 * so they don't start over from the top of the page after every navigation.
 */
export function useFocusOnScreen(ref: RefObject<unknown>) {
  useFocusEffect(
    useCallback(() => {
      if (!web) return
      const node = ref.current as HTMLElement | null
      if (!node) return
      if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1')
      node.focus({ preventScroll: true })
    }, [ref]),
  )
}
