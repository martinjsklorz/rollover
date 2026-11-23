// Builds every Rollover brand file from one geometry.
//   cd brand/tools && pnpm install --ignore-workspace && pnpm build
// Writes brand/logo/*.svg, brand/png/*.png, brand/social/*.png, the app's icons in assets/
// (the TV ones in assets/tv/) and the web icons in public/.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import { parse as parseFont } from 'opentype.js'

const here = dirname(fileURLToPath(import.meta.url))
const brand = join(here, '..')
const assets = join(here, '../../assets')
const pub = join(here, '../../public')
const require = createRequire(import.meta.url)

/* ---------- palette (keep in sync with brand/README.md and src/theme.ts) ---------- */

export const C = {
  black: '#000000',
  white: '#FFFFFF',
  ember: '#FF5A36', // the one accent: midnight
  gray: '#8E8E93',
  graphite: '#1C1C1E',
  line: '#2C2C2E',
  paper: '#F4F3EF',
}

/* ---------- the mark: a ring with a gap at 12 o'clock, one dot in the gap ---------- */

const RATIO = { stroke: 0.14, dot: 0.95, clear: 0.75 }

/** SVG for the mark centred on (cx, cy) with ring radius r (centre of the stroke). */
function mark(cx, cy, r, { ring = C.white, dot = C.ember, stroke = RATIO.stroke } = {}) {
  const sw = r * stroke
  const dr = sw * RATIO.dot
  // the round caps end `clear * sw` short of the dot on both sides
  const half = (dr + RATIO.clear * sw + sw / 2) / r
  const pt = (a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)].map(n)
  const [x0, y0] = pt(half)
  const [x1, y1] = pt(-half)
  return (
    `<path d="M${x0} ${y0}A${n(r)} ${n(r)} 0 1 1 ${x1} ${y1}" fill="none" stroke="${ring}" stroke-width="${n(sw)}" stroke-linecap="round"/>` +
    `<circle cx="${n(cx)}" cy="${n(cy - r)}" r="${n(dr)}" fill="${dot}"/>`
  )
}
/** outer radius of the ring including half the stroke */
const outer = (r) => r * (1 + RATIO.stroke / 2)
/** how far the dot reaches above the ring's centre line */
const dotTop = (r) => r + r * RATIO.stroke * RATIO.dot

/* ---------- type: Inter, outlined so the files need no font ---------- */

