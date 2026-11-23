import { useEffect, useRef, useState, type ComponentRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import Head from 'expo-router/head'
import { NavigationBar } from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import Clock from '../clock/Clock'
import { useSettings } from '../settings'
import { colors } from '../theme'
import { useSettled } from '../useSettled'
import { exitFullscreen, noFocusRing, useFocusOnScreen, useKeepScreenOn, useKeys } from '../web'

/** How long "Tap again to go back" stays up after the first tap. */
const ARMED_MS = 3000

/**
 * Full-screen clock. Nothing else on screen. Going back takes two taps (the first shows a hint),
 * so a stray touch while filming doesn't end the take. Esc goes back right away.
 */
export default function ClockScreen() {
  useKeepScreenOn()
  const { settings } = useSettings()
  const [startedAt] = useState(Date.now)
  const settled = useSettled()
  const [armed, setArmed] = useState(false)
  const backRef = useRef<ComponentRef<typeof Pressable>>(null)
  useFocusOnScreen(backRef)

  useEffect(() => {
    if (!armed) return
    const id = setTimeout(() => setArmed(false), ARMED_MS)
    return () => clearTimeout(id)
  }, [armed])

  const leave = () => {
    setArmed(false)
    exitFullscreen()
    // opened directly or reloaded (web): no screen to go back to, so go home
    if (router.canGoBack()) router.back()
    else router.replace('/')
  }
  const tap = () => (armed ? leave() : setArmed(true))
  useKeys((key) => key === 'Escape' && leave())

  return (
    <View style={styles.screen}>
      <Head>
        <title>Clock · Rollover</title>
      </Head>
      <StatusBar hidden />
      <NavigationBar hidden />
      <Clock settings={settings} startedAt={startedAt} />
      <Pressable
        ref={backRef}
        style={[StyleSheet.absoluteFill, styles.back, !settled && styles.locked]}
        onPress={tap}
        role="button"
        accessibilityLabel={armed ? 'Go back' : 'Back. Tap twice to go back.'}
      />
      {armed && (
        <Text style={styles.hint} aria-live="polite">
          Tap again to go back
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', padding: 16 },
  back: noFocusRing,
  locked: { pointerEvents: 'none' },
  hint: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 15,
    pointerEvents: 'none',
  },
})
