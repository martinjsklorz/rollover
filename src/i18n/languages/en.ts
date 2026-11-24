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
    /** the subtitle on a TV, driven by a remote */
    subtitleTV: 'Press Start. Press Back on the remote to come back here.',
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
    /** on a TV, before the first press */
    backTV: 'Back. Press twice to go back.',
    tapAgain: 'Tap again to go back',
    /** on a TV, after the first press */
    pressAgain: 'Press again to go back',
    /** birthday greeting under the digits at midnight, without and with a name */
    birthday: 'Happy birthday!',
    birthdayName: (name: string) => `Happy birthday, ${name}!`,
  },
  seconds: (n: number) => `${n} seconds`,
  occasion: {
    name: 'Occasion',
    title: "What's the occasion?",
    subtitle: 'It sets the colors and the midnight animation.',
  },
  occasions: {
    classic: { name: 'Classic', hint: 'Any midnight, white and ember' },
    newyear: { name: "New Year's Eve", hint: 'Gold, ice blue or neon' },
    birthday: { name: 'Birthday', hint: 'Candy colors, balloons and a name' },
  },
  /** the birthday's name page */
  name: {
    name: 'Name',
    title: 'Whose birthday?',
    subtitle: 'Shown under the clock at midnight. Leave it empty for just “Happy birthday!”',
    /** names the text field for screen readers */
    label: 'Name',
    placeholder: 'Their name',
    /** on the summary page when it was left empty */
    none: 'No name',
  },
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
    /** by occasion; Classic has a single theme, so no theme page */
    subtitle: { newyear: "Colors for New Year's Eve.", birthday: 'Colors for the birthday.' },
  },
  themes: {
    classic: { name: 'Classic', hint: 'White digits, ember and white sparkle' },
    champagne: { name: 'Champagne', hint: 'Gold digits, golden sparkle' },
    midnight: { name: 'Midnight blue', hint: 'Ice-blue digits, silver and blue sparkle' },
    party: { name: 'Party', hint: 'Neon digits, sparkle in every color' },
    bubblegum: { name: 'Bubblegum', hint: 'Pink digits; pink, lilac and gold' },
    sky: { name: 'Sky', hint: 'Blue digits; blue, mint and lemon' },
    sprinkles: { name: 'Sprinkles', hint: 'White digits; every pastel' },
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
    balloons: 'Balloons',
    balloonsHint: (time: string) => `Balloons float up at ${time}`,
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
