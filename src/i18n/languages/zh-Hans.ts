import type { Strings } from './en'

const zhHans: Strings = {
  home: {
    tagline: '午夜，一次又一次。',
    fromTo: (from, to) => `从 ${from} 到 ${to}`,
    start: '开始',
    newSetup: '重新设置',
    setUp: '设置时钟',
  },
  wizard: {
    back: '返回',
    next: '下一步',
    stepOf: (step, count) => `第 ${step} 步，共 ${count} 步`,
  },
  ready: {
    title: '准备就绪',
    subtitle: '放好手机，然后轻点“开始”。轻点时钟两次即可回到这里。',
    mayDim: '此浏览器可能会让屏幕变暗；关闭自动锁定可保持屏幕常亮。',
    start: '开始',
    change: (name) => `更改${name}`,
  },
  clock: {
    title: '时钟',
    back: '返回。轻点两次即可返回。',
    goBack: '返回',
    tapAgain: '再轻点一次即可返回',
  },
  seconds: (n) => `${n} 秒`,
  format: {
    name: '格式',
    title: '24 小时制还是 AM/PM？',
    hour24: '24 小时制',
    hour12: '12 小时制',
  },
  style: {
    name: '样式',
    title: '选择样式',
    simple: '简约',
    simpleHint: '纤细的白色数字',
    flip: '翻页时钟',
    flipHint: '翻转卡片',
  },
  theme: {
    name: '主题',
    title: '选择主题',
    subtitle: '适合跨年夜，或任何一个午夜的配色。',
  },
  themes: {
    classic: { name: '经典', hint: '白色数字，余烬色与白色火花' },
    champagne: { name: '香槟', hint: '金色数字，金色火花' },
    midnight: { name: '午夜蓝', hint: '冰蓝色数字，银色与蓝色火花' },
    party: { name: '派对', hint: '霓虹数字，五彩缤纷的火花' },
  },
  before: {
    name: '午夜前',
    title: '午夜前多久开始？',
    subtitle: '在时钟跨过午夜之前做好准备的时间。',
    hint: (time) => `从 ${time} 开始`,
  },
  after: {
    name: '午夜后',
    title: '午夜后持续多久？',
    subtitle: '之后时钟重新开始。',
    hint: (time) => `到 ${time}，然后重复`,
  },
  animation: {
    name: '午夜动画',
    title: '午夜动画',
    subtitle: '每次时钟跨过午夜，都会在之后的几秒内播放。',
    fireworks: '烟花',
    fireworksHint: (time) => `${time} 烟花升空`,
    confetti: '彩纸',
    confettiHint: (time) => `${time} 彩纸飞舞`,
    none: '无',
    noneHint: '只显示时钟',
    noneSummary: '无动画',
  },
}

export default zhHans
