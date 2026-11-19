# Rollover — Product Brief

> **Midnight, whenever you need it.**
> Rollover is a beautiful clock that rolls over to a day that matters — on cue, again and again.

## 1. Origin

The prototype was built for one moment: recording a baby turning one. The phone lay
next to her on the bed while she slept, and the camera captured the clock rolling over
midnight onto her birthday.

The insight hiding in that story: **the moment the date changes is emotional, but
midnight itself is inconvenient.** Babies sleep at 19:00, kids can't stay up, the
light is wrong, the camera wasn't rolling, you missed it by two seconds. Rollover
decouples *the moment* from *the actual time*: you stage the rollover whenever the
scene is right, and you can repeat it until the take is perfect.

## 2. Audience

| Who | Job to be done | What they need from Rollover |
|---|---|---|
| **Parents of babies & toddlers** (core) | Capture "she's officially one" while she sleeps | Night-safe dim display that won't wake anyone, no sound, a big legible clock on camera, birthday date roll, a message reveal, looping for retakes |
| **Families on New Year's Eve** | "Fake midnight" countdown for kids who can't stay up until 00:00 | Dec 31 → Jan 1 rollover at 19:30, big 10-second countdown, celebration burst, chime |
| **Birthday surprises & content creators** | "It's officially my birthday" reels, surprise videos, transitions | Stylish themes that look great on camera, built-in camera recording with a clock overlay, retakes |
| **Couples & milestones** | Anniversaries, sobriety "1 year" days, due dates, retirement, last day at work | Custom message, any date, share a prepared moment via link |
| **Theatre, film & escape rooms** | A prop clock that hits midnight on cue (hello, Cinderella) | Any target time (not only midnight), remote trigger from another device, fullscreen, no UI chrome |
| **Night owls & real-midnight fans** | Watch/record the real rollover | Live mode with the true time and the same celebration at the real 00:00 |

### Design principles derived from the audience
1. **The camera is the audience.** Nothing on screen but the clock while running. Big digits, high contrast, no flicker.
2. **Don't wake the baby.** Dark by default, red-shifted night theme, in-app dimmer, silence and haptics off by default.
3. **Hands off.** Start with a delay so you can place the phone; control it from a second device.
4. **Retakes are free.** Every run can loop: lead-in → rollover → hold → again.
5. **Works everywhere, offline.** Phone, tablet, laptop, TV browser. Installable. No account.

## 3. Design

**Identity:** dark, calm, nocturnal. The UI is a *studio*: the live clock preview fills
the screen and a glass control sheet sits on top. What you see is what the camera will see.

**The rollover moment** is the hero animation: every digit that changes rolls upward like
an odometer; at midnight all six digits roll at once, the date line rolls to the new day,
and the message fades in.

**Themes** (each tuned for camera):
- **Nightlight** — deep ember red on true black. Least disruptive light for sleepers. Default.
- **Bedside** — soft white thin digits, the classic modern bedside clock.
- **Flip** — split-flap cards that physically flip.
- **LCD** — retro seven-segment alarm clock with ghost segments.
- **Neon** — glowing pink/cyan tubes for parties and reels.
- **Keepsake** — warm paper, elegant serif. Looks like a printed memory.

**Screens:** Studio (setup + preview) → Run (fullscreen clock) · Camera (record with overlay) · Remote (controller on second device).

## 4. Scope

### v1 (this release)
- **Staged rollover:** target date + time (default 00:00), lead-in (10s – 5min), hold time, loop forever.
- **Live mode:** the real clock, celebrating at the real target.
- **Moment presets:** Birthday, New Year, Anniversary, Milestone, Custom (Cinderella-style any time).
- **Title + reveal message** ("Mia" · "One year old today ✨").
- **Six themes**, 12/24h, seconds on/off, date line on/off.
- **Celebration:** confetti / glow burst, optional synthesized chime and ticks, optional 10-second big countdown.
- **Hands-off start:** "Start in 5/10/30s", screen wake lock, fullscreen, auto-hiding controls, dimmer, burn-in pixel shift.
- **Camera mode:** record video with the rolling clock burned in (camcorder-timestamp or clean style), download/share.
- **Remote:** pair a second phone via QR code (peer-to-peer) to start/restart/pause/dim.
- **Saved moments & share links:** the whole setup lives in the URL.
- **Platforms:** installable offline PWA (iOS, Android, desktop) + Capacitor shells for the App Store / Play Store.

### Later
- Multi-device sync (several clocks rolling together), custom fonts/colors, scheduled real-time reminders,
  Apple Watch / Wear OS faces, export as transparent overlay video for editors.

### Explicitly out
- Accounts, cloud storage, analytics, ads. Unit tests are deprioritised for v1.
