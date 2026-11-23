import { Text } from 'react-native'
import { router } from 'expo-router'
import { useSettings } from '../settings'
import { isTV, sizedStyles } from '../tv'
import { canKeepAwake, enterFullscreen } from '../web'
import { STEPS } from '../wizard/steps'
import { Button, List, Row, WizardPage, colors } from '../wizard/ui'

/** Last wizard page: a summary of the choices and the Start button. */
export default function Ready() {
  const { settings, save } = useSettings()
  return (
    <WizardPage
      name="Ready"
      index={STEPS.length}
      count={STEPS.length + 1}
      title="Ready"
      subtitle={
        isTV
          ? 'Press Start. Press Back on the remote to come back here.'
          : 'Place your phone, then tap Start. Tap the clock twice to come back here.' +
            (canKeepAwake ? '' : ' This browser may let the screen go dark; turn off auto-lock to keep it on.')
      }
      footer={
        <>
          <Button
            title="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace(`/setup/${STEPS[STEPS.length - 1].id}`))}
          />
          <Button
            title="Start"
            primary
            preferredFocus
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
        {STEPS.map((step, i) => (
          <Row
            key={step.id}
            first={i === 0}
            role="button"
            label={step.name}
            accessibilityLabel={`${step.name}: ${step.summary(settings)}`}
            accessibilityHint={`Change ${step.name.toLowerCase()}`}
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
