import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Clock from '../clock/Clock'
import { useSettings } from '../settings'

export const colors = {
  bg: '#000',
  surface: '#111113',
  border: '#2c2c2e',
  text: '#fff',
  muted: '#8e8e93',
}

/** Layout shared by every wizard page: progress, live preview, content, footer buttons. */
export function WizardPage({
  index,
  count,
  title,
  subtitle,
  children,
  footer,
}: {
  index: number
  count: number
  title: string
  subtitle?: string
  children: ReactNode
  footer: ReactNode
}) {
  const { settings } = useSettings()
  const { width, height } = useWindowDimensions()

  const progress = (
    <View style={styles.progress} accessibilityLabel={`Step ${index + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, i <= index && styles.dotDone]} />
      ))}
    </View>
  )
  const text = (
    <>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.body}>{children}</View>
    </>
  )

  // Landscape: preview on the left at full height, question and options on the right,
  // so the preview stays visible while scrolling through the options.
  if (width > height) {
    return (
      <SafeAreaView style={[styles.page, styles.wide]}>
        <StatusBar style="light" />
        <View style={styles.wideLeft}>
          {progress}
          <View style={[styles.preview, styles.previewWide]}>
            <Clock settings={settings} />
          </View>
        </View>
        <View style={styles.wideRight}>
          <ScrollView contentContainerStyle={styles.wideScroll}>{text}</ScrollView>
          <View style={[styles.footer, styles.footerWide]}>{footer}</View>
        </View>
      </SafeAreaView>
    )
  }

  const previewHeight = Math.min(width * 0.5, height * 0.32)
  return (
    <SafeAreaView style={styles.page}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {progress}
        <View style={[styles.preview, { height: previewHeight }]}>
          <Clock settings={settings} />
        </View>
        {text}
      </ScrollView>
      <View style={styles.footer}>{footer}</View>
    </SafeAreaView>
  )
}

export function OptionCard({ label, hint, selected, onPress }: { label: string; hint?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      aria-checked={selected}
      style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View>
      <View style={styles.optionText}>
        <Text style={styles.optionLabel}>{label}</Text>
        {!!hint && <Text style={styles.optionHint}>{hint}</Text>}
      </View>
    </Pressable>
  )
}

export function Button({ title, onPress, primary, style }: { title: string; onPress: () => void; primary?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, primary ? styles.buttonPrimary : styles.buttonSecondary, style, pressed && styles.pressed]}
    >
      <Text style={[styles.buttonText, primary && styles.buttonTextPrimary]}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  wide: { flexDirection: 'row', gap: 24, paddingHorizontal: 20 },
  wideLeft: { flex: 1, paddingTop: 16, paddingBottom: 12 },
  wideRight: { flex: 1, maxWidth: 520 },
  wideScroll: { paddingTop: 12, paddingBottom: 8 },
  previewWide: { flex: 1, marginBottom: 0 },
  footerWide: { paddingHorizontal: 0 },
  content: { padding: 20, paddingBottom: 8, width: '100%', maxWidth: 560, alignSelf: 'center' },
  progress: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  dotDone: { backgroundColor: colors.text },
  preview: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#000',
    overflow: 'hidden',
    padding: 12,
    marginBottom: 24,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 6, lineHeight: 22 },
  body: { marginTop: 20, gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.text },
  optionText: { flex: 1 },
  optionLabel: { color: colors.text, fontSize: 17, fontWeight: '600' },
  optionHint: { color: colors.muted, fontSize: 14, marginTop: 3, fontVariant: ['tabular-nums'] },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.text },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.text },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  button: { flex: 1, minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  buttonPrimary: { backgroundColor: colors.text },
  buttonSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  buttonText: { color: colors.text, fontSize: 17, fontWeight: '600' },
  buttonTextPrimary: { color: '#000' },
  pressed: { opacity: 0.7 },
})
