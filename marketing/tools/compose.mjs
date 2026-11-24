// Composes the store screenshots from the raw captures (../captures, made by capture.mjs):
// a headline and a line of text on black, over the screen in a thin device outline.
// Flat, per brand/README.md: no glow, no gradients, no shadows. Inter Light headlines.
// Output: ../screenshots/minimal/<store size>/<nn>-<scene>.png
import { readFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const here = dirname(fileURLToPath(import.meta.url))
const captures = join(here, '../captures')
const out = join(here, '../screenshots/minimal')
const font = join(here, 'node_modules/inter-ui/variable/InterVariable.woff2')

/**
 * The set, in store order. The first three show in search results, so they carry the story.
 * `frame` picks one of the captured animation frames (capture.mjs takes several; fireworks are random,
 * so check the frames after a new capture and update the picks).
 */
const SLIDES = [
  {
    scene: 'fireworks',
    frame: { iphone: 4, ipad: 4 },
    title: 'Midnight, again and again.',
    text: 'A clock that rolls over midnight. Then it does it again.',
  },
  {
    scene: 'countdown',
    title: 'Missed the moment?',
    text: 'Count down as often as you need. Every take gets its midnight.',
  },
  {
    scene: 'wizard',
    frame: { iphone: 3, ipad: 3 },
    title: 'Pick your midnight.',
    text: 'Four themes, with a live preview on every step.',
  },
  {
    scene: 'flip',
    frame: { iphone: 4, ipad: 4 },
    title: 'Simple or flip clock.',
    text: 'Split-flap cards that flip like the real thing.',
  },
  {
    scene: 'confetti',
    frame: { iphone: 3, ipad: 3 },
    title: 'Midnight at eight.',
    text: 'Little ones can’t stay up? Give them their countdown at bedtime.',
  },
  {
    scene: 'home',
    title: 'One tap on Start.',
    text: 'Full screen, the screen stays on, true black for OLED.',
  },
]

/**
 * Store sizes. `device` is the capture used; sizes are in output pixels.
 * - App Store iPhone 6.9" (1320×2868) and iPad 13" (2064×2752): the required sizes; App Store Connect
 *   scales them down for smaller devices.
 * - Google Play phone (1080×1920, 9:16). Play's tablet slots take the iPad set as is.
 */
const SIZES = {
  'appstore-iphone-6.9': { device: 'iphone', width: 1320, height: 2868, screen: 960, radius: 0.13, top: 210, title: 104, text: 46, gap: 110 },
  'appstore-ipad-13': { device: 'ipad', width: 2064, height: 2752, screen: 1340, radius: 0.045, top: 200, title: 120, text: 52, gap: 120 },
  'googleplay-phone': { device: 'iphone', width: 1080, height: 1920, screen: 600, radius: 0.13, top: 120, title: 78, text: 34, gap: 70 },
}

const colors = { bg: '#000000', text: '#FFFFFF', muted: '#8E8E93', line: '#2C2C2E' }

function html(slide, size, image, fontBase64) {
  const s = size
  // the outline sits a bezel's width outside the screen, like the ring around the dot
  const bezel = Math.round(s.screen * 0.035)
  const stroke = Math.max(3, Math.round(s.width * 0.0028))
  const screenRadius = Math.round(s.screen * s.radius)
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: ${s.width}px; height: ${s.height}px; background: ${colors.bg}; overflow: hidden; }
  body { font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased; color: ${colors.text};
    display: flex; flex-direction: column; align-items: center; padding-top: ${s.top}px; }
  h1 { font-weight: 300; font-size: ${s.title}px; line-height: 1.1; letter-spacing: -0.02em; text-align: center;
    max-width: ${Math.round(s.width * 0.86)}px; text-wrap: balance; }
  p { margin-top: ${Math.round(s.text * 0.7)}px; font-weight: 400; font-size: ${s.text}px; line-height: 1.35; color: ${colors.muted};
    text-align: center; max-width: ${Math.round(s.width * 0.78)}px; text-wrap: balance;
    /* room for two lines, so the device sits at the same height on every slide */
    min-height: ${Math.ceil(s.text * 1.35 * 2)}px; }
  .device { margin-top: ${s.gap}px; padding: ${bezel}px; border: ${stroke}px solid ${colors.line};
    border-radius: ${screenRadius + bezel}px; }
  .device img { display: block; width: ${s.screen}px; border-radius: ${screenRadius}px; }
</style></head><body>
  <h1>${slide.title}</h1>
  <p>${slide.text}</p>
  <div class="device"><img src="data:image/png;base64,${image}"></div>
  <script>
    const bytes = Uint8Array.from(atob('${fontBase64}'), (c) => c.charCodeAt(0))
    document.fonts.add(new FontFace('Inter', bytes.buffer, { weight: '100 900' }))
  </script>
</body></html>`
}

async function run() {
  const fontBase64 = (await readFile(font)).toString('base64')
  const browser = await chromium.launch()
  try {
    for (const [name, size] of Object.entries(SIZES)) {
      await rm(join(out, name), { recursive: true, force: true })
      await mkdir(join(out, name), { recursive: true })
      const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 })
      for (const [i, slide] of SLIDES.entries()) {
        const frame = slide.frame?.[size.device]
        const file = join(captures, size.device, frame ? `${slide.scene}-${frame}.png` : `${slide.scene}.png`)
        if (!existsSync(file)) throw new Error(`Missing capture ${file}. Run capture.mjs first.`)
        const image = (await readFile(file)).toString('base64')
        await page.setContent(html(slide, size, image, fontBase64), { waitUntil: 'load' })
        await page.evaluate(() => document.fonts.ready)
        const overflow = await page.evaluate(() => document.querySelector('.device').getBoundingClientRect().bottom - innerHeight)
        if (overflow > -40) console.warn(`${name} ${slide.scene}: device ends ${Math.round(-overflow)} px from the bottom edge`)
        const target = join(out, name, `${String(i + 1).padStart(2, '0')}-${slide.scene}.png`)
        await page.screenshot({ path: target, timeout: 60_000 })
      }
      console.log(name, SLIDES.length, 'screenshots')
      await page.close()
    }
  } finally {
    await browser.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
