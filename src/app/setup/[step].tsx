import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { useSettings } from '../../settings'
import { STEPS, hintText, isSelected, stepIndex } from '../../wizard/steps'
import { Button, List, OptionRow, WizardPage } from '../../wizard/ui'

/** One wizard page per setting, defined in src/wizard/steps.ts. */
export default function SetupStep() {
  const { step: id } = useLocalSearchParams<{ step: string }>()
  const { settings, update } = useSettings()
  const index = stepIndex(id)
  if (index < 0) return <Redirect href="/" />

  const step = STEPS[index]
  const anySelected = step.choices.some((choice) => isSelected(choice, settings))
  const next = () => router.push(index + 1 < STEPS.length ? `/setup/${STEPS[index + 1].id}` : '/ready')
  // after a reload (web) there is no history: go to the previous step, or home from the first
  const back = () => {
    if (router.canGoBack()) router.back()
    else router.replace(index > 0 ? `/setup/${STEPS[index - 1].id}` : '/')
  }

  return (
    <WizardPage
      name={step.name}
      index={index}
      count={STEPS.length + 1}
      title={step.title}
      subtitle={step.subtitle}
      previewFrom={step.preview}
      footer={
        <>
          <Button title="Back" onPress={back} />
          <Button title="Next" primary onPress={next} />
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
