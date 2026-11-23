# Rollover

[![CI](https://github.com/martinjsklorz/rollover/actions/workflows/ci.yml/badge.svg)](https://github.com/martinjsklorz/rollover/actions/workflows/ci.yml)

A clock that rolls over midnight, again and again. Try it in the browser:
**https://martinjsklorz.github.io/rollover/**

The first screen shows the logo and Start, which runs the clock with your last settings,
or starts the setup wizard. The first time, only the wizard is offered.

The wizard has one page per setting, with a live preview on every page:
24-hour or 12-hour, simple or flip-clock style, a theme (Classic, or the New Year's Eve themes Champagne,
Midnight blue and Party), how long before midnight and how long after it (5 to 60 s each, e.g. −5 / +10),
and whether fireworks go up at midnight. They burst over the clock from 00:00:00 until the loop starts over.
Then the clock runs full screen on a loop: the screen stays on, the system bars are hidden,
and a tap goes back to the setup.

Built with [Expo](https://expo.dev) (React Native) and Expo Router for iOS and Android.

```
src/app/            screens (Expo Router): index (home), setup/[step], ready, clock
src/wizard/steps.ts the wizard steps; add a setting by adding a step
src/wizard/ui.tsx   wizard page layout, option cards, buttons
src/clock/          the clock face (simple / flip), the loop timing, the midnight fireworks
src/settings.tsx    settings, defaults, saved on the device (AsyncStorage)
src/theme.ts        brand colors used by the app, and the clock themes
brand/              logo, colors, type and usage rules (brand/README.md); brand/tools builds the icons
```

## Run

```bash
corepack enable   # once; provides the pnpm version pinned in package.json
pnpm install
pnpm start        # scan the QR code with Expo Go on your iPhone or Android phone
pnpm typecheck
pnpm lint         # ESLint with eslint-config-expo (eslint.config.js)
```

Add Expo modules with `pnpm exec expo install <package>`, so the versions match the Expo SDK.

## CI and GitHub Pages

`.github/workflows/ci.yml` runs on every push and pull request: typecheck, lint, `expo-doctor`, and a
build for iOS, Android and web. Pushes to `main` publish the web build to GitHub Pages.

The web build lives under `/rollover` (`experiments.baseUrl` in `app.json`). `public/index.html` is
the page template and keeps the page black before the app loads; it links `public/manifest.json`
and the web icons with the `/rollover` prefix written out, because Expo copies `public/` as is.
The export is a single-page app, so CI copies `index.html` to one `.html` file per route
(`ready.html`, `setup/format.html`, …) and GitHub Pages answers deep links and reloads with 200.
`404.html` catches anything else.

## Builds and over-the-air updates

Store builds and OTA updates go through [EAS](https://docs.expo.dev/eas/) and need an Expo account:

```bash
pnpm dlx eas-cli@latest login
pnpm dlx eas-cli@latest init               # links the project to your account
pnpm dlx eas-cli@latest update:configure   # sets up OTA updates
pnpm dlx eas-cli@latest build              # iOS / Android builds in the cloud
pnpm dlx eas-cli@latest update             # ship JS changes to installed apps
```

OTA updates cover JavaScript and assets. A change to native code (a new native module,
a permission) needs a new store build.

`ios/` and `android/` are generated (`expo prebuild`) and not committed. Native settings live in `app.json`.
