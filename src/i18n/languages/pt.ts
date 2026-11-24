import type { Strings } from './en'

/** Brazilian Portuguese, the variant most speakers use; also shown for pt-PT. */
/** The Chinese zodiac’s animals */
const zodiac: Record<keyof Strings['zodiac'], string> = {
  rat: 'Rato',
  ox: 'Boi',
  tiger: 'Tigre',
  rabbit: 'Coelho',
  dragon: 'Dragão',
  snake: 'Serpente',
  horse: 'Cavalo',
  goat: 'Cabra',
  monkey: 'Macaco',
  rooster: 'Galo',
  dog: 'Cão',
  pig: 'Porco',
}

/** With the article: Ano do Cavalo, Ano da Cabra */
const ofThe: Record<keyof Strings['zodiac'], string> = {
  rat: 'do Rato',
  ox: 'do Boi',
  tiger: 'do Tigre',
  rabbit: 'do Coelho',
  dragon: 'do Dragão',
  snake: 'da Serpente',
  horse: 'do Cavalo',
  goat: 'da Cabra',
  monkey: 'do Macaco',
  rooster: 'do Galo',
  dog: 'do Cão',
  pig: 'do Porco',
}

const pt: Strings = {
  home: {
    tagline: 'Meia-noite, de novo e de novo.',
    fromTo: (from, to) => `de ${from} a ${to}`,
    start: 'Iniciar',
    newSetup: 'Nova configuração',
    setUp: 'Configurar o relógio',
  },
  wizard: {
    back: 'Voltar',
    next: 'Avançar',
    stepOf: (step, count) => `Etapa ${step} de ${count}`,
  },
  ready: {
    title: 'Pronto',
    subtitle: 'Posicione o celular e toque em Iniciar. Toque duas vezes no relógio para voltar aqui.',
    mayDim: 'Este navegador pode deixar a tela apagar; desative o bloqueio automático para mantê-la acesa.',
    subtitleTV: 'Pressione Iniciar. Pressione Voltar no controle remoto para voltar aqui.',
    start: 'Iniciar',
    change: (name) => `Alterar ${name.toLowerCase()}`,
  },
  clock: {
    title: 'Relógio',
    back: 'Voltar. Toque duas vezes para voltar.',
    goBack: 'Voltar',
    backTV: 'Voltar. Pressione duas vezes para voltar.',
    tapAgain: 'Toque de novo para voltar',
    pressAgain: 'Pressione de novo para voltar',
    birthday: 'Feliz aniversário!',
    birthdayName: (name) => `Feliz aniversário, ${name}!`,
    lunarNewYear: (animal) => `Feliz Ano ${ofThe[animal]}!`,
  },
  zodiac,
  seconds: (n) => `${n} segundos`,
  occasion: {
    name: 'Ocasião',
    title: 'Qual é a ocasião?',
    subtitle: 'Ela define as cores e a animação da meia-noite.',
  },
  occasions: {
    classic: { name: 'Clássico', hint: 'Qualquer meia-noite, branco e brasa' },
    newyear: { name: 'Réveillon', hint: 'Dourado, azul-gelo ou neon' },
    birthday: { name: 'Aniversário', hint: 'Cores de bala, balões e um nome' },
    lunar: { name: 'Ano-Novo Lunar', hint: 'Vermelho e dourado, lanternas e zodíaco' },
  },
  name: {
    name: 'Nome',
    title: 'Aniversário de quem?',
    subtitle: 'Aparece abaixo do relógio à meia-noite. Deixe em branco para só “Feliz aniversário!”',
    label: 'Nome',
    placeholder: 'Nome da pessoa',
    none: 'Sem nome',
  },
  format: {
    name: 'Formato',
    title: '24 horas ou AM/PM?',
    hour24: '24 horas',
    hour12: '12 horas',
  },
  style: {
    name: 'Estilo',
    title: 'Escolha um estilo',
    simple: 'Simples',
    simpleHint: 'Dígitos brancos finos',
    flip: 'Relógio flip',
    flipHint: 'Cartões que viram',
  },
  theme: {
    name: 'Tema',
    title: 'Escolha um tema',
    subtitle: {
      newyear: 'Cores para o Réveillon.',
      birthday: 'Cores para o aniversário.',
      lunar: 'Cores para o Ano-Novo Lunar.',
    },
  },
  themes: {
    classic: { name: 'Clássico', hint: 'Dígitos brancos, faíscas cor de brasa e brancas' },
    champagne: { name: 'Champanhe', hint: 'Dígitos dourados, faíscas douradas' },
    midnight: { name: 'Azul meia-noite', hint: 'Dígitos azul-gelo, faíscas prateadas e azuis' },
    party: { name: 'Festa', hint: 'Dígitos neon, faíscas de todas as cores' },
    bubblegum: { name: 'Chiclete', hint: 'Dígitos rosa; rosa, lilás e dourado' },
    sky: { name: 'Céu', hint: 'Dígitos azuis; azul, menta e limão' },
    sprinkles: { name: 'Granulado', hint: 'Dígitos brancos; todos os tons pastel' },
    lantern: { name: 'Lanterna', hint: 'Dígitos vermelhos; vermelho, dourado e branco quente' },
    gilded: { name: 'Dourado', hint: 'Dígitos dourados; vermelho e dourado' },
    plum: { name: 'Flor de ameixeira', hint: 'Dígitos rosa; rosa, branco e dourado' },
  },
  before: {
    name: 'Antes da meia-noite',
    title: 'Quanto tempo antes da meia-noite?',
    subtitle: 'Tempo para se preparar antes de o relógio virar.',
    hint: (time) => `Começa às ${time}`,
  },
  after: {
    name: 'Depois da meia-noite',
    title: 'Quanto tempo depois da meia-noite?',
    subtitle: 'Depois o relógio recomeça.',
    hint: (time) => `Até ${time}, depois se repete`,
  },
  animation: {
    name: 'Animação da meia-noite',
    title: 'Animação da meia-noite',
    subtitle: 'Ela aparece nos segundos depois da meia-noite, toda vez que o relógio vira.',
    balloons: 'Balões',
    balloonsHint: (time) => `Os balões sobem às ${time}`,
    lanterns: 'Lanternas',
    lanternsHint: (time) => `As lanternas sobem às ${time}`,
    fireworks: 'Fogos de artifício',
    fireworksHint: (time) => `Os fogos sobem às ${time}`,
    confetti: 'Confete',
    confettiHint: (time) => `O confete estoura às ${time}`,
    none: 'Nenhuma',
    noneHint: 'Só o relógio',
    noneSummary: 'Sem animação',
  },
}

export default pt
