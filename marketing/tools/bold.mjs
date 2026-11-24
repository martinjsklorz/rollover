// The bold store screenshots: a warm ember gradient, the ring mark over a kicker and a heavy headline,
// a big black phone running off the bottom edge, and tilted stickers that break out over its edges,
// so they read as captions, not as part of the app. No glow or shadows. Uses the raw captures from capture.mjs.
// Output: ../screenshots/bold/<store size>/<nn>-<scene>.png
import { readFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const here = dirname(fileURLToPath(import.meta.url))
const captures = join(here, '../captures')
const out = join(here, '../screenshots/bold')
const font = join(here, 'node_modules/inter-ui/variable/InterVariable.woff2')
const fontItalic = join(here, 'node_modules/inter-ui/variable/InterVariable-Italic.woff2')
const markSvg = join(here, '../../brand/logo/mark-mono-white.svg')

const C = { black: '#000000', white: '#FFFFFF' }
/** warm orange at the top, through ember, to a pink-red at the bottom */
const BACKGROUND = 'linear-gradient(165deg, #FF9B57 0%, #FF5A36 48%, #E8335E 100%)'

/**
 * All sizes are in `u`, a hundredth of the canvas width, so one layout fits every store size.
 * Phone: `x` shifts it from the center, `rotate` tilts it (degrees; both may be `{ iphone, ipad, play }`), `scale` shrinks it to show more of the screen.
 * `landscape` turns it sideways (a landscape capture): it is then `size.landscape` wide, centered on `y`
 * (same scale as the stickers' `y`) and tilted around its center. On the
 * phone canvases it runs corner to corner; on the iPad it fits whole.
 * Stickers: `side` is the phone edge they break out over; `y` from 0 (top of the phone) to 1 (bottom edge of
 * the canvas), or `{ iphone, ipad, play }` where the screens differ (the Play canvas shows less of the phone;
 * it falls back to `iphone`). Keep them clear of the clock digits, which span the whole screen width.
 * The ring mark sits in the header, whole and never rotated (brand rules).
 * `frame` picks one of the captured animation frames; check them after a new capture.
 */
const SLIDES = [
  {
    scene: 'fireworks',
    frame: { iphone: 4, ipad: 4 },
    kicker: 'Rollover',
    title: 'Midnight, again and again.',
    phone: { x: 0, rotate: 0 },
    stickers: [
      { text: 'Happy New Year!', side: 'right', y: 0.1, rotate: 6 },
      { text: 'Again!', side: 'left', y: { iphone: 0.7, ipad: 0.72, play: 0.82 }, rotate: -7 },
    ],
  },
  {
    scene: 'countdown',
    kicker: 'Missed it?',
    title: 'Count down again.',
    phone: { x: 0, rotate: -4 },
    stickers: [
      { text: 'Take 1', side: 'right', y: 0.12, rotate: 7 },
      { text: 'Take 2', side: 'left', y: 0.3, rotate: -6 },
      { text: 'Take 3', side: 'right', y: { iphone: 0.68, ipad: 0.66, play: 0.82 }, rotate: 5 },
    ],
  },
  {
    scene: 'wizard',
    frame: { iphone: 3, ipad: 3 },
    kicker: 'Four themes',
    title: 'Pick your midnight.',
    phone: { x: 0, rotate: 0 },
    stickers: [{ text: 'Live preview', side: 'right', y: { iphone: 0.27, ipad: 0.33 }, rotate: 6 }],
  },
  {
    scene: 'flip',
    frame: { iphone: 4, ipad: 4 },
    kicker: 'Simple or flip',
    title: 'Flips like the real thing.',
    phone: { x: 3, rotate: 5 },
    stickers: [{ text: 'Flip!', side: 'left', y: 0.2, rotate: -8 }],
  },
  {
    scene: 'confetti',
    frame: { iphone: 3, ipad: 3 },
    kicker: 'Bedtime',
    title: 'Midnight at eight.',
    phone: { x: 0, rotate: 0 },
    stickers: [
      { text: 'It’s 8 pm', side: 'left', y: 0.16, rotate: -6 },
      { text: 'Shh, don’t tell', side: 'right', y: { iphone: 0.66, ipad: 0.74, play: 0.84 }, rotate: 5 },
    ],
  },
  {
    scene: 'landscape',
    frame: { iphone: 5, ipad: 3 },
    kicker: 'Full screen',
    title: 'Turn it sideways.',
    phone: { landscape: true, x: { iphone: 2, ipad: 3, play: 2 }, y: { iphone: 0.45, ipad: 0.38, play: 0.46 }, rotate: { iphone: -26, ipad: -6, play: -22 } },
    stickers: [
      { text: 'Screen stays on', side: 'left', y: { iphone: 0.2, ipad: 0.03, play: 0.15 }, rotate: -6 },
      { text: 'Two taps to exit', side: 'right', y: { iphone: 0.58, ipad: 0.66, play: 0.6 }, rotate: 5 },
    ],
  },
]

/**
 * `type` scales the text, `top` is where the phone starts and `phone` its width (u), `landscape` the width of
 * a sideways phone and `aspect` the height of its screen per width.
 * The iPad canvas is wider for its height, so its text and phone are smaller in u.
 */
const SIZES = {
  'appstore-iphone-6.9': { device: 'iphone', width: 1320, height: 2868, type: 1, top: 62, phone: 76, landscape: 98, aspect: 440 / 956, radius: 0.13 },
  'appstore-ipad-13': { device: 'ipad', width: 2064, height: 2752, type: 0.7, top: 42, phone: 66, landscape: 74, aspect: 1032 / 1376, radius: 0.05 },
  'googleplay-phone': { device: 'iphone', slot: 'play', width: 1080, height: 1920, type: 0.92, top: 58, phone: 70, landscape: 96, aspect: 440 / 956, radius: 0.13 },
}

function html(slide, size, image, mark) {
  const u = size.width / 100
  const H = size.height / u // canvas height in u
  const t = size.type
  const land = slide.phone.landscape
  const phoneW = land ? size.landscape : size.phone * (slide.phone.scale ?? 1)
  const short = land ? phoneW * size.aspect : phoneW // the screen's short side sets the bezel and corners
  const bezel = short * 0.035
  const screenRadius = short * size.radius
  // stickers start near the canvas edge, so they stick out well past the phone's edge
  const margin = 2
  const pick = (v) => (typeof v === 'object' ? (v[size.slot] ?? v[size.device]) : v)
  const below = (y) => size.top + pick(y) * (H - size.top)
  const phoneTop = land ? below(slide.phone.y) - short / 2 - bezel : size.top
  const px = (v) => `${(v * u).toFixed(1)}px`

  const stickers = (slide.stickers ?? [])
    .map(
      (s) => {
        const edge = s.side === 'left' ? `left:${px(margin)}` : `right:${px(margin)}`
        return `<div class="sticker" style="${edge};top:${px(below(s.y))};transform:rotate(${s.rotate}deg)">${s.text}</div>`
      },
    )
    .join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: ${size.width}px; height: ${size.height}px; background: ${BACKGROUND}; overflow: hidden; position: relative; }
  body { font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased; color: ${C.black}; }
  header { position: absolute; left: 0; right: 0; top: ${px(5 * t)}; display: flex; flex-direction: column; align-items: center; }
  .kicker { font-weight: 700; font-size: ${px(4.6 * t)}; letter-spacing: -0.01em; }
  h1 { margin-top: ${px(2.2 * t)}; font-weight: 800; font-size: ${px(10 * t)}; line-height: 1.02; letter-spacing: -0.035em;
    text-align: center; max-width: ${px(90)}; text-wrap: balance; }
  .mark { width: ${px(13 * t)}; height: ${px(13 * t)}; margin-bottom: ${px(1.4 * t)}; }
  .mark svg { width: 100%; height: 100%; display: block; }
  .phone { position: absolute; top: ${px(phoneTop)}; left: ${px(50 - phoneW / 2 - bezel + pick(slide.phone.x ?? 0))};
    padding: ${px(bezel)}; background: ${C.black}; border-radius: ${px(screenRadius + bezel)};
    transform: rotate(${pick(slide.phone.rotate)}deg); transform-origin: ${land ? '50% 50%' : '50% 0'}; }
  .phone img { display: block; width: ${px(phoneW)}; border-radius: ${px(screenRadius)}; }
  .sticker { position: absolute; white-space: nowrap; background: ${C.white}; color: ${C.black};
    font-style: italic; font-weight: 900; font-size: ${px(5.6 * t)}; letter-spacing: -0.02em;
    padding: ${px(1.2 * t)} ${px(3 * t)}; border-radius: ${px(1.6 * t)}; border: ${px(0.6 * t)} solid ${C.black}; }
</style></head><body>
  <header><div class="mark">${mark}</div><div class="kicker">${slide.kicker}</div><h1>${slide.title}</h1></header>
  <div class="phone"><img src="data:image/png;base64,${image}"></div>
  ${stickers}
</body></html>`
}

async function run() {
  const fontBase64 = (await readFile(font)).toString('base64')
  const fontItalicBase64 = (await readFile(fontItalic)).toString('base64')
  const mark = await readFile(markSvg, 'utf8')
  const browser = await chromium.launch()
  try {
    for (const [name, size] of Object.entries(SIZES)) {
      await rm(join(out, name), { recursive: true, force: true })
      await mkdir(join(out, name), { recursive: true })
      for (const [i, slide] of SLIDES.entries()) {
        const frame = slide.frame?.[size.device]
        const file = join(captures, size.device, frame ? `${slide.scene}-${frame}.png` : `${slide.scene}.png`)
        if (!existsSync(file)) throw new Error(`Missing capture ${file}. Run capture.mjs first.`)
        const image = (await readFile(file)).toString('base64')
        const target = join(out, name, `${String(i + 1).padStart(2, '0')}-${slide.scene}.png`)
        // a fresh page per slide, and a retry: the software renderer sometimes stalls on a page
        for (let attempt = 1; ; attempt++) {
          const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 })
          try {
            await page.setContent(html(slide, size, image, mark), { waitUntil: 'load', timeout: 60_000 })
            // fonts from their bytes: font URLs fail to load in this headless shell (see capture.mjs)
            await page.evaluate(async ([regular, italic]) => {
              const buffer = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer
              document.fonts.add(new FontFace('Inter', buffer(regular), { weight: '100 900' }))
              document.fonts.add(new FontFace('Inter', buffer(italic), { weight: '100 900', style: 'italic' }))
              await document.fonts.ready
            }, [fontBase64, fontItalicBase64])
            // the headline must clear the phone
            const gap = await page.evaluate(
              () => document.querySelector('.phone').getBoundingClientRect().top - document.querySelector('h1').getBoundingClientRect().bottom,
            )
            if (gap < 20) console.warn(`${name} ${slide.scene}: headline crowds the phone (${Math.round(gap)} px)`)
            await page.screenshot({ path: target, timeout: 60_000 })
            break
          } catch (e) {
            if (attempt === 3) throw e
            console.warn(`${name} ${slide.scene} failed, retrying:`, e.message.split('\n')[0])
          } finally {
            await page.close()
          }
        }
      }
      console.log(name, SLIDES.length, 'screenshots')
    }
  } finally {
    await browser.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
