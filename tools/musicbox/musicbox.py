#!/usr/bin/env python3
"""Music box synthesizer, pure Python standard library (no numpy needed).

Renders the tune each occasion plays at midnight (settings.sound = 'musicbox') into
assets/sounds/<occasion>.wav: 16-bit stereo PCM at 44.1 kHz.

    pnpm sounds                                     (all occasions)
    python3 tools/musicbox/musicbox.py [occasion ...]

Model: each comb tine is a small steel cantilever beam plucked by a pin.
  1. Modal synthesis: every note is a sum of exponentially decaying sine
     partials at inharmonic ratios (clamped-free beam: 1, 6.27, 17.55)
     plus a few weak near-harmonic ones from the tuning weights.
  2. Higher partials and higher notes decay faster.
  3. A hammer-like knock ~10 ms before every tone (the pin striking the tine).
  4. Small random detune/timing/velocity so it doesn't sound like MIDI.
  5. Stereo pan by pitch (tines are laid out low->high on the comb).
  6. Schroeder reverb for the wooden box and the room.
  7. A quiet clockwork bed (air-brake whirr, gear ticks, spring rumble)
     that winds down after the last note.

Every melody is traditional and in the public domain; only the melody is used, no lyrics and no
recording. Change the notes or the sound here, not in the WAV files. Sources are in the README.
"""
import array
import math
import os
import random
import sys
import wave

SR = 44100
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "assets", "sounds")

# (frequency ratio, relative amplitude, decay speed multiplier)
PARTIALS = [
    (1.00, 1.00, 1.0),   # fundamental: long ring
    (2.00, 0.15, 1.8),   # octave: adds warmth
    (3.01, 0.05, 2.5),
    (6.27, 0.10, 9.0),   # 2nd beam mode: the metallic "ting" (kept short and quiet)
    (17.55, 0.02, 25.0), # 3rd beam mode: barely-there sparkle on the attack
]


def midi_to_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def note_name_to_midi(name):
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    pitch = names[name[0]]
    rest = name[1:]
    if rest.startswith("#"):
        pitch += 1
        rest = rest[1:]
    elif rest.startswith("b"):
        pitch -= 1
        rest = rest[1:]
    return 12 * (int(rest) + 1) + pitch


def make_tine():
    """One tine's fixed imperfections: how far its partials sit from the ideal ratios.

    A real comb is tuned by hand (filing the tine tip), so every tine is a little off,
    and always by the same amount: a repeated note keeps its own slightly-off pitch.
    """
    cents = max(-TINE_DETUNE_MAX, min(TINE_DETUNE_MAX, random.gauss(0, TINE_DETUNE_CENTS)))
    base = 2 ** (cents / 1200)
    return [base * (1 + random.uniform(-0.0015, 0.0015)) for _ in PARTIALS]  # partials ~2.5 cents apart


def render_note(freq, velocity, tine):
    """Return a mono list of samples for one plucked tine."""
    # Fundamental decay: low tines ring ~4 s, high tines ~1 s.
    t60 = max(0.6, min(4.5, 3.0 * (523.0 / freq) ** 0.6))
    length = int(SR * t60 * 1.1)
    out = [0.0] * length

    # A plucked tine starts slightly sharp (a big swing makes the steel stiffer) and settles:
    # the harder the pluck, the bigger the glide.
    glide_cents = GLIDE_CENTS * velocity * random.uniform(0.7, 1.3)
    glide_len = int(SR * GLIDE_TIME * 5)

    for (ratio, amp, decay_mul), offset in zip(PARTIALS, tine):
        f = freq * ratio * offset
        if f * 2 ** (glide_cents / 1200) > SR * 0.45:
            continue
        # Damped resonator: y[n] = 2 r cos(w) y[n-1] - r^2 y[n-2]
        # gives a sine whose amplitude falls 60 dB in t60/decay_mul seconds.
        r = 10 ** (-3 / (SR * t60 / decay_mul))
        w = 2 * math.pi * f / SR
        c1 = 2 * r * math.cos(w)
        c2 = -r * r
        y1 = amp * velocity * math.sin(w)   # start at phase 0
        y2 = 0.0
        n_active = min(length, int(SR * t60 / decay_mul) + 1)
        n_glide = min(n_active, glide_len)
        k = -1 / (SR * GLIDE_TIME)
        for n in range(n_glide):            # pitch settling: the coefficient follows the glide
            out[n] += y2
            cg = 2 * r * math.cos(w * 2 ** (glide_cents * math.exp(n * k) / 1200))
            y1, y2 = cg * y1 + c2 * y2, y1
        for n in range(n_glide, n_active):
            out[n] += y2
            y1, y2 = c1 * y1 + c2 * y2, y1

    # 1-2 ms attack ramp so the onset doesn't click digitally.
    ramp = int(SR * 0.0015)
    for n in range(ramp):
        out[n] *= n / ramp

    # Hammer knock first; the tone rings out HAMMER_LEAD seconds later.
    lead = int(SR * HAMMER_LEAD)
    full = [0.0] * (lead + length)
    for n, s in enumerate(render_hammer(velocity)):
        full[n] += s
    for n, s in enumerate(out):
        full[lead + n] += s
    return full


