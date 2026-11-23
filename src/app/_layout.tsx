import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useLanguage } from '../i18n'
import { SettingsProvider } from '../settings'
import { useDocumentLanguage } from '../web'

// keep the (black) launch screen up until the saved settings are loaded
SplashScreen.preventAutoHideAsync().catch(() => {})

export default function RootLayout() {
  useDocumentLanguage(useLanguage())
  return (
    <SettingsProvider onReady={() => SplashScreen.hideAsync().catch(() => {})}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
        {/* each step is its own screen in the stack, so "go back to Style" finds the Style page */}
        <Stack.Screen name="setup/[step]" dangerouslySingular={(_, params) => String(params?.step)} />
        {/* iOS takes the status bar from the screen options; <StatusBar hidden /> alone is ignored there */}
        <Stack.Screen name="clock" options={{ autoHideHomeIndicator: true, statusBarHidden: true }} />
      </Stack>
    </SettingsProvider>
  )
}
