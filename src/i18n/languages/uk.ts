import type { Strings } from './en'

/** 1, 21, 31 … секунда; 2–4, 22–24 … секунди; otherwise (and 11–14) секунд */
const seconds = (n: number) => {
  const one = n % 10 === 1 && n % 100 !== 11
  const few = n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)
  return `${n} ${one ? 'секунда' : few ? 'секунди' : 'секунд'}`
}

/** The Chinese zodiac’s animals */
const zodiac: Record<keyof Strings['zodiac'], string> = {
  rat: 'Щур',
  ox: 'Бик',
  tiger: 'Тигр',
  rabbit: 'Кролик',
  dragon: 'Дракон',
  snake: 'Змія',
  horse: 'Кінь',
  goat: 'Коза',
  monkey: 'Мавпа',
  rooster: 'Півень',
  dog: 'Собака',
  pig: 'Свиня',
}

/** Genitive: рік Коня, рік Кози */
const ofThe: Record<keyof Strings['zodiac'], string> = {
  rat: 'Щура',
  ox: 'Бика',
  tiger: 'Тигра',
  rabbit: 'Кролика',
  dragon: 'Дракона',
  snake: 'Змії',
  horse: 'Коня',
  goat: 'Кози',
  monkey: 'Мавпи',
  rooster: 'Півня',
  dog: 'Собаки',
  pig: 'Свині',
}

const uk: Strings = {
  home: {
    tagline: 'Північ, знову і знову.',
    fromTo: (from, to) => `з ${from} до ${to}`,
    start: 'Старт',
    newSetup: 'Нове налаштування',
    setUp: 'Налаштувати годинник',
  },
  wizard: {
    back: 'Назад',
    next: 'Далі',
    stepOf: (step, count) => `Крок ${step} з ${count}`,
  },
  ready: {
    title: 'Готово',
    subtitle: 'Поставте телефон і торкніться «Старт». Двічі торкніться годинника, щоб повернутися сюди.',
    mayDim: 'У цьому браузері екран може згаснути; вимкніть автоблокування, щоб він залишався увімкненим.',
    subtitleTV: 'Натисніть «Старт». Натисніть «Назад» на пульті, щоб повернутися сюди.',
    start: 'Старт',
    change: (name) => `Змінити: ${name.toLowerCase()}`,
  },
  clock: {
    title: 'Годинник',
    back: 'Назад. Торкніться двічі, щоб повернутися.',
    goBack: 'Повернутися',
    backTV: 'Назад. Натисніть двічі, щоб повернутися.',
    tapAgain: 'Торкніться ще раз, щоб повернутися',
    pressAgain: 'Натисніть ще раз, щоб повернутися',
    birthday: 'З днем народження!',
    birthdayName: (name) => `З днем народження, ${name}!`,
    lunarNewYear: (animal) => `З Новим роком ${ofThe[animal]}!`,
  },
  zodiac,
  seconds,
  occasion: {
    name: 'Привід',
    title: 'Який привід?',
    subtitle: 'Від нього залежать кольори й анімація опівночі.',
  },
  occasions: {
    classic: { name: 'Класика', hint: 'Будь-яка північ, білий і вогняний' },
    newyear: { name: 'Новий рік', hint: 'Золото, крижана блакить або неон' },
    birthday: { name: 'День народження', hint: 'Цукеркові кольори, кульки та ім’я' },
    lunar: { name: 'Місячний Новий рік', hint: 'Червоний і золотий, ліхтарики та зодіак' },
  },
  name: {
    name: 'Ім’я',
    title: 'Чий день народження?',
    subtitle: 'З’явиться під годинником опівночі. Залиште порожнім, щоб було просто «З днем народження!»',
    label: 'Ім’я',
    placeholder: 'Ім’я іменинника',
    none: 'Без імені',
  },
  format: {
    name: 'Формат',
    title: '24 години чи AM/PM?',
    hour24: '24 години',
    hour12: '12 годин',
  },
  style: {
    name: 'Стиль',
    title: 'Виберіть стиль',
    simple: 'Простий',
    simpleHint: 'Тонкі білі цифри',
    flip: 'Перекидний годинник',
    flipHint: 'Перекидні картки',
  },
  theme: {
    name: 'Тема',
    title: 'Виберіть тему',
    subtitle: {
      newyear: 'Кольори для Нового року.',
      birthday: 'Кольори для дня народження.',
      lunar: 'Кольори для Місячного Нового року.',
    },
  },
  themes: {
    classic: { name: 'Класика', hint: 'Білі цифри, вогняні й білі іскри' },
    champagne: { name: 'Шампанське', hint: 'Золоті цифри, золоті іскри' },
    midnight: { name: 'Опівнічна синь', hint: 'Крижано-блакитні цифри, срібні й сині іскри' },
    party: { name: 'Вечірка', hint: 'Неонові цифри, іскри всіх кольорів' },
    bubblegum: { name: 'Жуйка', hint: 'Рожеві цифри; рожевий, бузковий і золотий' },
    sky: { name: 'Небо', hint: 'Блакитні цифри; блакитний, м’ятний і лимонний' },
    sprinkles: { name: 'Посипка', hint: 'Білі цифри; усі пастельні' },
    lantern: { name: 'Ліхтар', hint: 'Червоні цифри; червоний, золотий і теплий білий' },
    gilded: { name: 'Позолота', hint: 'Золоті цифри; червоний і золотий' },
    plum: { name: 'Цвіт сливи', hint: 'Рожеві цифри; рожевий, білий і золотий' },
  },
  before: {
    name: 'До півночі',
    title: 'Скільки до півночі?',
    subtitle: 'Час підготуватися, поки годинник не перейшов через північ.',
    hint: (time) => `Початок о ${time}`,
  },
  after: {
    name: 'Після півночі',
    title: 'Скільки після півночі?',
    subtitle: 'Потім годинник починає спочатку.',
    hint: (time) => `До ${time}, потім знову`,
  },
  animation: {
    name: 'Анімація опівночі',
    title: 'Анімація опівночі',
    subtitle: 'Вона грає в перші секунди після півночі, щоразу, коли годинник переходить через північ.',
    balloons: 'Кульки',
    balloonsHint: (time) => `Кульки злітають о ${time}`,
    lanterns: 'Ліхтарики',
    lanternsHint: (time) => `Ліхтарики злітають о ${time}`,
    fireworks: 'Феєрверк',
    fireworksHint: (time) => `Ракети злітають о ${time}`,
    confetti: 'Конфеті',
    confettiHint: (time) => `Конфеті вибухає о ${time}`,
    none: 'Немає',
    noneHint: 'Лише годинник',
    noneSummary: 'Без анімації',
  },
}

export default uk
