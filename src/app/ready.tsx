import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useSettings } from '../settings'
import { STEPS } from '../wizard/steps'
import { Button, WizardPage, colors } from '../wizard/ui'

/** Last wizard page: a summary of the choices and the Start button. */
export default function Ready() {
  const { settings, save } = useSettings()
  return (
    <WizardPage
      index={STEPS.length}
      count={STEPS.length + 1}
      title="Ready"
      subtitle="Place your phone, then tap Start. Tap the clock to come back here."
      footer={
        <>
          <Button title="Back" onPress={() => router.back()} />
          <Button
            title="Start"
            primary
            onPress={() => {
              save()
              router.push('/clock')
            }}
          />
        </>
      }
    >
      <View style={styles.summary}>
        {STEPS.map((step, i) => (
          <Pressable
            key={step.id}
            onPress={() => router.dismissTo(`/setup/${step.id}`)}
            accessibilityRole="button"
            accessibilityHint={`Change ${step.name}`}
            style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && styles.pressed]}
          >
            <Text style={styles.name}>{step.name}</Text>
            <Text style={styles.value}>{step.summary(settings)}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </WizardPage>
  )
}

const styles = StyleSheet.create({
  summary: { borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 8 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  name: { flex: 1, color: colors.muted, fontSize: 16 },
  value: { color: colors.text, fontSize: 16, fontWeight: '600' },
  chevron: { color: colors.muted, fontSize: 22, marginLeft: 4 },
  pressed: { opacity: 0.7 },
})
