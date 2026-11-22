import { Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useKeepAwake } from 'expo-keep-awake'
import { NavigationBar } from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import Clock from '../clock/Clock'
import { useSettings } from '../settings'

/** Full-screen clock. Nothing else on screen; tap anywhere to go back to the setup. */
export default function ClockScreen() {
  // suppress: leaving before the wake lock is granted (e.g. a browser that refuses it) is harmless
  useKeepAwake(undefined, { suppressDeactivateWarnings: true })
  const { settings } = useSettings()
  return (
    <Pressable style={styles.screen} onPress={() => router.back()} accessibilityLabel="Clock. Tap to go back to the setup.">
      <StatusBar hidden />
      <NavigationBar hidden />
      <Clock settings={settings} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', padding: 16 },
})
