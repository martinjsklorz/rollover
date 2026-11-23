import type { Strings } from './en'

const id: Strings = {
  home: {
    tagline: 'Tengah malam, lagi dan lagi.',
    fromTo: (from, to) => `dari ${from} sampai ${to}`,
    start: 'Mulai',
    newSetup: 'Atur ulang',
    setUp: 'Atur jam',
  },
  wizard: {
    back: 'Kembali',
    next: 'Lanjut',
    stepOf: (step, count) => `Langkah ${step} dari ${count}`,
  },
  ready: {
    title: 'Siap',
    subtitle: 'Letakkan ponsel, lalu ketuk Mulai. Ketuk jam dua kali untuk kembali ke sini.',
    mayDim: 'Browser ini mungkin membiarkan layar mati; matikan kunci otomatis agar layar tetap menyala.',
    start: 'Mulai',
    change: (name) => `Ubah ${name.toLowerCase()}`,
  },
  clock: {
    title: 'Jam',
    back: 'Kembali. Ketuk dua kali untuk kembali.',
    goBack: 'Kembali',
    tapAgain: 'Ketuk lagi untuk kembali',
  },
  seconds: (n) => `${n} detik`,
  format: {
    name: 'Format',
    title: '24 jam atau AM/PM?',
    hour24: '24 jam',
    hour12: '12 jam',
  },
  style: {
    name: 'Gaya',
    title: 'Pilih gaya',
    simple: 'Sederhana',
    simpleHint: 'Angka putih tipis',
    flip: 'Jam flip',
    flipHint: 'Kartu lipat',
  },
  theme: {
    name: 'Tema',
    title: 'Pilih tema',
    subtitle: 'Warna untuk malam Tahun Baru, atau tengah malam mana pun.',
  },
  themes: {
    classic: { name: 'Klasik', hint: 'Angka putih, percikan bara dan putih' },
    champagne: { name: 'Sampanye', hint: 'Angka emas, percikan keemasan' },
    midnight: { name: 'Biru malam', hint: 'Angka biru es, percikan perak dan biru' },
    party: { name: 'Pesta', hint: 'Angka neon, percikan segala warna' },
  },
  before: {
    name: 'Sebelum tengah malam',
    title: 'Berapa lama sebelum tengah malam?',
    subtitle: 'Waktu untuk bersiap sebelum jam melewati tengah malam.',
    hint: (time) => `Mulai pukul ${time}`,
  },
  after: {
    name: 'Setelah tengah malam',
    title: 'Berapa lama setelah tengah malam?',
    subtitle: 'Lalu jam mulai lagi dari awal.',
    hint: (time) => `Sampai ${time}, lalu berulang`,
  },
  animation: {
    name: 'Animasi tengah malam',
    title: 'Animasi tengah malam',
    subtitle: 'Diputar beberapa detik setelah tengah malam, setiap kali jam melewati tengah malam.',
    fireworks: 'Kembang api',
    fireworksHint: (time) => `Roket meluncur pukul ${time}`,
    confetti: 'Konfeti',
    confettiHint: (time) => `Konfeti meletup pukul ${time}`,
    none: 'Tidak ada',
    noneHint: 'Hanya jam',
    noneSummary: 'Tanpa animasi',
  },
}

export default id
