<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/png/lockup.png">
    <img src="brand/png/lockup-on-light.png" alt="rollover" width="320">
  </picture>
</p>

<h3 align="center">Gives you a second chance.<br>Because some moments are special.</h3>

<p align="center">
  <a href="https://martinjsklorz.github.io/rollover/"><b>Try it in your browser</b></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/martinjsklorz/rollover/actions/workflows/ci.yml"><img src="https://github.com/martinjsklorz/rollover/actions/workflows/ci.yml/badge.svg" alt="CI" align="center"></a>
</p>

<p align="center">
  <img src="docs/new-years-eve.gif" alt="The clock counts 23:59:55 down to midnight in neon pink, and fireworks burst over 00:00:00" width="800">
</p>

Midnight happens once a year, and it's over in a second. The champagne pops early, the camera
isn't rolling, the kids fell asleep at ten, or you were looking at your phone when it happened.

**Rollover brings it back.** A full-screen clock that runs up to midnight, rolls over, and does it
again: 23:59:55, 00:00:00, fireworks, and once more from the top. As often as you like.

## Made for the moment

- **The take you missed.** Filming your New Year's video? Put the phone in the shot and count down
  as many times as you need. A stray tap won't stop the clock: going back takes two taps.
- **Midnight at eight.** Little ones can't stay up? Give them their countdown at bedtime,
  fireworks and all.
- **Any midnight.** A birthday, a launch, a proposal, a toast across time zones. Every big
  "now" deserves a clock that hits zero.

## Pick your midnight

| Classic | Champagne | Midnight blue, flip clock |
| :---: | :---: | :---: |
| ![Classic: white digits, ember fireworks](docs/classic.png) | ![Champagne: gold digits, golden fireworks](docs/champagne.png) | ![Midnight blue: ice-blue split-flap cards, silver and blue fireworks](docs/midnight-blue-flip.png) |
| White digits, ember fireworks | Gold digits, golden fireworks | Ice-blue split-flap cards |

