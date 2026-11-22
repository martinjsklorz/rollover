import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { useSettings } from '../settings'
import { STEPS, describe } from '../wizard/steps'
import { Button, colors } from '../wizard/ui'

/** First screen: the logo, Start with the previous settings, or the setup wizard. */
export default function Home() {
  const { saved, beginSetup, restoreSaved } = useSettings()
  const { width, height } = useWindowDimensions()
  const wide = width > height

  const start = () => {
    restoreSaved()
    router.push('/clock')
  }
  const setup = () => {
    beginSetup()
    router.push(`/setup/${STEPS[0].id}`)
  }

  return (
    <SafeAreaView style={[styles.page, wide && styles.pageWide]}>
      <StatusBar style="light" />
      <View style={styles.brand}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} accessibilityIgnoresInvertColors />
        <Text style={styles.name}>Rollover</Text>
        <Text style={styles.tagline}>Midnight, again and again.</Text>
      </View>
      <View style={[styles.actions, wide && styles.actionsWide]}>
        {saved ? (
          <>
            <Text style={styles.summary}>{describe(saved)}</Text>
            <Button title="Start" primary onPress={start} style={styles.button} />
            <Button title="New setup" onPress={setup} style={styles.button} />
          </>
        ) : (
          <Button title="Set up the clock" primary onPress={setup} style={styles.button} />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  pageWide: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  brand: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 128, height: 128, borderRadius: 30 },
  name: { color: colors.text, fontSize: 34, fontWeight: '700', marginTop: 20 },
  tagline: { color: colors.muted, fontSize: 16, marginTop: 6 },
  actions: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: 12, paddingBottom: 8 },
  actionsWide: { flex: 1, width: undefined },
  summary: { color: colors.muted, fontSize: 15, textAlign: 'center', marginBottom: 4, fontVariant: ['tabular-nums'] },
  button: { alignSelf: 'stretch' },
})
