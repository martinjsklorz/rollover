import { useEffect, useId, useRef, useState, type ComponentRef, type ReactNode, type Ref } from 'react'
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native'
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Head from 'expo-router/head'
import Clock from '../clock/Clock'
import { useStrings } from '../i18n'
import { useSettings } from '../settings'
import { useLayoutSize } from '../useLayoutSize'
import { useSettled } from '../useSettled'
import { noFocusRing, useFocusOnScreen } from '../web'
import { colors } from '../theme'
import { isTV, sizedStyles, tvMargins, tvScale, useScreenSize } from '../tv'

export { colors }

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Below this window height, type and spacing tighten so the options fit without scrolling. */
const SHORT = 760
/** Widest the portrait column gets (tablet, browser). */
const COLUMN = 560
/** Tallest the landscape preview card gets on a tablet or desktop, as a share of the window height. */
const CARD = 0.55
/** From the top of the landscape group to the top of its preview card: left padding, header and its margin. */
const CARD_OFFSET = 16 + 28 + 20

/** Layout shared by every wizard page: mark and step count, live preview, question, options, footer buttons. */
export function WizardPage({
  name,
  index,
  count,
  title,
  subtitle,
  children,
  footer,
}: {
  /** short page name for the browser tab */
  name: string
  index: number
  count: number
  title: string
  subtitle?: string
  children: ReactNode
  footer: ReactNode
}) {
  const { settings, previewStartedAt } = useSettings()
  const t = useStrings()
  const { width, height } = useScreenSize()
  const short = height < SHORT
  const wide = width > height
  const settled = useSettled()
  const [moreBelow, scrollProps] = useMoreBelow()
  const titleRef = useRef<ComponentRef<typeof Text>>(null)
  useFocusOnScreen(titleRef)

  // Decorative for screen readers: the options' hints say the same in words.
  // One loop for the whole wizard and a remembered size, so the next page's preview
  // picks up where this one is instead of starting over from a blank frame.
  const preview = (
    <View style={styles.fill} aria-hidden>
      <Clock settings={settings} startedAt={previewStartedAt} sizeKey={`preview ${width}×${height}`} preview />
    </View>
  )
  const head = (
    <Head>
      <title>{`${name} · Rollover`}</title>
    </Head>
  )
  const header = (
    <View style={[styles.header, short && styles.headerShort]}>
      <Image source={require('../../assets/brand/mark.png')} style={styles.mark} accessibilityLabel="Rollover" />
      <Text style={styles.step} aria-hidden>
        {pad2(index + 1)}
        <Text style={styles.stepOf}> / {pad2(count)}</Text>
      </Text>
      <Text style={styles.srOnly}>{t.wizard.stepOf(index + 1, count)}</Text>
    </View>
  )
  const text = (
    <>
      <Text ref={titleRef} style={[styles.title, short && styles.titleShort]} role="heading">
        {title}
      </Text>
      {!!subtitle && <Text style={[styles.subtitle, short && styles.subtitleShort]}>{subtitle}</Text>}
      <View style={[styles.body, short && styles.bodyShort]}>{children}</View>
    </>
  )
  const footerBar = (
    <View
      style={[styles.footer, wide && styles.footerWide, short && styles.footerShort, moreBelow && styles.footerLine, !settled && styles.locked]}
    >
      {footer}
    </View>
  )

  if (wide) {
    return (
      <WideLayout
        head={head}
        header={header}
        preview={preview}
        footer={footerBar}
        short={short}
        scroll={
          <ScrollView {...scrollProps} contentContainerStyle={short ? styles.wideScrollShort : styles.wideScroll}>
            {text}
          </ScrollView>
        }
      />
    )
  }

  // Portrait: mark, step and preview stay put; only the question and options scroll.
  // Phones fill the screen with the buttons at the bottom; on a tablet or a tall browser window
  // the page is one column that ends with the buttons, instead of a gap above them.
  const roomy = width >= 600 && height >= SHORT
  const columnWidth = Math.min(width, COLUMN) - 48
  const previewHeight = short ? Math.min(columnWidth * 0.42, height * 0.2) : Math.min(columnWidth * 0.5, height * 0.3)
  return (
    <SafeAreaView style={[styles.page, roomy && { paddingTop: height * 0.08 * tvScale }]}>
      <StatusBar style="light" />
      {head}
      <View style={[styles.column, roomy ? styles.columnRoomy : styles.fill]}>
        <View style={styles.top}>
          {header}
          <View style={[styles.preview, short && styles.previewShort, { height: previewHeight * tvScale }]}>{preview}</View>
        </View>
        <ScrollView {...scrollProps} style={roomy ? styles.scrollFit : styles.fill} contentContainerStyle={styles.scroll}>
          {text}
        </ScrollView>
        {footerBar}
      </View>
    </SafeAreaView>
  )
}