Plus **Party**, in neon pink with fireworks in every color (that's the one at the top).

**Birthday?** Pick it as the occasion and the clock goes candy-colored (Bubblegum pink, Sky blue or
pastel Sprinkles), balloons float up at midnight, and "Happy birthday, Mia!" fades in under the digits.

- **Simple or flip clock.** Thin glowing digits, or split-flap cards that flip like the real thing.
- **24-hour or 12-hour.** 23:59:59 → 00:00:00, or 11:59:59 PM → 12:00:00 AM.
- **Your timing.** 5 to 60 seconds before midnight, 5 to 60 seconds after. Then it loops.
- **Fireworks, confetti or balloons.** At the stroke of midnight, rockets go up and burst over the clock,
  confetti pops from the corners and rains down, or balloons float up, until the loop starts over.
- **In your language.** English, Chinese, Spanish, Hindi, Portuguese, French, German, Japanese, Russian,
  Korean, Indonesian, Turkish, Italian, Polish, Ukrainian and Dutch, following your phone or browser.
- **Made for the big screen.** Full screen, the screen stays on, true black for OLED. Prop up a
  phone, or run it on the TV: there's an app for Apple TV and Android TV (Google TV), driven by the remote.

Set it up in under a minute: one question per page, with a live preview on every one.
Next time, it's one tap on Start.

**iPhone, Android, Apple TV, Android TV and the web.** [Open it in your browser](https://martinjsklorz.github.io/rollover/), nothing to install.

---

## For developers

The first screen shows the logo and Start, which runs the clock with your last settings,
or starts the setup wizard. The first time, only the wizard is offered.

The wizard has one page per setting, with a live preview on every page. It starts with the occasion
(`src/occasions.ts`), which decides the pages and options that follow:

| Occasion | Themes | Animations (first is the default) | Extra |
| --- | --- | --- | --- |
| Classic | Classic only, so no theme page | fireworks, confetti, none | |
| New Year's Eve | Champagne, Midnight blue, Party | fireworks, confetti, none | |
| Birthday | Bubblegum, Sky, Sprinkles | balloons, confetti, none | a name, shown under the clock at midnight |

Then: 24-hour or 12-hour, simple or flip-clock style, the theme, how long before midnight and how long
after it (5 to 60 s each, e.g. −5 / +10), and the midnight animation. It plays over the clock from
00:00:00 until the loop starts over.
Then the clock runs full screen on a loop: the screen stays on, the system bars are hidden,
and two taps go back to the setup (the first shows a hint, so a stray touch doesn't end a take).
On a TV, Select works like a tap and the remote's Back button goes back right away.

Built with [Expo](https://expo.dev) (React Native) and Expo Router for iOS and Android, and for
Apple TV and Android TV with [react-native-tvos](https://github.com/react-native-tvos/react-native-tvos)
(see [TV](#tv)).

```
src/app/            screens (Expo Router): index (home), setup/[step], ready, clock
src/wizard/steps.ts the wizard steps; add a setting by adding a step
src/occasions.ts    Classic, New Year's Eve, Birthday: the themes and animations each one offers
src/wizard/ui.tsx   wizard page layout, option cards, buttons
src/clock/          the clock face (simple / flip), the loop timing, the birthday greeting, the midnight
                    fireworks, confetti and balloons
src/settings.tsx    settings, defaults, saved on the device (AsyncStorage)
src/theme.ts        brand colors used by the app, and the clock themes
src/i18n/           the app's languages (one file each, translated from languages/en.ts) and the device-language pick
src/tv.ts           TV helpers: sizes doubled on Apple TV, the remote's Back button, overscan margins
brand/              logo, colors, type and usage rules (brand/README.md); brand/tools builds the icons
docs/               README images (screenshots and the New Year's Eve GIF from the web build)
```

### Run

```bash
corepack enable   # once; provides the pnpm version pinned in package.json
pnpm install
pnpm start        # scan the QR code with Expo Go on your iPhone or Android phone
pnpm typecheck
pnpm lint         # ESLint with eslint-config-expo (eslint.config.js)
```

Add Expo modules with `pnpm exec expo install <package>`, so the versions match the Expo SDK.

### CI and GitHub Pages

`.github/workflows/ci.yml` runs on every push and pull request: typecheck, lint, `expo-doctor` and a
TV prebuild (which checks the TV config and artwork in `app.json`). Pushes to `main` also build iOS, Android and web. They publish the web build to GitHub Pages.

The web build lives under `/rollover` (`experiments.baseUrl` in `app.json`). `public/index.html` is
the page template and keeps the page black before the app loads; it links `public/manifest.json`
and the web icons with the `/rollover` prefix written out, because Expo copies `public/` as is.
The export is a single-page app, so CI copies `index.html` to one `.html` file per route
(`ready.html`, `setup/format.html`, …) and GitHub Pages answers deep links and reloads with 200.
`404.html` catches anything else.

### Builds and over-the-air updates

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

### TV

`react-native` in `package.json` is [react-native-tvos](https://github.com/react-native-tvos/react-native-tvos),
a fork of React Native that also builds for Apple TV and Android TV. It builds phone apps the same as
React Native. The `@react-native-tvos/config-tv` plugin in `app.json` makes `expo prebuild` generate TV
projects when `EXPO_TV=1` is set, so one native project is either phone or TV, never both:

```bash
pnpm tv:ios       # prebuild for Apple TV, then run it in the Apple TV simulator
pnpm tv:android   # prebuild for Android TV, then run it on an Android TV emulator (API 31+)
pnpm exec expo prebuild --clean   # back to phone projects
```

Prebuild changes the `ios` and `android` scripts in `package.json` to `expo run:*`; don't commit that.
Expo Go doesn't run on a TV, so TV apps are always development builds.

- **Remote.** Every screen sets where the remote's focus starts (`hasTVPreferredFocus`), and buttons and
  options show the focus (white fill, white outline). The remote's Back button goes back; on the home
  screen it leaves the app, as Apple TV requires.
- **Sizes.** Android TV lays out at 960×540 dp, like a phone on its side. Apple TV lays out at 1920×1080
  points, so there `sizedStyles` doubles every size and `useScreenSize` halves the window (`src/tv.ts`).
- **Artwork.** `brand/tools` builds the Android TV banner and the Apple TV layered icon and top shelf
  images into `assets/tv/`. Apple checks the sizes exactly.
- **Builds.** `eas.json` has a `_tv` profile for each build profile (`EXPO_TV=1`):
  `pnpm dlx eas-cli@latest build --profile production_tv`. Apple TV uses the iPhone app's bundle ID and
  certificate but needs its own tvOS provisioning profile, which EAS can't create: make it in the Apple
  Developer portal and use [local credentials](https://docs.expo.dev/app-signing/local-credentials/).
- **Samsung (Tizen) and LG (webOS)** TVs aren't supported by React Native; their browsers run the web version.