def bandpass(x, f, q):
    """RBJ biquad band-pass (0 dB peak)."""
    w0 = 2 * math.pi * f / SR
    alpha = math.sin(w0) / (2 * q)
    a0 = 1 + alpha
    b0, b2 = alpha / a0, -alpha / a0
    a1, a2 = -2 * math.cos(w0) / a0, (1 - alpha) / a0
    out = [0.0] * len(x)
    x1 = x2 = y1 = y2 = 0.0
    for n, xn in enumerate(x):
        y = b0 * xn + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, xn, y1, y
        out[n] = y
    return out


def lowpass(x, f):
    """One-pole low-pass."""
    k = 1 - math.exp(-2 * math.pi * f / SR)
    out = [0.0] * len(x)
    y = 0.0
    for n, xn in enumerate(x):
        y += k * (xn - y)
        out[n] = y
    return out


def render_hammer(velocity):
    """Hammer-like knock of the pin striking the tine: snap + knock + thump."""
    length = int(SR * 0.06)
    out = [0.0] * length
    knock = 650 * random.uniform(0.92, 1.08)    # felt-ish hammer head
    thump = 180 * random.uniform(0.92, 1.08)    # wooden box body
    prev = 0.0
    for n in range(length):
        t = n / SR
        noise = random.uniform(-1, 1) * math.exp(-t / 0.0007)
        s = 0.4 * (noise - prev)                                            # snap
        s += 0.6 * math.sin(2 * math.pi * knock * t) * math.exp(-t / 0.004)
        s += 0.5 * math.sin(2 * math.pi * thump * t) * math.exp(-t / 0.012)
        prev = noise
        out[n] = HAMMER_LEVEL * velocity * s
    return out


class Cylinder:
    """The pinned cylinder's uneven turning, as a map from score time to real time.

    Its speed is set by a spring and an air-brake governor, so it is never quite steady:
    the governor hunts around its set speed (a slow wobble plus a faster flutter), and
    the spring loses tension as it unwinds, so the tune slows a little towards the end.
    """

    STEP = 0.001  # seconds of score time per table entry

    def __init__(self, duration):
        phase1 = random.uniform(0, 2 * math.pi)
        phase2 = random.uniform(0, 2 * math.pi)
        rate1 = WOBBLE_HZ * random.uniform(0.8, 1.2)
        rate2 = FLUTTER_HZ * random.uniform(0.8, 1.2)
        steps = int(duration / self.STEP) + 2
        self.real = [0.0] * steps   # real time at each step of score time
        self.speed = [1.0] * steps  # relative cylinder speed there
        t = 0.0
        for i in range(steps):
            tau = i * self.STEP
            s = (1 + WOBBLE * math.sin(2 * math.pi * rate1 * tau + phase1)
                 + FLUTTER * math.sin(2 * math.pi * rate2 * tau + phase2)
                 - RUN_DOWN * min(1.0, tau / duration) ** 2)
            self.real[i] = t
            self.speed[i] = s
            t += self.STEP / s

    def time(self, tau):
        """Real seconds (from the first note) at which score time `tau` is played."""
        i = min(len(self.real) - 2, int(tau / self.STEP))
        frac = tau / self.STEP - i
        return self.real[i] + frac * (self.real[i + 1] - self.real[i])

    def speed_at(self, t):
        """Relative speed at real time `t` (seconds from the first note); held after the end."""
        lo, hi = 0, len(self.real) - 1
        if t >= self.real[hi]:
            return self.speed[hi]
        while hi - lo > 1:
            mid = (lo + hi) // 2
            if self.real[mid] <= t:
                lo = mid
            else:
                hi = mid
        return self.speed[lo]


