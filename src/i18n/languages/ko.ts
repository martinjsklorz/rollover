import type { Strings } from './en'

const ko: Strings = {
  home: {
    tagline: '자정을, 몇 번이고 다시.',
    fromTo: (from, to) => `${from}부터 ${to}까지`,
    start: '시작',
    newSetup: '새로 설정',
    setUp: '시계 설정',
  },
  wizard: {
    back: '뒤로',
    next: '다음',
    stepOf: (step, count) => `${count}단계 중 ${step}단계`,
  },
  ready: {
    title: '준비 완료',
    subtitle: '휴대폰을 세워 두고 시작을 탭하세요. 시계를 두 번 탭하면 여기로 돌아옵니다.',
    mayDim: '이 브라우저에서는 화면이 꺼질 수 있습니다. 화면을 켜 두려면 자동 잠금을 끄세요.',
    start: '시작',
    change: (name) => `${name} 변경`,
  },
  clock: {
    title: '시계',
    back: '뒤로. 두 번 탭하면 돌아갑니다.',
    goBack: '돌아가기',
    tapAgain: '한 번 더 탭하면 돌아갑니다',
  },
  seconds: (n) => `${n}초`,
  format: {
    name: '형식',
    title: '24시간제 아니면 AM/PM?',
    hour24: '24시간제',
    hour12: '12시간제',
  },
  style: {
    name: '스타일',
    title: '스타일 선택',
    simple: '심플',
    simpleHint: '가는 흰색 숫자',
    flip: '플립 시계',
    flipHint: '넘어가는 플랩 카드',
  },
  theme: {
    name: '테마',
    title: '테마 선택',
    subtitle: '새해 전야, 또는 어떤 자정에도 어울리는 색.',
  },
  themes: {
    classic: { name: '클래식', hint: '흰색 숫자, 불씨색과 흰색 불꽃' },
    champagne: { name: '샴페인', hint: '금색 숫자, 금빛 불꽃' },
    midnight: { name: '미드나잇 블루', hint: '아이스 블루 숫자, 은색과 파란색 불꽃' },
    party: { name: '파티', hint: '네온 숫자, 온갖 색의 불꽃' },
  },
  before: {
    name: '자정 전',
    title: '자정 몇 초 전부터?',
    subtitle: '시계가 자정을 넘기기 전 준비할 시간입니다.',
    hint: (time) => `${time}에 시작`,
  },
  after: {
    name: '자정 후',
    title: '자정 몇 초 후까지?',
    subtitle: '그다음 시계가 처음부터 다시 시작합니다.',
    hint: (time) => `${time}까지, 그다음 반복`,
  },
  animation: {
    name: '자정 애니메이션',
    title: '자정 애니메이션',
    subtitle: '시계가 자정을 넘길 때마다 그 후 몇 초 동안 재생됩니다.',
    fireworks: '불꽃놀이',
    fireworksHint: (time) => `${time}에 폭죽이 올라갑니다`,
    confetti: '색종이',
    confettiHint: (time) => `${time}에 색종이가 터집니다`,
    none: '없음',
    noneHint: '시계만',
    noneSummary: '애니메이션 없음',
  },
}

export default ko
