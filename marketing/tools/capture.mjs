// Captures raw app screens from the web build (../../dist) at store device sizes.
// Run `pnpm exec expo export --platform web` in the repo root first.
// Output: ../captures/<device>/<scene>[-<n>].png (several frames for animated scenes, pick one in compose.mjs)
import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import { extname, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const here = dirname(fileURLToPath(import.meta.url))
const dist = join(here, '../../dist')
const out = join(here, '../captures')
const font = join(here, 'node_modules/inter-ui/variable/InterVariable.woff2')

/** Store device sizes in points and scale: iPhone 6.9" (1320×2868), iPad 13" (2064×2752). */
export const DEVICES = {
  iphone: { width: 440, height: 956, scale: 3 },
  ipad: { width: 1032, height: 1376, scale: 2 },
}

const base = { hour12: false, style: 'simple', theme: 'classic', animation: 'fireworks', before: 10, after: 10 }

/**
 * Each scene: settings, a route, and the clock time to wait for (the `role=timer` label).
 * `landscape` turns the device sideways.
 * `frames` are extra delays in ms after that time is shown; animated scenes get several to pick from.
 */
const SCENES = [
  { id: 'fireworks', settings: { ...base }, path: '/clock', at: '00:00:00', frames: [500, 700, 900, 1100, 1300, 1600, 1900, 2200] },
  { id: 'countdown', settings: { ...base, theme: 'champagne', animation: 'none' }, path: '/clock', at: '23:59:57', frames: [400] },
  { id: 'flip', settings: { ...base, theme: 'midnight', style: 'flip' }, path: '/clock', at: '00:00:00', frames: [500, 800, 1100, 1400, 1700, 2000] },
  { id: 'confetti', settings: { ...base, theme: 'party', hour12: true, animation: 'confetti' }, path: '/clock', at: '12:00:00 AM', frames: [300, 500, 700, 900, 1200, 1500] },
  { id: 'wizard', settings: { ...base, theme: 'champagne' }, draft: true, path: '/setup/theme', at: '00:00:00', frames: [600, 900, 1200, 1500] },
  { id: 'home', settings: { ...base, before: 10, after: 10 }, path: '/', frames: [300] },
  // the phone turned sideways, for the full-screen slide
  { id: 'landscape', landscape: true, settings: { ...base, theme: 'party' }, path: '/clock', at: '00:00:00', frames: [500, 800, 1100, 1400, 1700, 2000] },
]

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.ttf': 'font/ttf', '.woff2': 'font/woff2' }

/** Serves dist/ under /rollover (experiments.baseUrl), with index.html for every route, like GitHub Pages. */
function serve() {
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    let file = join(dist, url.replace(/^\/rollover/, ''))
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(dist, 'index.html')
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
    res.end(await readFile(file))
  })
  return new Promise((resolve) => server.listen(0, () => resolve(server)))
}

// The app uses the system font (SF Pro / Roboto). Headless Chromium here has none, so every text is
// set in Inter, the brand's marketing face and close to SF Pro. Added from its bytes with the
// FontFace API: font URLs fail to load in this headless shell.
const FONT_CSS = `* { font-family: Inter, sans-serif !important; -webkit-font-smoothing: antialiased; }`

async function run() {
  if (!existsSync(join(dist, 'index.html'))) throw new Error('No web build. Run `pnpm exec expo export --platform web` in the repo root.')
  // optional filters: device names and scene ids, e.g. `node capture.mjs iphone fireworks`
  const args = process.argv.slice(2)
  const only = args.filter((a) => a in DEVICES)
  const sceneFilter = args.filter((a) => !(a in DEVICES))
  const fontBase64 = (await readFile(font)).toString('base64')
  const server = await serve()
  const origin = `http://localhost:${server.address().port}`
  try {
    for (const [device, size] of Object.entries(DEVICES)) {
      if (only.length && !only.includes(device)) continue
      await mkdir(join(out, device), { recursive: true })
      for (const scene of SCENES) {
        if (sceneFilter.length && !sceneFilter.includes(scene.id)) continue
        // a fresh browser per scene, and a retry: the software renderer sometimes stalls on a frame
        for (let attempt = 1; ; attempt++) {
          const browser = await chromium.launch()
          try {
            await captureScene(browser, origin, device, size, scene, fontBase64)
            console.log(device, scene.id, scene.frames.length, 'frame(s)')
            break
          } catch (e) {
            if (attempt === 3) throw e
            console.warn(device, scene.id, 'failed, retrying:', e.message.split('\n')[0])
          } finally {
            await browser.close()
          }
        }
      }
    }
  } finally {
    server.close()
  }
}

async function captureScene(browser, origin, device, size, scene, fontBase64) {
  const context = await browser.newContext({
    viewport: scene.landscape ? { width: size.height, height: size.width } : { width: size.width, height: size.height },
    deviceScaleFactor: size.scale,
    isMobile: true,
    hasTouch: true,
  })
  await context.addInitScript(
    ([s, draft, css, fontBase64]) => {
      // the font goes in before the app renders, so the clock measures its digits in Inter
      const bytes = Uint8Array.from(atob(fontBase64), (c) => c.charCodeAt(0))
      document.fonts.add(new FontFace('Inter', bytes.buffer, { weight: '100 900' }))
      const style = document.createElement('style')
      style.textContent = css
      document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style))
      localStorage.setItem('rollover.settings.v1', s)
      if (draft) localStorage.setItem('rollover.draft.v1', s)
      else localStorage.removeItem('rollover.draft.v1')
    },
    [JSON.stringify(scene.settings), !!scene.draft, FONT_CSS, fontBase64],
  )
  const page = await context.newPage()
  await page.goto(origin + '/rollover' + scene.path)
  await page.evaluate(() => document.fonts.ready)
  if (scene.at) {
    await page.waitForFunction((t) => document.querySelector('[role="timer"]')?.getAttribute('aria-label') === t, scene.at, {
      timeout: 90_000,
      polling: 10,
    })
  } else {
    await page.waitForTimeout(800)
  }
  const t0 = Date.now()
  for (const [i, ms] of scene.frames.entries()) {
    await page.waitForTimeout(Math.max(0, ms - (Date.now() - t0)))
    const name = scene.frames.length > 1 ? `${scene.id}-${i + 1}.png` : `${scene.id}.png`
    await page.screenshot({ path: join(out, device, name), animations: 'allow', timeout: 60_000 })
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
