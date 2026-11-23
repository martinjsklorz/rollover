/**
 * The English strings: the source every other language translates, and the fallback.
 * Times like "23:59:50" and AM/PM come in already formatted and stay as they are in every language.
 */
const en = {
  home: {
    tagline: 'Midnight, again and again.',
    /** screen reader text for "23:59:50 → 00:00:10" */
    fromTo: (from: string, to: string) => `from ${from} to ${to}`,
    start: 'Start',
    newSetup: 'New setup',
    setUp: 'Set up the clock',
  },
  wizard: {
    back: 'Back',
    next: 'Next',
    stepOf: (step: number, count: number) => `Step ${step} of ${count}`,
  },
  ready: {
    title: 'Ready',
    subtitle: 'Place your phone, then tap Start. Tap the clock twice to come back here.',
    /** added to the subtitle in a browser that can't keep the screen on */
    mayDim: 'This browser may let the screen go dark; turn off auto-lock to keep it on.',
    start: 'Start',
    /** screen reader hint on a row of the summary, e.g. "Change style" */
    change: (name: string) => `Change ${name.toLowerCase()}`,
  },
  clock: {
    /** browser tab title */
    title: 'Clock',
    /** screen reader label before the first tap */
    back: 'Back. Tap twice to go back.',
    /** screen reader label after the first tap */
    goBack: 'Go back',
    tapAgain: 'Tap again to go back',
  },
  seconds: (n: number) => `${n} seconds`,
  format: {
    name: 'Format',
    title: '24-hour or AM/PM?',
    hour24: '24-hour',
    hour12: '12-hour',
  },
  style: {
    name: 'Style',
    title: 'Pick a style',
    simple: 'Simple',
    simpleHint: 'Thin white digits',
    flip: 'Flip clock',
    flipHint: 'Split-flap cards',
  },
  theme: {
    name: 'Theme',
    title: 'Pick a theme',
    subtitle: "Colors for New Year's Eve, or any midnight.",
  },
  themes: {
    classic: { name: 'Classic', hint: 'White digits, ember and white sparkle' },
    champagne: { name: 'Champagne', hint: 'Gold digits, golden sparkle' },
    midnight: { name: 'Midnight blue', hint: 'Ice-blue digits, silver and blue sparkle' },
    party: { name: 'Party', hint: 'Neon digits, sparkle in every color' },
  },
  before: {
    name: 'Before midnight',
    title: 'How long before midnight?',
    subtitle: 'Time to get ready before the clock rolls over.',
    hint: (time: string) => `Starts at ${time}`,
  },
  after: {
    name: 'After midnight',
    title: 'How long after midnight?',
    subtitle: 'Then the clock starts over.',
    hint: (time: string) => `Until ${time}, then repeats`,
  },
  animation: {
    name: 'Midnight animation',
    title: 'Midnight animation',
    subtitle: 'It plays in the seconds after midnight, every time the clock rolls over.',
    fireworks: 'Fireworks',
    fireworksHint: (time: string) => `Rockets go up at ${time}`,
    confetti: 'Confetti',
    confettiHint: (time: string) => `Confetti pops at ${time}`,
    none: 'None',
    noneHint: 'Just the clock',
    /** "None" on the summary page */
    noneSummary: 'No animation',
  },
}

export type Strings = typeof en

export default en
