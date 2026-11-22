import { StyleSheet, Text } from 'react-native'
import { router } from 'expo-router'
import { useSettings } from '../settings'
import { STEPS } from '../wizard/steps'
import { Button, List, Row, WizardPage, colors } from '../wizard/ui'

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
      <List>
        {STEPS.map((step, i) => (
          <Row
            key={step.id}
            first={i === 0}
            role="button"
            label={step.name}
            accessibilityHint={`Change ${step.name}`}
            onPress={() => router.dismissTo(`/setup/${step.id}`)}
            right={
              <>
                <Text style={styles.value}>{step.summary(settings)}</Text>
                <Text style={styles.chevron}>›</Text>
              </>
            }
          />
        ))}
      </List>
    </WizardPage>
  )
}

const styles = StyleSheet.create({
  value: { color: colors.muted, fontSize: 17, fontVariant: ['tabular-nums'] },
  chevron: { color: colors.line, fontSize: 24, marginLeft: -6 },
})