/**
 * Landscape: preview on the left, question and options on the right.
 * The preview card has the screen's shape, so it looks like the clock it previews.
 * On a phone on its side it fills the screen with the buttons at the bottom right; on a tablet
 * or desktop it's a centered group with the buttons right under the options.
 */
function WideLayout({
  head,
  header,
  preview,
  scroll,
  footer,
  short,
}: {
  head: ReactNode
  header: ReactNode
  preview: ReactNode
  scroll: ReactNode
  footer: ReactNode
  short: boolean
}) {
  const { width, height } = useScreenSize()
  const fill = height < 600
  // remembered, so the next page draws the preview card from its first frame
  const [area, onLayout] = useLayoutSize(`card area ${width}×${height}`)
  const aspect = width / height
  let card: { width: number; height: number } | null = null
  if (area) {
    // area is measured, so it's already in points; height isn't
    const cardWidth = Math.min(area.width, (fill ? area.height : CARD * height * tvScale) * aspect)
    card = { width: cardWidth, height: cardWidth / aspect }
  }
  // Tablet and desktop: the group hangs from a fixed top that centers the tallest card, instead of
  // being centered as a whole, so the preview stays put when the next step has more or fewer options.
  const top = fill ? undefined : Math.max(16, ((1 - CARD) * height) / 2 - CARD_OFFSET) * tvScale
  return (
    <SafeAreaView
      style={[styles.page, styles.widePage, !fill && { justifyContent: 'flex-start', paddingTop: top }, tvMargins]}
    >
      <StatusBar style="light" />
      {head}
      <View style={[styles.wide, fill ? styles.fill : styles.wideRoomy]}>
        <View style={styles.wideLeft}>
          {header}
          <View style={fill ? styles.wideCardArea : undefined} onLayout={onLayout}>
            {card && <View style={[styles.preview, styles.previewWide, card]}>{preview}</View>}
          </View>
        </View>
        <View style={[styles.wideRight, !short && styles.wideRightRoomy]}>
          {scroll}
          {footer}
        </View>
      </View>
    </SafeAreaView>
  )
}

/** Whether a ScrollView has more content below what's visible, for a hairline above the buttons. */
function useMoreBelow() {
  const [m, setM] = useState({ view: 0, content: 0, y: 0 })
  const scrollProps = {
    onLayout: (e: LayoutChangeEvent) => {
      const view = e.nativeEvent.layout.height
      setM((s) => ({ ...s, view }))
    },
    onContentSizeChange: (_: number, content: number) => setM((s) => ({ ...s, content })),
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y
      setM((s) => (s.y === y ? s : { ...s, y }))
    },
    scrollEventThrottle: 16,
  }
  return [m.content - m.y - m.view > 1, scrollProps] as const
}

