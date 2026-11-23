import type { Strings } from './en'

/** Brazilian Portuguese, the variant most speakers use; also shown for pt-PT. */
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
    start: 'Iniciar',
    change: (name) => `Alterar ${name.toLowerCase()}`,
  },
  clock: {
    title: 'Relógio',
    back: 'Voltar. Toque duas vezes para voltar.',
    goBack: 'Voltar',
    tapAgain: 'Toque de novo para voltar',
  },
  seconds: (n) => `${n} segundos`,
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
    subtitle: 'Cores para o Réveillon, ou qualquer meia-noite.',
  },
  themes: {
    classic: { name: 'Clássico', hint: 'Dígitos brancos, faíscas cor de brasa e brancas' },
    champagne: { name: 'Champanhe', hint: 'Dígitos dourados, faíscas douradas' },
    midnight: { name: 'Azul meia-noite', hint: 'Dígitos azul-gelo, faíscas prateadas e azuis' },
    party: { name: 'Festa', hint: 'Dígitos neon, faíscas de todas as cores' },
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
