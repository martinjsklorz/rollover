import type { Strings } from './en'

/** 1 sekunda, 2–4 sekundy (but 12–14 sekund), otherwise sekund */
const seconds = (n: number) => {
  if (n === 1) return '1 sekunda'
  const few = n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)
  return `${n} ${few ? 'sekundy' : 'sekund'}`
}

const pl: Strings = {
  home: {
    tagline: 'Północ, znowu i znowu.',
    fromTo: (from, to) => `od ${from} do ${to}`,
    start: 'Start',
    newSetup: 'Nowe ustawienia',
    setUp: 'Ustaw zegar',
  },
  wizard: {
    back: 'Wstecz',
    next: 'Dalej',
    stepOf: (step, count) => `Krok ${step} z ${count}`,
  },
  ready: {
    title: 'Gotowe',
    subtitle: 'Ustaw telefon, a potem stuknij Start. Stuknij zegar dwa razy, aby tu wrócić.',
    mayDim: 'W tej przeglądarce ekran może się wygasić; wyłącz automatyczną blokadę, aby pozostał włączony.',
    start: 'Start',
    change: (name) => `Zmień: ${name.toLowerCase()}`,
  },
  clock: {
    title: 'Zegar',
    back: 'Wstecz. Stuknij dwa razy, aby wrócić.',
    goBack: 'Wróć',
    tapAgain: 'Stuknij ponownie, aby wrócić',
  },
  seconds,
  format: {
    name: 'Format',
    title: '24-godzinny czy AM/PM?',
    hour24: '24-godzinny',
    hour12: '12-godzinny',
  },
  style: {
    name: 'Styl',
    title: 'Wybierz styl',
    simple: 'Prosty',
    simpleHint: 'Cienkie białe cyfry',
    flip: 'Zegar klapkowy',
    flipHint: 'Obracane klapki',
  },
  theme: {
    name: 'Motyw',
    title: 'Wybierz motyw',
    subtitle: 'Kolory na sylwestra albo każdą inną północ.',
  },
  themes: {
    classic: { name: 'Klasyczny', hint: 'Białe cyfry, żarzące się i białe iskry' },
    champagne: { name: 'Szampan', hint: 'Złote cyfry, złote iskry' },
    midnight: { name: 'Granat nocy', hint: 'Lodowoniebieskie cyfry, srebrne i niebieskie iskry' },
    party: { name: 'Impreza', hint: 'Neonowe cyfry, iskry we wszystkich kolorach' },
  },
  before: {
    name: 'Przed północą',
    title: 'Ile przed północą?',
    subtitle: 'Czas, by się przygotować, zanim zegar przeskoczy.',
    hint: (time) => `Start o ${time}`,
  },
  after: {
    name: 'Po północy',
    title: 'Ile po północy?',
    subtitle: 'Potem zegar zaczyna od nowa.',
    hint: (time) => `Do ${time}, potem od nowa`,
  },
  animation: {
    name: 'Animacja o północy',
    title: 'Animacja o północy',
    subtitle: 'Odtwarza się w sekundach po północy, za każdym razem, gdy zegar przeskoczy.',
    fireworks: 'Fajerwerki',
    fireworksHint: (time) => `Rakiety startują o ${time}`,
    confetti: 'Konfetti',
    confettiHint: (time) => `Konfetti wystrzeliwuje o ${time}`,
    none: 'Brak',
    noneHint: 'Tylko zegar',
    noneSummary: 'Bez animacji',
  },
}

export default pl
