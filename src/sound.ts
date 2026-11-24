import { useEffect } from 'react'
import { AppState, Platform } from 'react-native'
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio'
import type { Occasion } from './occasions'
import type { Settings } from './settings'

/**
 * The music box tune each occasion plays at 00:00:00 when `settings.sound` is 'musicbox'.
 * Rendered by tools/musicbox/build.mjs; the melodies are traditional and in the public domain (README).
 */
const TUNES: Record<Occasion, number> = {
  classic: require('../assets/sounds/classic.wav'),
  newyear: require('../assets/sounds/newyear.wav'),
  birthday: require('../assets/sounds/birthday.wav'),
}

/** how long a tune that's still playing takes to fade out when the loop starts over, or the clock closes */
const FADE_MS = 300
const FADE_STEPS = 15

// Safari on iPhone and iPad ignores a page's volume (only the hardware buttons set it), so it can't fade
const canFade = !(Platform.OS === 'web' && typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent))

/**
 * One player, kept loaded from loop to loop (and app-wide, so the tap on Start can unlock it in a browser).
 * A different occasion replaces it.
 */
let current: { occasion: Occasion; player: AudioPlayer } | null = null
let fading: ReturnType<typeof setInterval> | undefined
let modeSet = false

function playerFor(occasion: Occasion) {
  if (!modeSet) {
    modeSet = true
    // The user chose the sound, so it plays with the iPhone's silent switch on. It mixes with music
    // that's already playing (the party's playlist keeps going), and never plays in the background.
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
      allowsRecording: false,
    }).catch(() => {})
  }
  if (current?.occasion !== occasion) {
    current?.player.remove()
    current = { occasion, player: createAudioPlayer(TUNES[occasion]) }
  }
  return current.player
}

function stopFading() {
  clearInterval(fading)
  fading = undefined
}

/** Plays the occasion's tune from the start: at midnight on the clock, and as the sample on the sound page. */
export function playTune(occasion: Occasion) {
  // the app went to the background (or the browser tab is hidden): stay quiet
  if (AppState.currentState === 'background') return
  stopFading()
  const player = playerFor(occasion)
  player.volume = 1
  if (player.currentTime > 0) player.seekTo(0).then(() => player.play(), () => player.play())
  else player.play()
}

/**
 * Stops the tune, if one is playing: fades it out over FADE_MS, so it doesn't end on a click.
 * Then rewinds it, ready for the next midnight.
 */
export function stopTune({ fade = true }: { fade?: boolean } = {}) {
  const player = current?.player
  if (!player) return
  stopFading()
  const done = () => {
    player.pause()
    player.volume = 1
    player.seekTo(0).catch(() => {})
  }
  if (!fade || !canFade || !player.playing) return done()
  let step = 0
  fading = setInterval(() => {
    step++
    player.volume = Math.max(0, 1 - step / FADE_STEPS)
    if (step < FADE_STEPS) return
    stopFading()
    done()
  }, FADE_MS / FADE_STEPS)
}

/**
 * Call from the tap that starts the clock. Loads the tune, so the first midnight plays on time,
 * and in a browser unlocks it: browsers only let a page start sound during a user gesture
 * (Safari on iPhone asks it of each audio element), so it's started and stopped right away, muted.
 */
export function prepareTune(settings: Settings) {
  if (settings.sound !== 'musicbox') return
  const player = playerFor(settings.occasion)
  if (Platform.OS !== 'web') return
  stopFading()
  player.muted = true
  player.play()
  player.pause()
  player.muted = false
  player.seekTo(0).catch(() => {})
}

/**
 * The full-screen clock's sound: the tune at each 00:00:00 (`onMidnight`), faded out when the loop starts
 * over (`onLoopStart`), and stopped when the clock closes or the app goes to the background.
 * Without sound, both are undefined.
 */
export function useMidnightTune(settings: Settings): { onMidnight?: () => void; onLoopStart?: () => void } {
  const on = settings.sound === 'musicbox'
  const { occasion } = settings
  useEffect(() => {
    if (!on) return
    playerFor(occasion)
    const subscription = AppState.addEventListener('change', (state) => state === 'background' && stopTune({ fade: false }))
    return () => {
      subscription.remove()
      stopTune()
    }
  }, [on, occasion])
  return on ? { onMidnight: () => playTune(occasion), onLoopStart: () => stopTune() } : {}
}
