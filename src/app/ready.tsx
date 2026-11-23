import { StyleSheet, Text } from 'react-native'
import { router } from 'expo-router'
import { useSettings } from '../settings'
import { canKeepAwake, enterFullscreen } from '../web'
import { useStrings } from '../i18n'
import { STEP_IDS, useSteps } from '../wizard/steps'
import { Button, List, Row, WizardPage, colors } from '../wizard/ui'

/** Last wizard page: a summary of the choices and the Start button. */
export default function Ready() {
  const { settings, save } = useSettings()
  const t = useStrings()
  const steps = useSteps()
  return (
    <WizardPage
      name={t.ready.title}
      index={STEP_IDS.length}
      count={STEP_IDS.length + 1}
      title={t.ready.title}
      subtitle={canKeepAwake ? t.ready.subtitle : `${t.ready.subtitle} ${t.ready.mayDim}`}
      footer={
        <>
          <Button
            title={t.wizard.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace(`/setup/${STEP_IDS[STEP_IDS.length - 1]}`))}
          />
          <Button
            title={t.ready.start}
            primary
            onPress={() => {
              save()
              enterFullscreen()
              router.push('/clock')
            }}
          />
        </>
      }
    >
      <List>
        {steps.map((step, i) => (
          <Row
            key={step.id}
            first={i === 0}
            role="button"
            label={step.name}
            accessibilityLabel={`${step.name}: ${step.summary(settings)}`}
            accessibilityHint={t.ready.change(step.name)}
            onPress={() => router.dismissTo(`/setup/${step.id}`)}
            right={
              <>
                <Text style={styles.value}>{step.summary(settings)}</Text>
                <Text style={styles.chevron} aria-hidden>
                  ›
                </Text>
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
  chevron: { color: colors.muted, fontSize: 24, marginLeft: -6 },
})
