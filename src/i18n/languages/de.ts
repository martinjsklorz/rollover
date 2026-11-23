import type { Strings } from './en'

const de: Strings = {
  home: {
    tagline: 'Mitternacht, immer und immer wieder.',
    fromTo: (from, to) => `von ${from} bis ${to}`,
    start: 'Start',
    newSetup: 'Neu einrichten',
    setUp: 'Uhr einrichten',
  },
  wizard: {
    back: 'Zurück',
    next: 'Weiter',
    stepOf: (step, count) => `Schritt ${step} von ${count}`,
  },
  ready: {
    title: 'Bereit',
    subtitle: 'Stell dein Handy auf und tippe auf Start. Tippe zweimal auf die Uhr, um hierher zurückzukommen.',
    mayDim: 'In diesem Browser kann der Bildschirm dunkel werden; schalte die automatische Sperre aus, damit er an bleibt.',
    start: 'Start',
    change: (name) => `${name} ändern`,
  },
  clock: {
    title: 'Uhr',
    back: 'Zurück. Zweimal tippen, um zurückzugehen.',
    goBack: 'Zurückgehen',
    tapAgain: 'Noch einmal tippen, um zurückzugehen',
  },
  seconds: (n) => `${n} Sekunden`,
  format: {
    name: 'Format',
    title: '24 Stunden oder AM/PM?',
    hour24: '24 Stunden',
    hour12: '12 Stunden',
  },
  style: {
    name: 'Stil',
    title: 'Wähle einen Stil',
    simple: 'Schlicht',
    simpleHint: 'Dünne weiße Ziffern',
    flip: 'Klappzahlen',
    flipHint: 'Fallblatt-Karten',
  },
  theme: {
    name: 'Farbe',
    title: 'Wähle ein Farbschema',
    subtitle: 'Farben für Silvester oder jede andere Mitternacht.',
  },
  themes: {
    classic: { name: 'Klassisch', hint: 'Weiße Ziffern, glutroter und weißer Funkenregen' },
    champagne: { name: 'Champagner', hint: 'Goldene Ziffern, goldener Funkenregen' },
    midnight: { name: 'Mitternachtsblau', hint: 'Eisblaue Ziffern, silberner und blauer Funkenregen' },
    party: { name: 'Party', hint: 'Neonziffern, Funken in allen Farben' },
  },
  before: {
    name: 'Vor Mitternacht',
    title: 'Wie lange vor Mitternacht?',
    subtitle: 'Zeit, sich bereit zu machen, bevor die Uhr umspringt.',
    hint: (time) => `Beginnt um ${time}`,
  },
  after: {
    name: 'Nach Mitternacht',
    title: 'Wie lange nach Mitternacht?',
    subtitle: 'Dann beginnt die Uhr von vorn.',
    hint: (time) => `Bis ${time}, dann von vorn`,
  },
  animation: {
    name: 'Mitternachtsanimation',
    title: 'Mitternachtsanimation',
    subtitle: 'Sie läuft in den Sekunden nach Mitternacht, jedes Mal, wenn die Uhr umspringt.',
    fireworks: 'Feuerwerk',
    fireworksHint: (time) => `Raketen steigen um ${time}`,
    confetti: 'Konfetti',
    confettiHint: (time) => `Konfetti fliegt um ${time}`,
    none: 'Keine',
    noneHint: 'Nur die Uhr',
    noneSummary: 'Keine Animation',
  },
}

export default de
