import type { Strings } from './en'

const zhHant: Strings = {
  home: {
    tagline: '午夜，一次又一次。',
    fromTo: (from, to) => `從 ${from} 到 ${to}`,
    start: '開始',
    newSetup: '重新設定',
    setUp: '設定時鐘',
  },
  wizard: {
    back: '返回',
    next: '下一步',
    stepOf: (step, count) => `第 ${step} 步，共 ${count} 步`,
  },
  ready: {
    title: '準備就緒',
    subtitle: '放好手機，然後點一下「開始」。點兩下時鐘即可回到這裡。',
    mayDim: '此瀏覽器可能會讓螢幕變暗；關閉自動鎖定可讓螢幕保持開啟。',
    start: '開始',
    change: (name) => `更改${name}`,
  },
  clock: {
    title: '時鐘',
    back: '返回。點兩下即可返回。',
    goBack: '返回',
    tapAgain: '再點一下即可返回',
  },
  seconds: (n) => `${n} 秒`,
  format: {
    name: '格式',
    title: '24 小時制還是 AM/PM？',
    hour24: '24 小時制',
    hour12: '12 小時制',
  },
  style: {
    name: '樣式',
    title: '選擇樣式',
    simple: '簡約',
    simpleHint: '纖細的白色數字',
    flip: '翻頁時鐘',
    flipHint: '翻轉卡片',
  },
  theme: {
    name: '主題',
    title: '選擇主題',
    subtitle: '適合跨年夜，或任何一個午夜的配色。',
  },
  themes: {
    classic: { name: '經典', hint: '白色數字，餘燼色與白色火花' },
    champagne: { name: '香檳', hint: '金色數字，金色火花' },
    midnight: { name: '午夜藍', hint: '冰藍色數字，銀色與藍色火花' },
    party: { name: '派對', hint: '霓虹數字，五彩繽紛的火花' },
  },
  before: {
    name: '午夜前',
    title: '午夜前多久開始？',
    subtitle: '在時鐘跨過午夜之前做好準備的時間。',
    hint: (time) => `從 ${time} 開始`,
  },
  after: {
    name: '午夜後',
    title: '午夜後持續多久？',
    subtitle: '之後時鐘重新開始。',
    hint: (time) => `到 ${time}，然後重複`,
  },
  animation: {
    name: '午夜動畫',
    title: '午夜動畫',
    subtitle: '每次時鐘跨過午夜，都會在之後的幾秒內播放。',
    fireworks: '煙火',
    fireworksHint: (time) => `${time} 煙火升空`,
    confetti: '彩紙',
    confettiHint: (time) => `${time} 彩紙飛舞`,
    none: '無',
    noneHint: '只顯示時鐘',
    noneSummary: '無動畫',
  },
}

export default zhHant
