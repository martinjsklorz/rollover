import { Redirect } from 'expo-router'

/** A mistyped or outdated link opens the home screen instead of the router's developer page. */
export default function NotFound() {
  return <Redirect href="/" />
}
