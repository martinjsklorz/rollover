import type { Strings } from './en'

const es: Strings = {
  home: {
    tagline: 'Medianoche, una y otra vez.',
    fromTo: (from, to) => `de ${from} a ${to}`,
    start: 'Empezar',
    newSetup: 'Nueva configuración',
    setUp: 'Configurar el reloj',
  },
  wizard: {
    back: 'Atrás',
    next: 'Siguiente',
    stepOf: (step, count) => `Paso ${step} de ${count}`,
  },
  ready: {
    title: 'Listo',
    subtitle: 'Coloca el teléfono y toca Empezar. Toca el reloj dos veces para volver aquí.',
    mayDim: 'Este navegador puede apagar la pantalla; desactiva el bloqueo automático para mantenerla encendida.',
    start: 'Empezar',
    change: (name) => `Cambiar ${name.toLowerCase()}`,
  },
  clock: {
    title: 'Reloj',
    back: 'Atrás. Toca dos veces para volver.',
    goBack: 'Volver',
    tapAgain: 'Toca otra vez para volver',
  },
  seconds: (n) => `${n} segundos`,
  format: {
    name: 'Formato',
    title: '¿24 horas o AM/PM?',
    hour24: '24 horas',
    hour12: '12 horas',
  },
  style: {
    name: 'Estilo',
    title: 'Elige un estilo',
    simple: 'Sencillo',
    simpleHint: 'Dígitos blancos finos',
    flip: 'Reloj de paletas',
    flipHint: 'Tarjetas abatibles',
  },
  theme: {
    name: 'Tema',
    title: 'Elige un tema',
    subtitle: 'Colores para Nochevieja o cualquier medianoche.',
  },
  themes: {
    classic: { name: 'Clásico', hint: 'Dígitos blancos, destellos brasa y blancos' },
    champagne: { name: 'Champán', hint: 'Dígitos dorados, destellos dorados' },
    midnight: { name: 'Azul medianoche', hint: 'Dígitos azul hielo, destellos plateados y azules' },
    party: { name: 'Fiesta', hint: 'Dígitos neón, destellos de todos los colores' },
  },
  before: {
    name: 'Antes de medianoche',
    title: '¿Cuánto antes de medianoche?',
    subtitle: 'Tiempo para prepararse antes de que el reloj cambie.',
    hint: (time) => `Empieza a las ${time}`,
  },
  after: {
    name: 'Después de medianoche',
    title: '¿Cuánto después de medianoche?',
    subtitle: 'Luego el reloj vuelve a empezar.',
    hint: (time) => `Hasta las ${time}, luego se repite`,
  },
  animation: {
    name: 'Animación de medianoche',
    title: 'Animación de medianoche',
    subtitle: 'Se reproduce en los segundos después de medianoche, cada vez que el reloj cambia.',
    fireworks: 'Fuegos artificiales',
    fireworksHint: (time) => `Los cohetes suben a las ${time}`,
    confetti: 'Confeti',
    confettiHint: (time) => `El confeti estalla a las ${time}`,
    none: 'Ninguna',
    noneHint: 'Solo el reloj',
    noneSummary: 'Sin animación',
  },
}

export default es
