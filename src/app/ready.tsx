import { Text } from 'react-native'
import { router } from 'expo-router'
import { useSettings } from '../settings'
import { prepareTune } from '../sound'
import { isTV, sizedStyles } from '../tv'
import { canKeepAwake, enterFullscreen } from '../web'
import { useStrings } from '../i18n'
import { stepsFor, useSteps } from '../wizard/steps'
import { colors } from '../theme'
import { Button, List, Row, WizardPage } from '../wizard/ui'

/** Last wizard page: a summary of the choices and the Start button. */
export default function Ready() {
  const { settings, save } = useSettings()
  const t = useStrings()
  const steps = stepsFor(useSteps(), settings)
  return (
    <WizardPage
      name={t.ready.title}
      index={steps.length}
      count={steps.length + 1}
      title={t.ready.title}
      subtitle={isTV ? t.ready.subtitleTV : canKeepAwake ? t.ready.subtitle : `${t.ready.subtitle} ${t.ready.mayDim}`}
      footer={
        <>
          <Button
            title={t.wizard.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace(`/setup/${steps[steps.length - 1].id}`))}
          />
          <Button
            title={t.ready.start}
            primary
            preferredFocus
            onPress={() => {
              save()
              // inside the tap, and before full screen (which uses up the tap): a browser only lets
              // the first midnight's tune play after a user gesture
              prepareTune(settings)
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

const styles = sizedStyles({
  value: { color: colors.muted, fontSize: 17, fontVariant: ['tabular-nums'] },
  chevron: { color: colors.muted, fontSize: 24, marginLeft: -6 },
})
