import { Platform } from 'react-native'

/** Helpers shared by the clock's animations: the face, the greeting and the midnight animations. */

export type { Size } from '../useLayoutSize'

/** react-native-web has no native animation driver */
export const useNativeDriver = Platform.OS !== 'web'

/** A random number from `min` up to `max`. */
export const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** A random item of a non-empty list. */
export const pick = <T>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]
