import type { Strings } from './en'

const ja: Strings = {
  home: {
    tagline: '真夜中を、何度でも。',
    fromTo: (from, to) => `${from}から${to}まで`,
    start: 'スタート',
    newSetup: '新しく設定',
    setUp: '時計を設定',
  },
  wizard: {
    back: '戻る',
    next: '次へ',
    stepOf: (step, count) => `ステップ ${step}/${count}`,
  },
  ready: {
    title: '準備完了',
    subtitle: 'スマートフォンを置いて、スタートをタップしてください。時計を2回タップするとここに戻ります。',
    mayDim: 'このブラウザでは画面が暗くなることがあります。画面をつけたままにするには自動ロックをオフにしてください。',
    start: 'スタート',
    change: (name) => `${name}を変更`,
  },
  clock: {
    title: '時計',
    back: '戻る。2回タップすると戻ります。',
    goBack: '戻る',
    tapAgain: 'もう一度タップすると戻ります',
  },
  seconds: (n) => `${n}秒`,
  format: {
    name: '表示形式',
    title: '24時間制？ それとも AM/PM？',
    hour24: '24時間制',
    hour12: '12時間制',
  },
  style: {
    name: 'スタイル',
    title: 'スタイルを選択',
    simple: 'シンプル',
    simpleHint: '細い白の数字',
    flip: 'パタパタ時計',
    flipHint: 'めくれるフラップ',
  },
  theme: {
    name: 'テーマ',
    title: 'テーマを選択',
    subtitle: '大晦日にも、どんな真夜中にも合う色。',
  },
  themes: {
    classic: { name: 'クラシック', hint: '白い数字、残り火色と白のきらめき' },
    champagne: { name: 'シャンパン', hint: '金色の数字、金色のきらめき' },
    midnight: { name: 'ミッドナイトブルー', hint: 'アイスブルーの数字、銀と青のきらめき' },
    party: { name: 'パーティー', hint: 'ネオンの数字、色とりどりのきらめき' },
  },
  before: {
    name: '0時前',
    title: '0時の何秒前から？',
    subtitle: '時計が0時を回るまでの準備時間です。',
    hint: (time) => `${time}に開始`,
  },
  after: {
    name: '0時後',
    title: '0時の何秒後まで？',
    subtitle: 'そのあと時計は最初に戻ります。',
    hint: (time) => `${time}まで、その後くり返し`,
  },
  animation: {
    name: '0時のアニメーション',
    title: '0時のアニメーション',
    subtitle: '時計が0時を回るたびに、その後の数秒間に再生されます。',
    fireworks: '花火',
    fireworksHint: (time) => `${time}に花火が上がります`,
    confetti: '紙吹雪',
    confettiHint: (time) => `${time}に紙吹雪が舞います`,
    none: 'なし',
    noneHint: '時計だけ',
    noneSummary: 'アニメーションなし',
  },
}

export default ja
