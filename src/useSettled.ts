import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'

/**
 * False for a moment each time the screen comes into focus. Taps are ignored until then,
 * so the second tap of a double tap doesn't land on whatever button the next screen
 * has in the same spot (e.g. Next on the last step, then Start on Ready).
 */
export function useSettled(delay = 400) {
  const [settled, setSettled] = useState(false)
  useFocusEffect(
    useCallback(() => {
      const id = setTimeout(() => setSettled(true), delay)
      return () => {
        clearTimeout(id)
        setSettled(false)
      }
    }, [delay]),
  )
  return settled
}
