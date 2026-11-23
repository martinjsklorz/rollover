import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import Head from 'expo-router/head'
import { useSettings } from '../settings'
import { enterFullscreen } from '../web'
import { useStrings } from '../i18n'
import { STEP_IDS, describe, useSteps } from '../wizard/steps'
import { Button, colors } from '../wizard/ui'

/** First screen: the logo, Start with the previous settings, or the setup wizard. */
export default function Home() {
  const { saved, beginSetup, restoreSaved } = useSettings()
  const t = useStrings()
  const steps = useSteps()
  const { width, height } = useWindowDimensions()
  // Phone on its side: too short to stack, so brand and actions sit side by side.
  const sideBySide = width > height && height < 500
  // Phone upright keeps the actions at the bottom, within thumb reach.
  // Larger screens (tablet, browser) show brand and actions as one centered group.
  const centered = !sideBySide && width >= 600

  const start = () => {
    restoreSaved()
    enterFullscreen()
    router.push('/clock')
  }
  const summary = saved && describe(saved, steps)
  const setup = () => {
    beginSetup()
    router.push(`/setup/${STEP_IDS[0]}`)
  }

  return (
    <SafeAreaView style={[styles.page, sideBySide && styles.pageSide, centered && styles.pageCentered]}>
      <StatusBar style="light" />
      <Head>
        <title>Rollover</title>
      </Head>
      <View style={[styles.brand, !centered && styles.fill]}>
        <Image source={require('../../assets/brand/mark.png')} style={styles.logo} accessibilityIgnoresInvertColors />
        <Text style={styles.name} accessibilityLabel="Rollover">
          rollover
        </Text>
        <Text style={styles.tagline}>{t.home.tagline}</Text>
      </View>
      <View style={[styles.actionsArea, sideBySide && styles.actionsSide, centered && styles.actionsCentered]}>
        <View style={styles.actions}>
          {summary ? (
            <>
              <View style={styles.summary} accessible>
                <Text style={styles.summaryText}>{summary.occasion}</Text>
                <Text style={styles.summaryText}>{summary.look}</Text>
                <Text style={styles.summaryText} accessibilityLabel={t.home.fromTo(summary.from, summary.to)}>
                  {summary.from} → {summary.to}
                </Text>
              </View>
              <Button title={t.home.start} primary onPress={start} style={styles.button} />
              <Button title={t.home.newSetup} onPress={setup} style={styles.button} />
            </>
          ) : (
            <Button title={t.home.setUp} primary onPress={setup} style={styles.button} />
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  pageSide: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  pageCentered: { justifyContent: 'center' },
  brand: { alignItems: 'center', justifyContent: 'center' },
  fill: { flex: 1 },
  logo: { width: 88, height: 88 },
  name: { color: colors.text, fontSize: 40, fontWeight: '300', letterSpacing: -0.8, marginTop: 28 },
  tagline: { color: colors.muted, fontSize: 16, marginTop: 8 },
  actionsArea: { alignItems: 'center', paddingBottom: 8 },
  actionsSide: { flex: 1, paddingBottom: 0 },
  actionsCentered: { marginTop: 56 },
  actions: { width: '100%', maxWidth: 340, gap: 12 },
  summary: { marginBottom: 4, gap: 2 },
  summaryText: { color: colors.muted, fontSize: 15, textAlign: 'center', fontVariant: ['tabular-nums'] },
  button: { alignSelf: 'stretch' },
})
