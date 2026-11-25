import { useCallback } from 'react'
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSettings } from '../../settings'
import { useStrings } from '../../i18n'
import { stopTune } from '../../sound'
import { choicesFor, hintText, isSelected, stepsFor, subtitleText, useSteps } from '../../wizard/steps'
import { Button, List, OptionRow, TextInputRow, WizardPage } from '../../wizard/ui'

/** One wizard page per setting, defined in src/wizard/steps.ts. */
export default function SetupStep() {
  const { step: id } = useLocalSearchParams<{ step: string }>()
  const { settings, update } = useSettings()
  const t = useStrings()
  // the pages depend on the occasion: the name page for a birthday, the message page and no theme page for Classic
  const steps = stepsFor(useSteps(), settings)
  // leaving the page ends the sound page's sample
  useFocusEffect(useCallback(() => () => stopTune(), []))
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
          <Button title={t.wizard.back} onPress={back} />
          <Button title={t.wizard.next} primary onPress={next} />
        </>
      }
    >
      {step.text ? (
        <TextInputRow
          label={step.text.label}
          placeholder={step.text.placeholder}
          maxLength={step.text.maxLength}
          autoCapitalize={step.text.autoCapitalize}
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
              onPress={() => {
                update(choice.value)
                choice.onPress?.({ ...settings, ...choice.value })
              }}
            />
          ))}
        </List>
      )}
    </WizardPage>
  )
}