def render_mechanism(length, stop, cylinder):
    """Clockwork bed: spinning air-brake whirr, gear ticks, spring rumble.

    Runs at the cylinder's (wobbling) speed until `stop - 1.2 s`, then winds down
    to a halt at `stop`. Returned normalized to RMS 1.
    """
    slow_start = stop - 1.2
    drive = [cylinder.speed_at(i / 100 - START) for i in range(int(length / SR * 100) + 2)]  # every 10 ms

    def speed(t):
        if t < 0.15:                      # spring kicks in
            return t / 0.15
        if t < slow_start:
            return drive[int(t * 100)]
        return drive[int(t * 100)] * max(0.0, 1 - (t - slow_start) / (stop - slow_start)) ** 1.5

    noise = [random.uniform(-1, 1) for _ in range(length)]
    whirr = bandpass(noise, 650, 1.2)
    rumble = lowpass(noise, 120)
    out = [0.0] * length

    fan_phase = 0.0   # air brake ("fly") spins ~28 rev/s
    gear_phase = 0.0  # gear teeth engage ~9 times/s
    ticks = []
    for n in range(length):
        sp = speed(n / SR)
        fan_phase += 2 * math.pi * 28 * sp / SR
        gear_phase += 9 * sp / SR
        if gear_phase >= 1.0:
            gear_phase -= 1.0
            ticks.append((n, random.uniform(0.5, 1.0)))
        am = 0.6 + 0.4 * math.sin(fan_phase)
        out[n] = sp * (whirr[n] * am * 1.0 + rumble[n] * 2.0)

    tick_len = int(SR * 0.003)
    tick_shape = bandpass([random.uniform(-1, 1) * math.exp(-i / (SR * 0.0005))
                           for i in range(tick_len)], 4000, 2.0)
    for pos, level in ticks:
        sp = speed(pos / SR)
        for i, s in enumerate(tick_shape):
            if pos + i < length:
                out[pos + i] += 0.8 * level * sp * s

    rms = math.sqrt(sum(s * s for s in out) / length) or 1.0
    return [s / rms for s in out]


class Comb:
    def __init__(self, delay, feedback, damp):
        self.buf = [0.0] * delay
        self.i = 0
        self.fb = feedback
        self.damp = damp
        self.lp = 0.0

    def process(self, x):
        y = self.buf[self.i]
        self.lp = y * (1 - self.damp) + self.lp * self.damp
        self.buf[self.i] = x + self.lp * self.fb
        self.i = (self.i + 1) % len(self.buf)
        return y


class Allpass:
    def __init__(self, delay, g=0.5):
        self.buf = [0.0] * delay
        self.i = 0
        self.g = g

    def process(self, x):
        b = self.buf[self.i]
        y = -x + b
        self.buf[self.i] = x + b * self.g
        self.i = (self.i + 1) % len(self.buf)
        return y


def reverb(signal, spread, wet=0.10):
    combs = [Comb(d + spread, 0.70, 0.45) for d in (1557, 1617, 1491, 1422)]  # damp = darker tail
    aps = [Allpass(d + spread) for d in (225, 556)]
    out = array.array("d", signal)
    for n, x in enumerate(signal):
        s = sum(c.process(x) for c in combs) * 0.25
        for ap in aps:
            s = ap.process(s)
        out[n] = x * (1 - wet) + s * wet
    return out


# ---------- the tunes: (sixteenth-note tick, note) ----------

# The Westminster Quarters (Cambridge, 1793): the full-hour chime, changes 2, 3, 4 and 5, each three
# crotchets and a minim. Big Ben plays it in E major; here it's in A major, an octave and a fourth up.
WESTMINSTER = [
    (0, "A5"), (4, "C#6"), (8, "B5"), (12, "E5"),
    (20, "A5"), (24, "B5"), (28, "C#6"), (32, "A5"),
    (40, "C#6"), (44, "A5"), (48, "B5"), (52, "E5"),
    (60, "E5"), (64, "B5"), (68, "C#6"), (72, "A5"),
]

