import { useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'

export type Size = { width: number; height: number }

const remembered = new Map<string, Size>()

/**
 * A view's size from onLayout; null until it's measured. With a `key` the size is remembered,
 * so the next view with the same key (the preview on the next wizard page) starts at that size
 * instead of drawing nothing for a frame.
 */
export function useLayoutSize(key?: string) {
  const [size, setSize] = useState<Size | null>(() => (key && remembered.get(key)) || null)
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    // web: a screen left in the stack is hidden (display: none) and reports 0×0; keep the last size
    if (width <= 0 || height <= 0) return
    if (key) remembered.set(key, { width, height })
    setSize((s) => (s?.width === width && s.height === height ? s : { width, height }))
  }
  return [size, onLayout] as const
}
