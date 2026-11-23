import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { useSettings } from '../../settings'
import { choicesFor, hintText, isSelected, stepsFor, subtitleText } from '../../wizard/steps'
import { Button, List, OptionRow, TextInputRow, WizardPage } from '../../wizard/ui'

/** One wizard page per setting, defined in src/wizard/steps.ts. */
export default function SetupStep() {
  const { step: id } = useLocalSearchParams<{ step: string }>()
  const { settings, update } = useSettings()
  // the pages depend on the occasion: the name page for a birthday, no theme page for Classic
  const steps = stepsFor(settings)
  const index = steps.findIndex((s) => s.id === id)
  if (index < 0) return <Redirect href="/" />

  const step = steps[index]
  const choices = choicesFor(step, settings)
  const anySelected = choices.some((choice) => isSelected(choice, settings))
  const next = () => router.push(index + 1 < steps.length ? `/setup/${steps[index + 1].id}` : '/ready')
  // after a reload (web) there is no history: go to the previous step, or home from the first
  const back = () => {
    if (router.canGoBack()) router.back()
    else router.replace(index > 0 ? `/setup/${steps[index - 1].id}` : '/')
  }

  return (
    <WizardPage
      name={step.name}
      index={index}
      count={steps.length + 1}
      title={step.title}
      subtitle={subtitleText(step, settings)}
      footer={
        <>
          <Button title="Back" onPress={back} />
          <Button title="Next" primary onPress={next} />
        </>
      }
    >
      {step.text ? (
        <TextInputRow
          label={step.text.label}
          placeholder={step.text.placeholder}
          maxLength={step.text.maxLength}
          value={settings[step.text.setting]}
          onChange={(value) => update({ [step.text!.setting]: value })}
          onSubmit={next}
        />
      ) : (
        <List label={step.name}>
          {choices.map((choice, i) => (
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
      )}
    </WizardPage>
  )
}