/** Rows in a list separated by hairlines. `label` makes it a radio group, named for screen readers. */
export function List({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <View style={styles.list} role={label ? 'radiogroup' : undefined} aria-label={label}>
      {children}
    </View>
  )
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
  tabbable = true,
  accessibilityLabel,
  accessibilityHint,
  onKeyDown,
  rowRef,
  preferredFocus,
}: {
  label: string
  hint?: string
  right?: ReactNode
  onPress: () => void
  first?: boolean
  role: 'radio' | 'button'
  selected?: boolean
  /** false takes the row out of the Tab order (radio groups have one tab stop) */
  tabbable?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  onKeyDown?: (e: WebKeyEvent) => void
  rowRef?: Ref<ComponentRef<typeof Pressable>>
  /** TV: the row the remote's focus starts on */
  preferredFocus?: boolean
}) {
  const short = useScreenSize().height < SHORT
  const id = useId()
  // web: name the row by its label and describe it by its hint, instead of reading both as one run-on name
  const webProps =
    Platform.OS === 'web'
      ? {
          'aria-labelledby': accessibilityLabel ? undefined : `${id}-label`,
          'aria-describedby': hint ? `${id}-hint` : undefined,
          onKeyDown,
        }
      : {}
  return (
    <Pressable
      ref={rowRef}
      onPress={onPress}
      role={role}
      aria-checked={role === 'radio' ? selected : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      tabIndex={tabbable ? 0 : -1}
      hasTVPreferredFocus={preferredFocus}
      {...(webProps as object)}
      style={({ pressed, focused }) => [
        styles.row,
        short && styles.rowShort,
        isTV && styles.rowTV,
        !first && styles.rowLine,
        pressed && styles.rowPressed,
        isTV && focused && styles.rowFocused,
      ]}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowLabel} nativeID={`${id}-label`}>
          {label}
        </Text>
        {!!hint && (
          <Text style={styles.rowHint} nativeID={`${id}-hint`}>
            {hint}
          </Text>
        )}
      </View>
      {right}
    </Pressable>
  )
}

type WebKeyEvent = { key: string; preventDefault: () => void; currentTarget: unknown }

/** Arrow keys move between the options of a radio group and select them, as in any radio group. */
const ARROWS: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }

/** A choice in a list. The selected one carries the brand's midnight dot. */
export function OptionRow({
  label,
  hint,
  selected,
  tabbable,
  onPress,
  first,
}: {
  label: string
  hint?: string
  selected: boolean
  /** the group's one Tab stop: the selected option, or the first if none is */
  tabbable: boolean
  onPress: () => void
  first?: boolean
}) {
  const ref = useRef<ComponentRef<typeof Pressable>>(null)
  // web: on a short screen the selected option can start below the fold, so bring it into view once
  const selectedOnOpen = useRef(selected)
  useEffect(() => {
    if (Platform.OS === 'web' && selectedOnOpen.current) {
      ;(ref.current as unknown as HTMLElement | null)?.scrollIntoView?.({ block: 'nearest' })
    }
  }, [])
  const onKeyDown = (e: WebKeyEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onPress()
      return
    }
    const step = ARROWS[e.key]
    if (!step) return
    e.preventDefault()
    const row = e.currentTarget as HTMLElement
    const rows = Array.from(row.parentElement?.querySelectorAll<HTMLElement>('[role="radio"]') ?? [])
    const next = rows[(rows.indexOf(row) + step + rows.length) % rows.length]
    next?.focus()
    next?.click()
  }
  return (
    <Row
      rowRef={ref}
      label={label}
      hint={hint}
      onPress={onPress}
      onKeyDown={onKeyDown}
      first={first}
      role="radio"
      selected={selected}
      tabbable={tabbable}
      preferredFocus={isTV && tabbable}
      right={<View style={[styles.radio, selected && styles.radioOn]}>{selected && <View style={styles.radioDot} />}</View>}
    />
  )
}

/** A one-line text field: a thin underline that turns white while you type, like the primary button's outline. */
export function TextInputRow({
  label,
  placeholder,
  maxLength,
  autoCapitalize,
  value,
  onChange,
  onSubmit,
}: {
  /** names the field for screen readers */
  label: string
  placeholder: string
  maxLength: number
  autoCapitalize: 'words' | 'sentences'
  value: string
  onChange: (value: string) => void
  /** the keyboard's Next key */
  onSubmit: () => void
}) {
  const [focused, setFocused] = useState(false)
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      onSubmitEditing={onSubmit}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      maxLength={maxLength}
      accessibilityLabel={label}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      autoComplete="off"
      returnKeyType="next"
      selectionColor={colors.text}
      style={[styles.input, focused && styles.inputFocused]}
    />
  )
}