const fonts = {}
function font(weight) {
  if (!fonts[weight]) {
    const file = readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`))
    // copy out just this file's bytes: a Buffer can be a view into a larger, shared ArrayBuffer
    fonts[weight] = parseFont(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength))
  }
  return fonts[weight]
}

/** Outlined text. tracking in em. Returns { d, width } with the baseline at y. */
function text(str, x, y, size, { weight = 300, tracking = 0 } = {}) {
  const f = font(weight)
  const scale = size / f.unitsPerEm
  const glyphs = f.stringToGlyphs(str)
  let pen = 0
  const positions = glyphs.map((g, i) => {
    const at = pen
    pen += g.advanceWidth * scale + tracking * size
    if (glyphs[i + 1]) pen += f.getKerningValue(g, glyphs[i + 1]) * scale
    return at
  })
  const width = pen - tracking * size
  const d = glyphs.map((g, i) => g.getPath(x + positions[i], y, size).toPathData(2)).join('')
  return { d, width }
}
const measure = (str, size, opts) => text(str, 0, 0, size, opts).width

/* ---------- wordmark + lockup ---------- */

const WORD = { str: 'rollover', weight: 300, tracking: -0.02 }

/** Horizontal lockup: mark, then the wordmark. size = font size. Returns svg body + box. */
function lockup(x, baseline, size, { ring = C.white, word = C.white, dot = C.ember } = {}) {
  const r = size * 0.34
  const cy = baseline - size * 0.36
  const cx = x + outer(r)
  const tx = cx + outer(r) + size * 0.34
  const t = text(WORD.str, tx, baseline, size, WORD)
  return {
    // a heavier ring next to the type, so it matches Inter Light's stems
    body: mark(cx, cy, r, { ring, dot, stroke: 0.19 }) + `<path d="${t.d}" fill="${word}"/>`,
    width: tx + t.width - x,
  }
}

/* ---------- output ---------- */

const n = (v) => +v.toFixed(2)
const svg = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  (bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : '') +
  body +
  `</svg>\n`

function out(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
  console.log('wrote', path.replace(join(here, '../..') + '/', ''))
}
const png = (path, s) => out(path, new Resvg(s, { font: { loadSystemFonts: false } }).render().asPng())

/* logo files */
{
  const S = 512
  const r = 190
  const cy = S / 2 + (dotTop(r) - outer(r)) / 2 // optically centre the ring + dot
  const marks = {
    'mark': { ring: C.white, dot: C.ember }, // on dark
    'mark-on-light': { ring: C.black, dot: C.ember },
    'mark-mono-white': { ring: C.white, dot: C.white },
    'mark-mono-black': { ring: C.black, dot: C.black },
  }
  for (const [name, colors] of Object.entries(marks)) {
    const s = svg(S, S, mark(S / 2, cy, r, colors))
    out(join(brand, 'logo', `${name}.svg`), s)
    png(join(brand, 'png', `${name}-1024.png`), svg(1024, 1024, `<g transform="scale(2)">${mark(S / 2, cy, r, colors)}</g>`))
  }

  const size = 160
  const pad = size * 0.25
  const probe = lockup(0, 0, size)
  const W = Math.ceil(probe.width + pad * 2)
  const H = Math.ceil(size * 1.0 + pad * 2)
  const baseline = pad + size * 0.73
  const variants = {
    'lockup': { ring: C.white, word: C.white },
    'lockup-on-light': { ring: C.black, word: C.black },
  }
  for (const [name, colors] of Object.entries(variants)) {
    const s = svg(W, H, lockup(pad, baseline, size, colors).body)
    out(join(brand, 'logo', `${name}.svg`), s)
    png(join(brand, 'png', `${name}.png`), svg(W * 2, H * 2, `<g transform="scale(2)">${lockup(pad, baseline, size, colors).body}</g>`))
  }

  const wm = (fill) => {
    const w = measure(WORD.str, size, WORD)
    const t = text(WORD.str, pad, baseline, size, WORD)
    return svg(Math.ceil(w + pad * 2), H, `<path d="${t.d}" fill="${fill}"/>`)
  }
  out(join(brand, 'logo', 'wordmark.svg'), wm(C.white))
  out(join(brand, 'logo', 'wordmark-on-light.svg'), wm(C.black))
}

/* app icons */
{
  const S = 1024
  const r = 262
  const cy = S / 2 + (dotTop(r) - outer(r)) / 2
  // iOS: opaque, full bleed. Dark and tinted variants use a transparent background (iOS 18+).
  png(join(assets, 'icon.png'), svg(S, S, mark(S / 2, cy, r), C.black))
  png(join(assets, 'icon-dark.png'), svg(S, S, mark(S / 2, cy, r)))
  png(join(assets, 'icon-tinted.png'), svg(S, S, mark(S / 2, cy, r, { ring: C.white, dot: '#9A9A9A' })))
  // Android adaptive icon: the system crops to the inner 66%, keep the mark well inside it
  const ar = 205
  const acy = S / 2 + (dotTop(ar) - outer(ar)) / 2
  png(join(assets, 'android-icon.png'), svg(S, S, mark(S / 2, acy, ar)))
  png(join(assets, 'android-icon-monochrome.png'), svg(S, S, mark(S / 2, acy, ar, { dot: C.white })))
  // splash: transparent, shown on black
  png(join(assets, 'splash-icon.png'), svg(S, S, mark(S / 2, cy, 400)))
  // the mark for the app UI, sharp up to 96 pt at 3x
  png(join(assets, 'brand', 'mark.png'), svg(288, 288, mark(144, 144 + (dotTop(102) - outer(102)) / 2, 102)))
  // web: the iOS icon scaled down, opaque. The mark sits well inside the 80 % safe zone,
  // so the same files work as maskable PWA icons. Served from public/ (manifest.json, index.html).
  const web = (size) => svg(size, size, `<g transform="scale(${size / S})">${mark(S / 2, cy, r)}</g>`, C.black)
  png(join(pub, 'icon-192.png'), web(192))
  png(join(pub, 'icon-512.png'), web(512))
  png(join(pub, 'apple-touch-icon.png'), web(180))
}

/* social card, store banner, Apple TV top shelf */
{
  const card = (W, H, size, tagSize) => {
    const probe = lockup(0, 0, size)
    const x = (W - probe.width) / 2
    const baseline = H / 2 + size * 0.2
    const tag = 'Midnight, again and again.'
    const tw = measure(tag, tagSize, { weight: 400 })
    const t = text(tag, (W - tw) / 2, baseline + size * 1.05, tagSize, { weight: 400 })
    return svg(W, H, lockup(x, baseline, size).body + `<path d="${t.d}" fill="${C.gray}"/>`, C.black)
  }
  png(join(brand, 'social', 'og-1200x630.png'), card(1200, 630, 120, 34))
  png(join(brand, 'social', 'banner-1024x500.png'), card(1024, 500, 104, 30))
  png(join(brand, 'social', 'square-1080.png'), card(1080, 1080, 120, 34))
  // Apple TV top shelf, shown when the app is in the top row of the home screen
  for (const [name, W] of [['top-shelf', 1920], ['top-shelf-wide', 2320]]) {
    png(join(assets, 'tv', `${name}.png`), card(W, 720, 150, 42))
    png(join(assets, 'tv', `${name}@2x.png`), card(W * 2, 1440, 300, 84))
  }
}

/* TV app icons (app.json, @react-native-tvos/config-tv) */
{
  // Android TV launcher banner, 320×180 (xhdpi): the lockup on black
  {
    const W = 320
    const H = 180
    const size = 52
    const probe = lockup(0, 0, size)
    png(join(assets, 'tv', 'android-banner.png'), svg(W, H, lockup((W - probe.width) / 2, H / 2 + size * 0.36, size).body, C.black))
  }
  // Apple TV app icon in two layers, which tvOS moves apart for the parallax effect on focus:
  // an opaque black back and the mark in front. The mark stays well inside the edges the focus effect crops.
  for (const [name, W, H] of [['icon', 1280, 768], ['icon-small', 400, 240], ['icon-small@2x', 800, 480]]) {
    const r = H * 0.25
    const cy = H / 2 + (dotTop(r) - outer(r)) / 2
    png(join(assets, 'tv', `${name}-back.png`), svg(W, H, '', C.black))
    png(join(assets, 'tv', `${name}-front.png`), svg(W, H, mark(W / 2, cy, r)))
  }
}
