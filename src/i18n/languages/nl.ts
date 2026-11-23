import type { Strings } from './en'

const nl: Strings = {
  home: {
    tagline: 'Middernacht, steeds weer opnieuw.',
    fromTo: (from, to) => `van ${from} tot ${to}`,
    start: 'Start',
    newSetup: 'Opnieuw instellen',
    setUp: 'Klok instellen',
  },
  wizard: {
    back: 'Terug',
    next: 'Volgende',
    stepOf: (step, count) => `Stap ${step} van ${count}`,
  },
  ready: {
    title: 'Klaar',
    subtitle: 'Zet je telefoon neer en tik op Start. Tik twee keer op de klok om hier terug te komen.',
    mayDim: 'In deze browser kan het scherm donker worden; zet automatisch vergrendelen uit om het aan te houden.',
    start: 'Start',
    change: (name) => `${name} wijzigen`,
  },
  clock: {
    title: 'Klok',
    back: 'Terug. Tik twee keer om terug te gaan.',
    goBack: 'Ga terug',
    tapAgain: 'Tik nog een keer om terug te gaan',
  },
  seconds: (n) => `${n} seconden`,
  format: {
    name: 'Notatie',
    title: '24-uurs of AM/PM?',
    hour24: '24-uurs',
    hour12: '12-uurs',
  },
  style: {
    name: 'Stijl',
    title: 'Kies een stijl',
    simple: 'Eenvoudig',
    simpleHint: 'Dunne witte cijfers',
    flip: 'Klapklok',
    flipHint: 'Klapbordkaartjes',
  },
  theme: {
    name: 'Thema',
    title: 'Kies een thema',
    subtitle: 'Kleuren voor oudejaarsavond, of elke middernacht.',
  },
  themes: {
    classic: { name: 'Klassiek', hint: 'Witte cijfers, gloeiende en witte vonken' },
    champagne: { name: 'Champagne', hint: 'Gouden cijfers, gouden vonken' },
    midnight: { name: 'Middernachtblauw', hint: 'IJsblauwe cijfers, zilveren en blauwe vonken' },
    party: { name: 'Feest', hint: 'Neoncijfers, vonken in alle kleuren' },
  },
  before: {
    name: 'Voor middernacht',
    title: 'Hoe lang voor middernacht?',
    subtitle: 'Tijd om je klaar te maken voordat de klok omslaat.',
    hint: (time) => `Begint om ${time}`,
  },
  after: {
    name: 'Na middernacht',
    title: 'Hoe lang na middernacht?',
    subtitle: 'Daarna begint de klok opnieuw.',
    hint: (time) => `Tot ${time}, daarna opnieuw`,
  },
  animation: {
    name: 'Middernachtanimatie',
    title: 'Middernachtanimatie',
    subtitle: 'Die speelt in de seconden na middernacht, elke keer dat de klok omslaat.',
    fireworks: 'Vuurwerk',
    fireworksHint: (time) => `Vuurpijlen gaan om ${time} de lucht in`,
    confetti: 'Confetti',
    confettiHint: (time) => `Confetti knalt om ${time}`,
    none: 'Geen',
    noneHint: 'Alleen de klok',
    noneSummary: 'Geen animatie',
  },
}

export default nl
