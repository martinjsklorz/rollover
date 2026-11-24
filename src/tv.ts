import { useEffect } from 'react'
import { Platform, StyleSheet, TVEventControl, useWindowDimensions } from 'react-native'
import { usePathname } from 'expo-router'

/** Android TV or Apple TV: a build made with EXPO_TV=1 (see README). Driven by a remote, not touch. */
export const isTV = Platform.isTV

const appleTV = Platform.OS === 'ios' && Platform.isTV

/**
 * Apple TV lays out in points at 1920×1080, twice Android TV's 960×540 dp. The layouts are made for
 * the smaller numbers (a phone on its side, Android TV), so on Apple TV every size is doubled and the
 * window counts as half its size. Doubling the sizes instead of scaling the whole view keeps text sharp.
 */
export const tvScale = appleTV ? 2 : 1

/** The window in layout units: points or dp, or half the points on Apple TV (see tvScale). */
export function useScreenSize() {
  const { width, height } = useWindowDimensions()
  return { width: width / tvScale, height: height / tvScale }
}

/** Style keys that hold a ratio or an order, not a size. */
const UNITLESS = new Set(['flex', 'flexGrow', 'flexShrink', 'opacity', 'zIndex', 'aspectRatio', 'elevation'])

/** StyleSheet.create, with every size multiplied by tvScale. */
export function sizedStyles<S extends Parameters<typeof StyleSheet.create>[0]>(styles: S): Readonly<S> {
  if (tvScale === 1) return StyleSheet.create(styles)
  const sized = Object.fromEntries(
    Object.entries(styles).map(([name, style]) => [
      name,
      Object.fromEntries(
        Object.entries(style as object).map(([key, value]) => [key, typeof value === 'number' && !UNITLESS.has(key) ? value * tvScale : value]),
      ),
    ]),
  )
  return StyleSheet.create(sized as S)
}

/**
 * Apple TV: the remote's Back (Menu) button goes back while there's a screen to go back to.
 * On the home screen it's left to the system, which goes to the TV's home screen, as Apple requires.
 * Android TV's Back button works like a phone's without this.
 */
export function useTVMenuKey() {
  const pathname = usePathname()
  useEffect(() => {
    if (!appleTV) return
    if (pathname === '/') TVEventControl.disableTVMenuKey()
    else TVEventControl.enableTVMenuKey()
  }, [pathname])
}

/**
 * Android TV: room for the edges a TV may cut off (overscan), as Google's TV guidelines ask.
 * Apple TV's safe area already covers this.
 */
export const tvMargins = Platform.OS === 'android' && isTV ? { paddingHorizontal: 48, paddingVertical: 27 } : undefined