# "Auld Lang Syne", the traditional Scots melody (George Thomson, Select Songs of Scotland, 1799):
# the first phrase, "Should auld acquaintance be forgot, and never brought to mind?", in F major.
AULD_LANG_SYNE = [
    (0, "C5"),
    (4, "F5"), (10, "F5"), (12, "F5"), (16, "A5"),
    (20, "G5"), (26, "F5"), (28, "G5"), (32, "A5"),
    (36, "F5"), (42, "F5"), (44, "A5"), (48, "C6"),
    (52, "D6"),
]

# "Happy Birthday to You" (the melody of the Hill sisters' "Good Morning to All", 1893),
# in C, 3/4 waltz accompaniment. Transposed up an octave: music boxes sit high.
HAPPY_BIRTHDAY = [
    # pickup "Hap-py"
    (0, "G4"), (3, "G4"),
    # "birth-day to" | C
    (4, "A4"), (8, "G4"), (12, "C5"),
    (4, "C3"), (8, "E3"), (8, "G3"), (12, "E3"), (12, "G3"),
    # "you, hap-py" | G7
    (16, "B4"), (24, "G4"), (27, "G4"),
    (16, "G2"), (20, "F3"), (20, "B3"), (24, "F3"), (24, "B3"),
    # "birth-day to" | G7
    (28, "A4"), (32, "G4"), (36, "D5"),
    (28, "G2"), (32, "F3"), (32, "B3"), (36, "F3"), (36, "B3"),
    # "you, hap-py" | C
    (40, "C5"), (48, "G4"), (51, "G4"),
    (40, "C3"), (44, "E3"), (44, "G3"), (48, "E3"), (48, "G3"),
    # "birth-day dear" | C
    (52, "G5"), (56, "E5"), (60, "C5"),
    (52, "C3"), (56, "E3"), (56, "G3"), (60, "E3"), (60, "G3"),
    # "[name], hap-py" | F
    (64, "B4"), (68, "A4"), (72, "F5"), (75, "F5"),
    (64, "F2"), (68, "A3"), (68, "C4"), (72, "A3"), (72, "C4"),
    # "birth-day to" | C G7
    (76, "E5"), (80, "C5"), (84, "D5"),
    (76, "C3"), (80, "E3"), (80, "G3"), (84, "G2"), (84, "F3"), (84, "B3"),
    # "you!" | C
    (88, "C5"), (88, "C3"), (88, "E3"), (88, "G3"), (88, "C4"),
]

# "Mo Li Hua" (Jasmine Flower), the traditional Chinese folk song (first printed in the West in John
# Barrow's Travels in China, 1804): "好一朵美丽的茉莉花", "芬芳美丽满枝桠", "又香又白人人夸",
# in 2/4, pentatonic on F. The opening line is sung twice; here it's played once.
JASMINE_FLOWER = [
    (0, "A5"), (4, "A5"), (6, "C6"), (8, "D6"), (10, "F6"), (12, "F6"), (14, "D6"),
    (16, "C6"), (20, "C6"), (22, "D6"), (24, "C6"),
    (32, "C6"), (36, "C6"), (40, "C6"), (44, "A5"), (46, "C6"),
    (48, "D6"), (52, "D6"), (56, "C6"),
    (64, "A5"), (68, "G5"), (70, "A5"), (72, "C6"), (76, "A5"), (78, "G5"),
    (80, "F5"), (84, "F5"), (86, "G5"), (88, "F5"),
]

# occasion: (score, seconds per sixteenth, transpose in semitones)
SONGS = {
    "classic": (WESTMINSTER, 0.09, 0),
    "newyear": (AULD_LANG_SYNE, 0.105, 0),
    "birthday": (HAPPY_BIRTHDAY, 0.16, 12),
    "lunar": (JASMINE_FLOWER, 0.085, 0),
}
START = 0.4          # clockwork spins up before the first note
MECH_LEVEL_DB = -30  # clockwork noise relative to the music's RMS
HAMMER_LEAD = 0.010  # hammer knock comes this long before each tone
HAMMER_LEVEL = 0.5   # knock loudness relative to the tone (velocity 1 = 1.0)
TAIL = 6.0           # seconds rendered after the last note
SILENCE_DB = -60     # the file ends where both channels stay below this (relative to the peak) ...
FADE_OUT = 0.3       # ... with a short fade, so it never stops on a click

