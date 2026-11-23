import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { useSettings } from '../../settings'
import { useStrings } from '../../i18n'
import { STEP_IDS, hintText, isSelected, stepIndex, useSteps } from '../../wizard/steps'
import { Button, List, OptionRow, WizardPage } from '../../wizard/ui'

/** One wizard page per setting, defined in src/wizard/steps.ts. */
export default function SetupStep() {
  const { step: id } = useLocalSearchParams<{ step: string }>()
  const { settings, update } = useSettings()
  const t = useStrings()
  const steps = useSteps()
  const index = stepIndex(id)
  if (index < 0) return <Redirect href="/" />

  const step = steps[index]
  const anySelected = step.choices.some((choice) => isSelected(choice, settings))
  const next = () => router.push(index + 1 < STEP_IDS.length ? `/setup/${STEP_IDS[index + 1]}` : '/ready')
  // after a reload (web) there is no history: go to the previous step, or home from the first
  const back = () => {
    if (router.canGoBack()) router.back()
    else router.replace(index > 0 ? `/setup/${STEP_IDS[index - 1]}` : '/')
  }

  return (
    <WizardPage
      name={step.name}
      index={index}
      count={STEP_IDS.length + 1}
      title={step.title}
      subtitle={step.subtitle}
      footer={
        <>
          <Button title={t.wizard.back} onPress={back} />
          <Button title={t.wizard.next} primary onPress={next} />
        </>
      }
    >
      <List label={step.name}>
        {step.choices.map((choice, i) => (
          <OptionRow
            key={choice.label}
            first={i === 0}
            label={choice.label}
            hint={hintText(choice, settings)}
            selected={isSelected(choice, settings)}
            tabbable={anySelected ? isSelected(choice, settings) : i === 0}
            onPress={() => update(choice.value)}
          />
        ))}
      </List>
    </WizardPage>
  )
}
