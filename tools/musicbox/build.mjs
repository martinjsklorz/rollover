// Renders the music box tunes the clock plays at midnight (settings.sound = 'musicbox').
//   pnpm sounds        (or: node tools/musicbox/build.mjs)
// Writes assets/sounds/<occasion>.wav: 16-bit mono PCM at 22.05 kHz. Plain Node, no dependencies.
//
// Every melody is traditional and in the public domain; only the melody is used, no lyrics and no
// recording. Change the notes or the sound here, not in the WAV files. Sources are in the README.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const out = join(dirname(fileURLToPath(import.meta.url)), '../../assets/sounds')
const RATE = 22050

/* ---------- the tunes ---------- */

/**
 * A note is [pitch, beats], e.g. ['F#5', 1]; pitch 'r' is a rest. `beat` is seconds per beat.
 * All in the music box's register, about C5 to C7.
 */
const TUNES = {
  // The Westminster Quarters (Cambridge, 1793): the full-hour chime, changes 2, 3, 4 and 5, each three
  // crotchets and a minim. Big Ben plays it in E major; here it's in A major, an octave and a fourth up.
  classic: {
    beat: 0.36,
    notes: [
      ['A5', 1], ['C#6', 1], ['B5', 1], ['E5', 2],
      ['A5', 1], ['B5', 1], ['C#6', 1], ['A5', 2],
      ['C#6', 1], ['A5', 1], ['B5', 1], ['E5', 2],
      ['E5', 1], ['B5', 1], ['C#6', 1], ['A5', 2],
    ],
  },
  // "Auld Lang Syne", the traditional Scots melody (George Thomson, Select Songs of Scotland, 1799):
  // the first phrase, "Should auld acquaintance be forgot, and never brought to mind?", in F major.
  newyear: {
    beat: 0.42,
    notes: [
      ['C5', 1],
      ['F5', 1.5], ['F5', 0.5], ['F5', 1], ['A5', 1],
      ['G5', 1.5], ['F5', 0.5], ['G5', 1], ['A5', 1],
      ['F5', 1.5], ['F5', 0.5], ['A5', 1], ['C6', 1],
      ['D6', 3],
    ],
  },
  // "Happy Birthday to You" (the melody of the Hill sisters' "Good Morning to All", 1893), in F major, 3/4.
  // The whole song: it's short. A little pause on "dear …", as everyone sings it.
  birthday: {
    beat: 0.3,
    notes: [
      ['C5', 0.75], ['C5', 0.25], ['D5', 1], ['C5', 1], ['F5', 1], ['E5', 2],
      ['C5', 0.75], ['C5', 0.25], ['D5', 1], ['C5', 1], ['G5', 1], ['F5', 2],
      ['C5', 0.75], ['C5', 0.25], ['C6', 1], ['A5', 1], ['F5', 1], ['E5', 1], ['D5', 1.5],
      ['Bb5', 0.75], ['Bb5', 0.25], ['A5', 1], ['F5', 1], ['G5', 1], ['F5', 2],
    ],
  },
  // "Mo Li Hua" (Jasmine Flower), the traditional Chinese folk song (first printed in the West in John
  // Barrow's Travels in China, 1804): "好一朵美丽的茉莉花", "芬芳美丽满枝桠", "又香又白人人夸",
  // in 2/4, pentatonic on F. The opening line is sung twice; here it's played once.
  lunar: {
    beat: 0.34,
    notes: [
      ['A5', 1], ['A5', 0.5], ['C6', 0.5], ['D6', 0.5], ['F6', 0.5], ['F6', 0.5], ['D6', 0.5],
      ['C6', 1], ['C6', 0.5], ['D6', 0.5], ['C6', 2],
      ['C6', 1], ['C6', 1], ['C6', 1], ['A5', 0.5], ['C6', 0.5],
      ['D6', 1], ['D6', 1], ['C6', 2],
      ['A5', 1], ['G5', 0.5], ['A5', 0.5], ['C6', 1], ['A5', 0.5], ['G5', 0.5],
      ['F5', 1], ['F5', 0.5], ['G5', 0.5], ['F5', 2],
    ],
  },
}

/* ---------- the sound of a music box ---------- */

/** Ring time (to about −60 dB) at C5 and at C7: high tines stop sooner. */
const RING_LOW = 1.5
const RING_HIGH = 0.9
const ATTACK = 0.002
/** a re-struck tine is damped first, as the comb's damper does */
const DAMP = 0.012
/** the quiet partials: an octave, and a tine's inharmonic second mode (a clamped bar: 6.27 × the fundamental) */
const PARTIALS = [
  { ratio: 1, gain: 1, ring: 1 },
  { ratio: 2, gain: 0.22, ring: 0.6 },
  { ratio: 6.27, gain: 0.07, ring: 0.18 },
]
const PEAK = 10 ** (-3 / 20) // −3 dBFS
const FADE_OUT = 0.3

const NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/** 'F#5' → frequency in Hz (A4 = 440). */
function frequency(pitch) {
  const m = /^([A-G])(#|b)?(\d)$/.exec(pitch)
  if (!m) throw new Error(`Unknown pitch ${pitch}`)
  const midi = 12 * (Number(m[3]) + 1) + NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0)
  return 440 * 2 ** ((midi - 69) / 12)
}

/** Small seeded random numbers, so a rebuild gives the same files. */
function random(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function render(name, { beat, notes }) {
  const rand = random([...name].reduce((h, c) => Math.imul(h, 31) + c.charCodeAt(0), 7))
  // when each note starts, and when the same tine is struck next (then it's damped)
  let time = 0
  const events = notes.map(([pitch, beats]) => {
    const event = { pitch, start: time }
    time += beats * beat
    return event
  })
  const played = events.filter((e) => e.pitch !== 'r')
  for (const [i, e] of played.entries()) e.stop = played.slice(i + 1).find((n) => n.pitch === e.pitch)?.start ?? Infinity

  const ringOf = (f) => {
    const x = Math.min(1, Math.max(0, Math.log2(f / frequency('C5')) / 2))
    return RING_LOW + (RING_HIGH - RING_LOW) * x
  }
  const last = played[played.length - 1]
  const length = last.start + ringOf(frequency(last.pitch))
  const samples = new Float64Array(Math.ceil(length * RATE))

  for (const e of played) {
    // a few cents out of tune and a slightly uneven touch, like a real comb
    const f = frequency(e.pitch) * 2 ** (((rand() - 0.5) * 6) / 1200)
    const velocity = 0.82 + rand() * 0.18
    const ring = ringOf(f)
    const first = Math.round(e.start * RATE)
    const end = Math.min(samples.length, Math.ceil((Math.min(e.stop + DAMP, e.start + ring)) * RATE))
    const phases = PARTIALS.map(() => rand() * 0.2)
    let noise = 0
    for (let i = first; i < end; i++) {
      const t = (i - first) / RATE
      const attack = t < ATTACK ? 0.5 - 0.5 * Math.cos((Math.PI * t) / ATTACK) : 1
      const damp = t + e.start > e.stop ? Math.max(0, 1 - (t + e.start - e.stop) / DAMP) : 1
      let v = 0
      for (const [k, p] of PARTIALS.entries()) {
        const fk = f * p.ratio
        if (fk > RATE * 0.45) continue // above what 22.05 kHz can hold
        v += p.gain * Math.exp((-6.9 * t) / (ring * p.ring)) * Math.sin(2 * Math.PI * (fk * t + phases[k]))
      }
      // the pin plucking the tine: a click of high-passed noise, a few milliseconds long
      const white = rand() * 2 - 1
      const click = (white - noise) * 0.06 * Math.exp(-t / 0.0015)
      noise = white
      samples[i] += velocity * (attack * damp * v + click)
    }
  }

  // −3 dBFS peak, and a fade at the very end so the file never stops on a click
  const peak = samples.reduce((m, s) => Math.max(m, Math.abs(s)), 0)
  const fade = FADE_OUT * RATE
  for (let i = 0; i < samples.length; i++) {
    const left = samples.length - i
    samples[i] *= (PEAK / peak) * (left < fade ? left / fade : 1)
  }
  return samples
}

/** 16-bit mono PCM WAV. */
function wav(samples) {
  const data = samples.length * 2
  const buf = Buffer.alloc(44 + data)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + data, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20) // PCM
  buf.writeUInt16LE(1, 22) // mono
  buf.writeUInt32LE(RATE, 24)
  buf.writeUInt32LE(RATE * 2, 28)
  buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(data, 40)
  samples.forEach((s, i) => buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(s * 32767))), 44 + i * 2))
  return buf
}

mkdirSync(out, { recursive: true })
for (const [name, tune] of Object.entries(TUNES)) {
  const samples = render(name, tune)
  const file = join(out, `${name}.wav`)
  const bytes = wav(samples)
  writeFileSync(file, bytes)
  console.log(`${name}.wav  ${(samples.length / RATE).toFixed(1)} s  ${Math.round(bytes.length / 1024)} KB`)
}
