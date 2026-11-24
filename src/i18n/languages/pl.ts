import type { Strings } from './en'

/** 1 sekunda, 2–4 sekundy (but 12–14 sekund), otherwise sekund */
const seconds = (n: number) => {
  if (n === 1) return '1 sekunda'
  const few = n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)
  return `${n} ${few ? 'sekundy' : 'sekund'}`
}

/** The Chinese zodiac’s animals */
const zodiac: Record<keyof Strings['zodiac'], string> = {
  rat: 'Szczur',
  ox: 'Bawół',
  tiger: 'Tygrys',
  rabbit: 'Królik',
  dragon: 'Smok',
  snake: 'Wąż',
  horse: 'Koń',
  goat: 'Koza',
  monkey: 'Małpa',
  rooster: 'Kogut',
  dog: 'Pies',
  pig: 'Świnia',
}

/** Genitive: Rok Konia, Rok Kozy */
const ofThe: Record<keyof Strings['zodiac'], string> = {
  rat: 'Szczura',
  ox: 'Bawołu',
  tiger: 'Tygrysa',
  rabbit: 'Królika',
  dragon: 'Smoka',
  snake: 'Węża',
  horse: 'Konia',
  goat: 'Kozy',
  monkey: 'Małpy',
  rooster: 'Koguta',
  dog: 'Psa',
  pig: 'Świni',
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
    subtitleTV: 'Naciśnij Start. Naciśnij Wstecz na pilocie, aby tu wrócić.',
    start: 'Start',
    change: (name) => `Zmień: ${name.toLowerCase()}`,
  },
  clock: {
    title: 'Zegar',
    back: 'Wstecz. Stuknij dwa razy, aby wrócić.',
    goBack: 'Wróć',
    backTV: 'Wstecz. Naciśnij dwa razy, aby wrócić.',
    tapAgain: 'Stuknij ponownie, aby wrócić',
    pressAgain: 'Naciśnij ponownie, aby wrócić',
    birthday: 'Wszystkiego najlepszego!',
    birthdayName: (name) => `Wszystkiego najlepszego, ${name}!`,
    lunarNewYear: (animal) => `Szczęśliwego Roku ${ofThe[animal]}!`,
  },
  zodiac,
  seconds,
  occasion: {
    name: 'Okazja',
    title: 'Jaka to okazja?',
    subtitle: 'Od niej zależą kolory i animacja o północy.',
  },
  occasions: {
    classic: { name: 'Klasyczna', hint: 'Każda północ, biel i żar' },
    newyear: { name: 'Sylwester', hint: 'Złoto, lodowy błękit albo neon' },
    birthday: { name: 'Urodziny', hint: 'Cukierkowe kolory, balony i imię' },
    lunar: { name: 'Księżycowy Nowy Rok', hint: 'Czerwień i złoto, lampiony i zodiak' },
  },
  name: {
    name: 'Imię',
    title: 'Czyje urodziny?',
    subtitle: 'Wyświetla się pod zegarem o północy. Zostaw puste, by było samo „Wszystkiego najlepszego!”',
    label: 'Imię',
    placeholder: 'Wpisz imię',
    none: 'Bez imienia',
  },
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
    subtitle: {
      newyear: 'Kolory na sylwestra.',
      birthday: 'Kolory na urodziny.',
      lunar: 'Kolory na Księżycowy Nowy Rok.',
    },
  },
  themes: {
    classic: { name: 'Klasyczny', hint: 'Białe cyfry, żarzące się i białe iskry' },
    champagne: { name: 'Szampan', hint: 'Złote cyfry, złote iskry' },
    midnight: { name: 'Granat nocy', hint: 'Lodowoniebieskie cyfry, srebrne i niebieskie iskry' },
    party: { name: 'Impreza', hint: 'Neonowe cyfry, iskry we wszystkich kolorach' },
    bubblegum: { name: 'Guma balonowa', hint: 'Różowe cyfry; róż, liliowy i złoto' },
    sky: { name: 'Niebo', hint: 'Niebieskie cyfry; błękit, mięta i cytryna' },
    sprinkles: { name: 'Posypka', hint: 'Białe cyfry; wszystkie pastele' },
    lantern: { name: 'Lampion', hint: 'Czerwone cyfry; czerwień, złoto i ciepła biel' },
    gilded: { name: 'Złocenie', hint: 'Złote cyfry; czerwień i złoto' },
    plum: { name: 'Kwiat śliwy', hint: 'Różowe cyfry; róż, biel i złoto' },
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
    balloons: 'Balony',
    balloonsHint: (time) => `Balony wzlatują o ${time}`,
    lanterns: 'Lampiony',
    lanternsHint: (time) => `Lampiony wzlatują o ${time}`,
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
