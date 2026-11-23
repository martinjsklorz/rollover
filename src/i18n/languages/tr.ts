import type { Strings } from './en'

const tr: Strings = {
  home: {
    tagline: 'Gece yarısı, tekrar tekrar.',
    fromTo: (from, to) => `${from} ile ${to} arası`,
    start: 'Başlat',
    newSetup: 'Yeni kurulum',
    setUp: 'Saati kur',
  },
  wizard: {
    back: 'Geri',
    next: 'İleri',
    stepOf: (step, count) => `Adım ${step} / ${count}`,
  },
  ready: {
    title: 'Hazır',
    subtitle: 'Telefonunu yerleştir, sonra Başlat’a dokun. Buraya dönmek için saate iki kez dokun.',
    mayDim: 'Bu tarayıcı ekranı karartabilir; açık kalması için otomatik kilidi kapat.',
    start: 'Başlat',
    change: (name) => `Değiştir: ${name}`,
  },
  clock: {
    title: 'Saat',
    back: 'Geri. Geri dönmek için iki kez dokun.',
    goBack: 'Geri dön',
    tapAgain: 'Geri dönmek için tekrar dokun',
  },
  seconds: (n) => `${n} saniye`,
  format: {
    name: 'Biçim',
    title: '24 saat mi, AM/PM mi?',
    hour24: '24 saat',
    hour12: '12 saat',
  },
  style: {
    name: 'Stil',
    title: 'Bir stil seç',
    simple: 'Sade',
    simpleHint: 'İnce beyaz rakamlar',
    flip: 'Kartlı saat',
    flipHint: 'Dönen kartlar',
  },
  theme: {
    name: 'Tema',
    title: 'Bir tema seç',
    subtitle: 'Yılbaşı gecesi ya da herhangi bir gece yarısı için renkler.',
  },
  themes: {
    classic: { name: 'Klasik', hint: 'Beyaz rakamlar, kor ve beyaz kıvılcımlar' },
    champagne: { name: 'Şampanya', hint: 'Altın rakamlar, altın kıvılcımlar' },
    midnight: { name: 'Gece mavisi', hint: 'Buz mavisi rakamlar, gümüş ve mavi kıvılcımlar' },
    party: { name: 'Parti', hint: 'Neon rakamlar, her renkte kıvılcım' },
  },
  before: {
    name: 'Gece yarısından önce',
    title: 'Gece yarısından ne kadar önce?',
    subtitle: 'Saat gece yarısını geçmeden önce hazırlanma süresi.',
    hint: (time) => `Başlangıç: ${time}`,
  },
  after: {
    name: 'Gece yarısından sonra',
    title: 'Gece yarısından ne kadar sonra?',
    subtitle: 'Sonra saat baştan başlar.',
    hint: (time) => `Bitiş: ${time}, sonra baştan`,
  },
  animation: {
    name: 'Gece yarısı animasyonu',
    title: 'Gece yarısı animasyonu',
    subtitle: 'Saat her gece yarısını geçtiğinde, sonraki saniyelerde oynar.',
    fireworks: 'Havai fişek',
    fireworksHint: (time) => `Saat ${time} olunca roketler fırlar`,
    confetti: 'Konfeti',
    confettiHint: (time) => `Saat ${time} olunca konfeti patlar`,
    none: 'Yok',
    noneHint: 'Sadece saat',
    noneSummary: 'Animasyon yok',
  },
}

export default tr
