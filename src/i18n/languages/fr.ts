import type { Strings } from './en'

const fr: Strings = {
  home: {
    tagline: 'Minuit, encore et encore.',
    fromTo: (from, to) => `de ${from} à ${to}`,
    start: 'Démarrer',
    newSetup: 'Nouveau réglage',
    setUp: 'Régler l’horloge',
  },
  wizard: {
    back: 'Retour',
    next: 'Suivant',
    stepOf: (step, count) => `Étape ${step} sur ${count}`,
  },
  ready: {
    title: 'Prêt',
    subtitle: 'Posez votre téléphone, puis touchez Démarrer. Touchez l’horloge deux fois pour revenir ici.',
    mayDim: 'Ce navigateur peut laisser l’écran s’éteindre ; désactivez le verrouillage automatique pour le garder allumé.',
    start: 'Démarrer',
    change: (name) => `Modifier : ${name.toLowerCase()}`,
  },
  clock: {
    title: 'Horloge',
    back: 'Retour. Touchez deux fois pour revenir.',
    goBack: 'Revenir',
    tapAgain: 'Touchez encore pour revenir',
  },
  seconds: (n) => `${n} secondes`,
  format: {
    name: 'Format',
    title: '24 heures ou AM/PM ?',
    hour24: '24 heures',
    hour12: '12 heures',
  },
  style: {
    name: 'Style',
    title: 'Choisissez un style',
    simple: 'Simple',
    simpleHint: 'Chiffres blancs fins',
    flip: 'Horloge à palettes',
    flipHint: 'Cartes à volets',
  },
  theme: {
    name: 'Thème',
    title: 'Choisissez un thème',
    subtitle: 'Des couleurs pour la Saint-Sylvestre, ou n’importe quel minuit.',
  },
  themes: {
    classic: { name: 'Classique', hint: 'Chiffres blancs, étincelles braise et blanches' },
    champagne: { name: 'Champagne', hint: 'Chiffres dorés, étincelles dorées' },
    midnight: { name: 'Bleu nuit', hint: 'Chiffres bleu glacier, étincelles argent et bleues' },
    party: { name: 'Fête', hint: 'Chiffres néon, étincelles de toutes les couleurs' },
  },
  before: {
    name: 'Avant minuit',
    title: 'Combien de temps avant minuit ?',
    subtitle: 'Le temps de se préparer avant que l’horloge ne passe minuit.',
    hint: (time) => `Commence à ${time}`,
  },
  after: {
    name: 'Après minuit',
    title: 'Combien de temps après minuit ?',
    subtitle: 'Ensuite, l’horloge recommence.',
    hint: (time) => `Jusqu’à ${time}, puis recommence`,
  },
  animation: {
    name: 'Animation de minuit',
    title: 'Animation de minuit',
    subtitle: 'Elle se joue dans les secondes après minuit, chaque fois que l’horloge passe minuit.',
    fireworks: 'Feu d’artifice',
    fireworksHint: (time) => `Les fusées partent à ${time}`,
    confetti: 'Confettis',
    confettiHint: (time) => `Les confettis éclatent à ${time}`,
    none: 'Aucune',
    noneHint: 'Juste l’horloge',
    noneSummary: 'Pas d’animation',
  },
}

export default fr
