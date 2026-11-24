import type { Strings } from './en'

/** 1, 21, 31 … секунда; 2–4, 22–24 … секунды; otherwise (and 11–14) секунд */
const seconds = (n: number) => {
  const one = n % 10 === 1 && n % 100 !== 11
  const few = n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)
  return `${n} ${one ? 'секунда' : few ? 'секунды' : 'секунд'}`
}

/** The Chinese zodiac’s animals */
const zodiac: Record<keyof Strings['zodiac'], string> = {
  rat: 'Крыса',
  ox: 'Бык',
  tiger: 'Тигр',
  rabbit: 'Кролик',
  dragon: 'Дракон',
  snake: 'Змея',
  horse: 'Лошадь',
  goat: 'Коза',
  monkey: 'Обезьяна',
  rooster: 'Петух',
  dog: 'Собака',
  pig: 'Свинья',
}

/** Genitive: год Лошади, год Козы */
const ofThe: Record<keyof Strings['zodiac'], string> = {
  rat: 'Крысы',
  ox: 'Быка',
  tiger: 'Тигра',
  rabbit: 'Кролика',
  dragon: 'Дракона',
  snake: 'Змеи',
  horse: 'Лошади',
  goat: 'Козы',
  monkey: 'Обезьяны',
  rooster: 'Петуха',
  dog: 'Собаки',
  pig: 'Свиньи',
}

const ru: Strings = {
  home: {
    tagline: 'Полночь, снова и снова.',
    fromTo: (from, to) => `с ${from} до ${to}`,
    start: 'Старт',
    newSetup: 'Новая настройка',
    setUp: 'Настроить часы',
  },
  wizard: {
    back: 'Назад',
    next: 'Далее',
    stepOf: (step, count) => `Шаг ${step} из ${count}`,
  },
  ready: {
    title: 'Готово',
    subtitle: 'Поставьте телефон и нажмите «Старт». Дважды коснитесь часов, чтобы вернуться сюда.',
    mayDim: 'В этом браузере экран может погаснуть; отключите автоблокировку, чтобы он оставался включённым.',
    subtitleTV: 'Нажмите «Старт». Нажмите «Назад» на пульте, чтобы вернуться сюда.',
    start: 'Старт',
    change: (name) => `Изменить: ${name.toLowerCase()}`,
  },
  clock: {
    title: 'Часы',
    back: 'Назад. Коснитесь дважды, чтобы вернуться.',
    goBack: 'Вернуться',
    backTV: 'Назад. Нажмите дважды, чтобы вернуться.',
    tapAgain: 'Коснитесь ещё раз, чтобы вернуться',
    pressAgain: 'Нажмите ещё раз, чтобы вернуться',
    birthday: 'С днём рождения!',
    birthdayName: (name) => `С днём рождения, ${name}!`,
    lunarNewYear: (animal) => `С Новым годом ${ofThe[animal]}!`,
  },
  zodiac,
  seconds,
  occasion: {
    name: 'Повод',
    title: 'Какой повод?',
    subtitle: 'От него зависят цвета и анимация в полночь.',
  },
  occasions: {
    classic: { name: 'Классика', hint: 'Любая полночь, белый и огненный' },
    newyear: { name: 'Новый год', hint: 'Золото, ледяной голубой или неон' },
    birthday: { name: 'День рождения', hint: 'Карамельные цвета, шарики и имя' },
    lunar: { name: 'Лунный Новый год', hint: 'Красный и золотой, фонарики и зодиак' },
  },
  name: {
    name: 'Имя',
    title: 'Чей день рождения?',
    subtitle: 'Появится под часами в полночь. Оставьте пустым, чтобы было просто «С днём рождения!»',
    label: 'Имя',
    placeholder: 'Имя именинника',
    none: 'Без имени',
  },
  format: {
    name: 'Формат',
    title: '24 часа или AM/PM?',
    hour24: '24 часа',
    hour12: '12 часов',
  },
  style: {
    name: 'Стиль',
    title: 'Выберите стиль',
    simple: 'Простой',
    simpleHint: 'Тонкие белые цифры',
    flip: 'Перекидные часы',
    flipHint: 'Перекидные карточки',
  },
  theme: {
    name: 'Тема',
    title: 'Выберите тему',
    subtitle: {
      newyear: 'Цвета для Нового года.',
      birthday: 'Цвета для дня рождения.',
      lunar: 'Цвета для Лунного Нового года.',
    },
  },
  themes: {
    classic: { name: 'Классика', hint: 'Белые цифры, огненные и белые искры' },
    champagne: { name: 'Шампанское', hint: 'Золотые цифры, золотые искры' },
    midnight: { name: 'Полночная синева', hint: 'Ледяные голубые цифры, серебряные и синие искры' },
    party: { name: 'Вечеринка', hint: 'Неоновые цифры, искры всех цветов' },
    bubblegum: { name: 'Жвачка', hint: 'Розовые цифры; розовый, сиреневый и золотой' },
    sky: { name: 'Небо', hint: 'Голубые цифры; голубой, мятный и лимонный' },
    sprinkles: { name: 'Посыпка', hint: 'Белые цифры; все пастельные' },
    lantern: { name: 'Фонарь', hint: 'Красные цифры; красный, золотой и тёплый белый' },
    gilded: { name: 'Позолота', hint: 'Золотые цифры; красный и золотой' },
    plum: { name: 'Цветы сливы', hint: 'Розовые цифры; розовый, белый и золотой' },
  },
  before: {
    name: 'До полуночи',
    title: 'Сколько до полуночи?',
    subtitle: 'Время подготовиться, пока часы не перешли через полночь.',
    hint: (time) => `Начало в ${time}`,
  },
  after: {
    name: 'После полуночи',
    title: 'Сколько после полуночи?',
    subtitle: 'Затем часы начинают сначала.',
    hint: (time) => `До ${time}, затем повтор`,
  },
  animation: {
    name: 'Анимация в полночь',
    title: 'Анимация в полночь',
    subtitle: 'Она играет в первые секунды после полуночи, каждый раз, когда часы переходят через полночь.',
    balloons: 'Шарики',
    balloonsHint: (time) => `Шарики взлетают в ${time}`,
    lanterns: 'Фонарики',
    lanternsHint: (time) => `Фонарики взлетают в ${time}`,
    fireworks: 'Фейерверк',
    fireworksHint: (time) => `Ракеты взлетают в ${time}`,
    confetti: 'Конфетти',
    confettiHint: (time) => `Конфетти взрывается в ${time}`,
    none: 'Нет',
    noneHint: 'Только часы',
    noneSummary: 'Без анимации',
  },
}

export default ru
