# Rollover

**Midnight, whenever you need it.**
A beautiful clock that rolls over to the day that matters — on cue, again and again.

Rollover was born from one moment: filming a baby turning one while she slept, the
phone on the bed showing the clock roll over midnight onto her birthday. Rollover lets
you stage that moment at any time and repeat it until the take is perfect.
See [PRODUCT.md](PRODUCT.md) for audience, design principles and scope.

## Features

- **Staged rollover** – pick a date and time (default 00:00). The clock starts a lead-in before it
  (10 s – 5 min), rolls over, holds, and loops for retakes.
- **Real-time mode** – the actual clock, celebrating at the real moment.
- **Presets** – Birthday, New Year (fake midnight for kids), Anniversary, Milestone, On cue (stage/film), Real time.
- **Six camera-ready themes** – Nightlight (sleep-safe red), Bedside, Flip (real split-flap), LCD, Neon, Keepsake.
  Landscape and a stacked portrait layout.
- **The moment** – odometer-roll of every digit and the date, message reveal, glow or confetti,
  optional synthesized chime / ticks, big 10-second countdown.
- **Hands-off** – start delay to place your phone, screen wake lock, fullscreen, auto-hiding controls,
  dimmer, burn-in drift.
- **Camera mode** – record video with the rolling clock burned in (camcorder timestamp or theme style),
  mic + chime mixed in, save or share.
- **Remote control** – scan a QR code with a second phone to start, pause, “roll now”, dim and switch themes
  (peer-to-peer via PeerJS).
- **Saved moments & share links** – the whole setup is encoded in the link.
- **Everywhere** – installable offline PWA (iOS, Android, desktop, TV browsers) + Capacitor shells for
  the App Store and Play Store.

### Keyboard & presentation clickers (run view)

| Key | Action |
|---|---|
| `Space` / `K` | pause / resume |
| `R` | restart from the lead-in |
| `J` | skip to 10 s before the rollover |
| `N`, `→`, `PageDown` | roll over in 3 s (clicker “next”) |
| `↑` / `↓` | brightness |
| `F` | fullscreen |
| `Esc` | back to the studio |

## Develop

```bash
corepack enable  # once; provides the pnpm version pinned in package.json
pnpm install
pnpm dev         # http://localhost:5173 (also on your LAN for phone testing)
pnpm build       # type-check + production build into dist/
pnpm preview     # serve the production build
pnpm lint
```

Stack: Vite, React 19, TypeScript, Zustand, vite-plugin-pwa (Workbox), canvas-confetti, PeerJS,
qrcode, lucide-react, Fontsource fonts + DSEG (OFL), Capacitor 8.

```
src/
  model/      moment (presets, share links), themes, engine (all timing derives from wall time)
  lib/        frame loop, audio synth, wake lock/fullscreen, remote (PeerJS), camera overlay renderer
  components/ Studio, RunView, CameraView, RemoteView, Clock, PairModal, ui
  styles/     app.css (UI), clock.css (clock + themes, sized with container queries)
```

## Deploy the web app

`.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on every push to `main`
(enable Pages → “GitHub Actions” in the repo settings). Any static host works — the build uses relative paths.

## Native apps (Capacitor)

```bash
cp .env.example .env     # set VITE_PUBLIC_URL to your hosted web app
pnpm android             # build, sync and open Android Studio
pnpm ios                 # build, sync and open Xcode (macOS)
```

`VITE_PUBLIC_URL` matters for the native builds: inside the app the page lives at
`capacitor://localhost`, so remote-control QR codes and share links must point at the hosted web app.
Icons and splash screens are generated from `resources/icon.png` with `npx @capacitor/assets generate`.
Native builds use `@capacitor-community/keep-awake` and `@capacitor/status-bar`; camera and
microphone permissions are declared in `AndroidManifest.xml` and `Info.plist`.

## Notes

- Fullscreen isn’t available to web pages on iPhone Safari; install Rollover to the home screen
  (Share → Add to Home Screen) for a chrome-free clock.
- The web can’t change screen brightness; the dimmer darkens the image instead. For a sleeping baby,
  combine it with the phone’s own brightness slider and the Nightlight theme.
- Remote control needs both devices online (signalling via the public PeerJS server). Everything else works offline.
