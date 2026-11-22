import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { useSettings } from '../../settings'
import { STEPS, hintText, isSelected, stepIndex } from '../../wizard/steps'
import { Button, OptionCard, WizardPage } from '../../wizard/ui'

/** One wizard page per setting, defined in src/wizard/steps.ts. */
export default function SetupStep() {
  const { step: id } = useLocalSearchParams<{ step: string }>()
  const { settings, update } = useSettings()
  const index = stepIndex(id)
  if (index < 0) return <Redirect href="/" />

  const step = STEPS[index]
  const next = () => router.push(index + 1 < STEPS.length ? `/setup/${STEPS[index + 1].id}` : '/ready')

  return (
    <WizardPage
      index={index}
      count={STEPS.length + 1}
      title={step.title}
      subtitle={step.subtitle}
      footer={
        <>
          <Button title="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <Button title="Next" primary onPress={next} />
        </>
      }
    >
      {step.choices.map((choice) => (
        <OptionCard
          key={choice.label}
          label={choice.label}
          hint={hintText(choice, settings)}
          selected={isSelected(choice, settings)}
          onPress={() => update(choice.value)}
        />
      ))}
    </WizardPage>
  )
}
