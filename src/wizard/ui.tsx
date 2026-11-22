import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Clock from '../clock/Clock'
import { useSettings } from '../settings'
import { colors } from '../theme'

export { colors }

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Layout shared by every wizard page: mark and step count, live preview, question, options, footer buttons. */
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

  const header = (
    <View style={styles.header}>
      <Image source={require('../../assets/brand/mark.png')} style={styles.mark} accessibilityLabel="Rollover" />
      <Text style={styles.step} accessibilityLabel={`Step ${index + 1} of ${count}`}>
        {pad2(index + 1)}
        <Text style={styles.stepOf}> / {pad2(count)}</Text>
      </Text>
    </View>
  )
  const text = (
    <>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
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
          {header}
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

  const previewHeight = Math.min(width * 0.5, height * 0.3)
  return (
    <SafeAreaView style={styles.page}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {header}
        <View style={[styles.preview, { height: previewHeight }]}>
          <Clock settings={settings} />
        </View>
        {text}
      </ScrollView>
      <View style={styles.footer}>{footer}</View>
    </SafeAreaView>
  )
}

/** Rows in a list separated by hairlines. */
export function List({ children }: { children: ReactNode }) {
  return <View style={styles.list}>{children}</View>
}

/** One row of a List: label, optional hint, and whatever goes on the right. */
export function Row({
  label,
  hint,
  right,
  onPress,
  first,
  role,
  selected,
  accessibilityHint,
}: {
  label: string
  hint?: string
  right?: ReactNode
  onPress: () => void
  first?: boolean
  role: 'radio' | 'button'
  selected?: boolean
  accessibilityHint?: string
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      aria-checked={role === 'radio' ? selected : undefined}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, !first && styles.rowLine, pressed && styles.rowPressed]}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {!!hint && <Text style={styles.rowHint}>{hint}</Text>}
      </View>
      {right}
    </Pressable>
  )
}

/** A choice in a list. The selected one carries the brand's midnight dot. */
export function OptionRow({ label, hint, selected, onPress, first }: { label: string; hint?: string; selected: boolean; onPress: () => void; first?: boolean }) {
  return (
    <Row
      label={label}
      hint={hint}
      onPress={onPress}
      first={first}
      role="radio"
      selected={selected}
      right={<View style={[styles.radio, selected && styles.radioOn]}>{selected && <View style={styles.radioDot} />}</View>}
    />
  )
}

export function Button({ title, onPress, primary, style }: { title: string; onPress: () => void; primary?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonPlain,
        style,
        pressed && (primary ? styles.buttonPrimaryPressed : styles.pressed),
      ]}
    >
      <Text style={[styles.buttonText, primary && styles.buttonTextPrimary]}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  wide: { flexDirection: 'row', gap: 32, paddingHorizontal: 24 },
  wideLeft: { flex: 1, paddingTop: 16, paddingBottom: 16 },
  wideRight: { flex: 1, maxWidth: 520 },
  wideScroll: { paddingTop: 52, paddingBottom: 8 },
  previewWide: { flex: 1, marginBottom: 0 },
  footerWide: { paddingHorizontal: 0 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, width: '100%', maxWidth: 560, alignSelf: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 28, marginBottom: 20 },
  mark: { width: 24, height: 24 },
  step: { color: colors.text, fontSize: 13, fontWeight: '500', letterSpacing: 1, fontVariant: ['tabular-nums'] },
  stepOf: { color: colors.muted },

  preview: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    padding: 12,
    marginBottom: 36,
  },
  title: { color: colors.text, fontSize: 30, fontWeight: '300', letterSpacing: -0.4, lineHeight: 36 },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 8, lineHeight: 22 },
  body: { marginTop: 28 },

  list: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, paddingHorizontal: 4, minHeight: 64 },
  rowLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  rowPressed: { backgroundColor: colors.surface },
  rowText: { flex: 1 },
  rowLabel: { color: colors.text, fontSize: 17 },
  rowHint: { color: colors.muted, fontSize: 14, marginTop: 3, fontVariant: ['tabular-nums'] },

  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.ember },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ember },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  // minHeight, not height: a fixed height collapses when buttons are stacked in a column
  button: { minHeight: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  // Drawn like the mark: a thin white stroke with round ends, no fill
  buttonPrimary: { flex: 1, borderWidth: 1.5, borderColor: colors.text },
  buttonPrimaryPressed: { backgroundColor: colors.surface },
  buttonPlain: { paddingHorizontal: 20 },
  buttonText: { color: colors.muted, fontSize: 17, fontWeight: '400', letterSpacing: 0.2 },
  buttonTextPrimary: { color: colors.text },
  pressed: { opacity: 0.6 },
})
