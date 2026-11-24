# Store screenshots

Ready to upload, made from the real app (the web build) at the store sizes, in two styles:

- **`screenshots/bold/`**: a warm gradient (orange, ember, pink-red), the ring mark over a kicker and a heavy
  Inter headline, a big black phone running off the bottom edge, and tilted stickers in heavy italic with a black
  outline. The stickers break out past the phone's edge, so they read as captions, not as part of the app.
  Made to stand out in the store.
- **`screenshots/minimal/`**: black, an Inter Light headline and a gray line of text, the screen in a thin outline.
  Quieter, and the closest to the app itself.

Each style has the same three sizes:

| Folder | Size | Where it goes |
| --- | --- | --- |
| `appstore-iphone-6.9/` | 1320 × 2868 | App Store Connect, iPhone 6.9" display. Apple scales it down for smaller iPhones. |
| `appstore-ipad-13/` | 2064 × 2752 | App Store Connect, iPad 13" display. Also fits Google Play's 7" and 10" tablet slots. |
| `googleplay-phone/` | 1080 × 1920 | Google Play Console, phone screenshots. |

The Play Store feature graphic is `../brand/social/banner-1024x500.png`.

## The set

Upload them in this order. The first three appear in App Store search results, so they tell the story.

Bold:

| # | Screen | Kicker | Headline | Stickers |
| --- | --- | --- | --- | --- |
| 1 | Classic, fireworks at 00:00:01 | Rollover | Midnight, again and again. | Happy New Year! · Again! |
| 2 | Champagne at 23:59:57 | Missed it? | Count down again. | Take 1 · Take 2 · Take 3 |
| 3 | Theme step of the setup | Four themes | Pick your midnight. | Live preview |
| 4 | Midnight blue flip clock | Simple or flip | Flips like the real thing. | Flip! |
| 5 | Party, 12-hour, confetti | Bedtime | Midnight at eight. | It's 8 pm · Shh, don't tell |
| 6 | Party, fireworks at 00:00:01, phone turned sideways | Full screen | Turn it sideways. | Screen stays on · Two taps to exit |

Minimal:

| # | Screen | Headline | Text |
| --- | --- | --- | --- |
| 1 | Classic, fireworks at 00:00:01 | Midnight, again and again. | A clock that rolls over midnight. Then it does it again. |
| 2 | Champagne at 23:59:57 | Missed the moment? | Count down as often as you need. Every take gets its midnight. |
| 3 | Theme step of the setup, live preview | Pick your midnight. | Four themes, with a live preview on every step. |
| 4 | Midnight blue flip clock, fireworks | Simple or flip clock. | Split-flap cards that flip like the real thing. |
| 5 | Party, 12-hour, confetti | Midnight at eight. | Little ones can't stay up? Give them their countdown at bedtime. |
| 6 | Home screen | One tap on Start. | Full screen, the screen stays on, true black for OLED. |

The minimal style follows `../brand/README.md` to the letter. The bold style bends it on purpose, for the
store only: a gradient background in the ember family (the brand says no gradients, and ember marks one element
per screen in the app), and the one-color white mark, since an ember dot would vanish on ember. Still no glow or
shadows, and the mark is never rotated. The app's system font is replaced by Inter in the captures (close to SF Pro, and the
brand's marketing face).

## Rebuild

```bash
pnpm exec expo export --platform web   # in the repo root: the web build in dist/
cd marketing/tools
pnpm install --ignore-workspace
pnpm capture    # raw screens → ../captures (git-ignored), several frames per animated scene
pnpm compose    # both styles → ../screenshots/minimal and ../screenshots/bold
```

Change the copy, the order or the layout in `tools/compose.mjs` (minimal) and `tools/bold.mjs` (bold),
the scenes and settings in `tools/capture.mjs`. Fireworks and confetti are random: after a new capture, look at
the frames in `captures/` and set the `frame` picks in both files. In `bold.mjs`, stickers sit at the left or right
canvas edge (`side`), and their height can differ per canvas (`{ iphone, ipad, play }`), so they stay clear of the
digits and buttons. Slide 6 uses a landscape capture (`landscape: true` in `capture.mjs`) and a sideways phone
(`phone.landscape` in `bold.mjs`): corner to corner on the phone canvases, whole on the iPad. `node capture.mjs iphone fireworks` recaptures one scene.

Playwright needs Chromium (`pnpm exec playwright-core install chromium`) and its system libraries.
