import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.rollover.clock',
  appName: 'Rollover',
  webDir: 'dist',
  backgroundColor: '#000000',
  ios: { contentInset: 'never', backgroundColor: '#000000' },
  android: { backgroundColor: '#000000' },
}

export default config
