import type { Strings } from './en'

const hi: Strings = {
  home: {
    tagline: 'आधी रात, बार-बार।',
    fromTo: (from, to) => `${from} से ${to} तक`,
    start: 'शुरू करें',
    newSetup: 'नया सेटअप',
    setUp: 'घड़ी सेट करें',
  },
  wizard: {
    back: 'पीछे',
    next: 'आगे',
    stepOf: (step, count) => `चरण ${step} / ${count}`,
  },
  ready: {
    title: 'तैयार',
    subtitle: 'फ़ोन रखें, फिर शुरू करें पर टैप करें। यहाँ लौटने के लिए घड़ी पर दो बार टैप करें।',
    mayDim: 'इस ब्राउज़र में स्क्रीन बंद हो सकती है; उसे चालू रखने के लिए ऑटो-लॉक बंद करें।',
    start: 'शुरू करें',
    change: (name) => `${name} बदलें`,
  },
  clock: {
    title: 'घड़ी',
    back: 'वापस। वापस जाने के लिए दो बार टैप करें।',
    goBack: 'वापस जाएँ',
    tapAgain: 'वापस जाने के लिए फिर से टैप करें',
  },
  seconds: (n) => `${n} सेकंड`,
  format: {
    name: 'फ़ॉर्मैट',
    title: '24 घंटे या AM/PM?',
    hour24: '24 घंटे',
    hour12: '12 घंटे',
  },
  style: {
    name: 'स्टाइल',
    title: 'स्टाइल चुनें',
    simple: 'सादा',
    simpleHint: 'पतले सफ़ेद अंक',
    flip: 'फ़्लिप घड़ी',
    flipHint: 'पलटने वाले कार्ड',
  },
  theme: {
    name: 'थीम',
    title: 'थीम चुनें',
    subtitle: 'नए साल की पूर्व संध्या, या किसी भी आधी रात के लिए रंग।',
  },
  themes: {
    classic: { name: 'क्लासिक', hint: 'सफ़ेद अंक, अंगारे जैसी और सफ़ेद चमक' },
    champagne: { name: 'शैम्पेन', hint: 'सुनहरे अंक, सुनहरी चमक' },
    midnight: { name: 'मिडनाइट ब्लू', hint: 'बर्फ़ीले नीले अंक, चाँदी जैसी और नीली चमक' },
    party: { name: 'पार्टी', hint: 'नियॉन अंक, हर रंग की चमक' },
  },
  before: {
    name: 'आधी रात से पहले',
    title: 'आधी रात से कितना पहले?',
    subtitle: 'घड़ी के आधी रात पार करने से पहले तैयार होने का समय।',
    hint: (time) => `${time} पर शुरू`,
  },
  after: {
    name: 'आधी रात के बाद',
    title: 'आधी रात के कितनी देर बाद तक?',
    subtitle: 'फिर घड़ी दोबारा शुरू होती है।',
    hint: (time) => `${time} तक, फिर दोहराएँ`,
  },
  animation: {
    name: 'आधी रात का एनिमेशन',
    title: 'आधी रात का एनिमेशन',
    subtitle: 'हर बार घड़ी के आधी रात पार करने पर, उसके बाद के सेकंडों में चलता है।',
    fireworks: 'आतिशबाज़ी',
    fireworksHint: (time) => `${time} पर रॉकेट उड़ते हैं`,
    confetti: 'कॉन्फ़ेटी',
    confettiHint: (time) => `${time} पर कॉन्फ़ेटी उड़ती है`,
    none: 'कोई नहीं',
    noneHint: 'सिर्फ़ घड़ी',
    noneSummary: 'कोई एनिमेशन नहीं',
  },
}

export default hi