/** `preferredFocus`: on a TV, the remote's focus starts on this button. */
export function Button({
  title,
  onPress,
  primary,
  preferredFocus,
  style,
}: {
  title: string
  onPress: () => void
  primary?: boolean
  preferredFocus?: boolean
  style?: StyleProp<ViewStyle>
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={8}
      hasTVPreferredFocus={preferredFocus}
      style={({ pressed, focused }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonPlain,
        style,
        pressed && (primary ? styles.buttonPrimaryPressed : styles.pressed),
        isTV && focused && styles.buttonFocused,
      ]}
    >
      {({ focused }) => (
        <Text style={[styles.buttonText, primary && styles.buttonTextPrimary, isTV && focused && styles.buttonTextFocused]}>{title}</Text>
      )}
    </Pressable>
  )
}

const styles = sizedStyles({
  page: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  locked: { pointerEvents: 'none' },
  srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 },

  column: { width: '100%', maxWidth: COLUMN, alignSelf: 'center' },
  columnRoomy: { flexShrink: 1 },
  top: { paddingHorizontal: 24, paddingTop: 16 },
  scrollFit: { flexGrow: 0, flexShrink: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 8 },

  widePage: { paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  wide: { flexDirection: 'row', gap: 32, width: '100%' },
  wideRoomy: { maxWidth: 1120, flexShrink: 1 },
  wideLeft: { flex: 1, paddingTop: 16, paddingBottom: 16 },
  wideCardArea: { flex: 1, justifyContent: 'center' },
  wideRight: { flex: 1, maxWidth: 440 },
  wideRightRoomy: { flex: 0, flexBasis: 440, flexShrink: 1 },
  wideScroll: { paddingTop: 64, paddingBottom: 8 },
  wideScrollShort: { paddingTop: 16, paddingBottom: 8 },
  previewWide: { marginBottom: 0 },
  footerWide: { paddingHorizontal: 0 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 28, marginBottom: 20 },
  headerShort: { marginBottom: 12 },
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
  previewShort: { marginBottom: 20 },
  title: { color: colors.text, fontSize: 30, fontWeight: '300', letterSpacing: -0.4, lineHeight: 36, ...noFocusRing },
  titleShort: { fontSize: 24, lineHeight: 30 },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 8, lineHeight: 22 },
  subtitleShort: { fontSize: 15, marginTop: 6, lineHeight: 20 },
  body: { marginTop: 28 },
  bodyShort: { marginTop: 16 },

  list: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, paddingHorizontal: 4, minHeight: 64 },
  rowShort: { paddingVertical: 10, minHeight: 52 },
  rowLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  rowPressed: { backgroundColor: colors.surface },
  // TV: room between the text and the focus outline
  rowTV: { paddingHorizontal: 28 },
  // TV: the remote's focus, drawn like the primary button's stroke so it reads from the couch
  rowFocused: { backgroundColor: colors.surface, borderRadius: 12, outlineWidth: 2, outlineColor: colors.text, outlineOffset: -2 },
  rowText: { flex: 1 },
  rowLabel: { color: colors.text, fontSize: 17 },
  rowHint: { color: colors.muted, fontSize: 14, marginTop: 3, fontVariant: ['tabular-nums'] },

  input: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '300',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.line,
    ...noFocusRing,
  },
  inputFocused: { borderBottomColor: colors.text },

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
    // a hairline shows when there are more options below (footerLine)
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'transparent',
  },
  footerShort: { paddingBottom: 8 },
  footerLine: { borderTopColor: colors.line },
  // minHeight, not height: a fixed height collapses when buttons are stacked in a column
  button: { minHeight: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  // Drawn like the mark: a thin white stroke with round ends, no fill
  buttonPrimary: { flex: 1, borderWidth: 1.5, borderColor: colors.text },
  buttonPrimaryPressed: { backgroundColor: colors.surface },
  buttonPlain: { paddingHorizontal: 20 },
  buttonText: { color: colors.muted, fontSize: 17, fontWeight: '400', letterSpacing: 0.2 },
  buttonTextPrimary: { color: colors.text },
  pressed: { opacity: 0.6 },
  // TV: the focused button is filled white, the usual TV focus look
  buttonFocused: { backgroundColor: colors.text, borderColor: colors.text, opacity: 1 },
  buttonTextFocused: { color: colors.bg },
})