# A real music box is never exact:
TINE_DETUNE_CENTS = 4   # each tine is hand-tuned, so a little off (std. dev.; always the same for that tine)
TINE_DETUNE_MAX = 9     # ... but never further than this
GLIDE_CENTS = 7         # a hard pluck starts this much sharp and settles ...
GLIDE_TIME = 0.035      # ... with this time constant (seconds)
PIN_JITTER = 0.006      # each pin is bent a little: early or late by this much (std. dev., seconds) ...
PIN_JITTER_MAX = 0.016  # ... at most this much
WOBBLE = 0.025          # the governor hunts: cylinder speed swings +-2.5 % ...
WOBBLE_HZ = 0.35        # ... about this often
FLUTTER = 0.008         # plus a faster, smaller flutter from the gear train
FLUTTER_HZ = 1.7
RUN_DOWN = 0.05         # the spring loses tension: 5 % slower by the last note


def render(name):
    score, tick_len, transpose = SONGS[name]
    random.seed(name)  # each file comes out the same on every rebuild

    duration = max(tick for tick, _ in score) * tick_len
    cylinder = Cylinder(duration)
    tines = {}
    last_note = START + cylinder.time(duration) + PIN_JITTER_MAX
    total = int(SR * (last_note + TAIL))
    left = [0.0] * total
    right = [0.0] * total

    # Pan around the middle of this tune's range, so a melody without a bass isn't all on one side.
    midis = [note_name_to_midi(n) + transpose for _, n in score]
    centre = (min(midis) + max(midis)) / 2

    for tick, note in score:
        midi = note_name_to_midi(note) + transpose
        freq = midi_to_hz(midi)
        vel = random.uniform(0.75, 1.0)
        if midi not in tines:
            tines[midi] = make_tine()
        pin = max(-PIN_JITTER_MAX, min(PIN_JITTER_MAX, random.gauss(0, PIN_JITTER)))
        # Shift back by the hammer lead so the tone itself lands where the cylinder plays it.
        start = int(SR * (START + cylinder.time(tick * tick_len) + pin - HAMMER_LEAD))
        samples = render_note(freq, vel, tines[midi])
        pan = min(1.0, max(0.0, 0.5 + (midi - centre) / 50))  # low -> left, high -> right
        gl = math.cos(pan * math.pi / 2)
        gr = math.sin(pan * math.pi / 2)
        for i, s in enumerate(samples):
            j = start + i
            if j >= total:
                break
            left[j] += s * gl
            right[j] += s * gr

    # Clockwork bed under the music, scaled relative to the music's loudness.
    a, b = int(SR * START), int(SR * last_note)
    music_rms = math.sqrt(sum(left[i] ** 2 + right[i] ** 2 for i in range(a, b)) / (2 * (b - a)))
    mech_gain = music_rms * 10 ** (MECH_LEVEL_DB / 20)
    mech = render_mechanism(total, stop=last_note + 1.5, cylinder=cylinder)
    for i, s in enumerate(mech):
        left[i] += s * mech_gain
        right[i] += s * mech_gain

    left = reverb(left, 0)
    right = reverb(right, 23)  # slightly different delays = stereo width

    peak = max(max(abs(x) for x in left), max(abs(x) for x in right)) or 1.0
    gain = 0.9 / peak

    # Trim the silent tail, then fade the last FADE_OUT seconds.
    quiet = peak * 10 ** (SILENCE_DB / 20)
    end = total
    while end > b and abs(left[end - 1]) < quiet and abs(right[end - 1]) < quiet:
        end -= 1
    end = min(total, end + int(SR * FADE_OUT))
    fade = int(SR * FADE_OUT)

    pcm = array.array("h")
    for n in range(end):
        g = gain * min(1.0, (end - n) / fade)
        pcm.append(int(left[n] * g * 32767))
        pcm.append(int(right[n] * g * 32767))

    path = os.path.join(OUT_DIR, f"{name}.wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{name}.wav  {end / SR:.1f} s  {round(os.path.getsize(path) / 1024)} KB")


def main():
    names = sys.argv[1:] or list(SONGS)
    for name in names:
        if name not in SONGS:
            sys.exit(f"unknown occasion {name!r}, expected one of: {', '.join(SONGS)}")
    os.makedirs(OUT_DIR, exist_ok=True)
    for name in names:
        render(name)


if __name__ == "__main__":
    main()
