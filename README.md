# Nehda & Umar — A Cinematic Wedding Invitation

A digital invitation built to feel like opening a physical one: a sealed
envelope, a wax seal that breaks, a card drawn out into the light, and a
single continuous world you then move through.

Sunday, 8 November 2026 · Gregorian Convention Centre, Punnapra, Alappuzha.

```bash
npm install
npm run dev     # http://localhost:3000
```

Everything a couple needs to change lives in **`site.config.ts`**. Names,
dates, venues, events, photos, RSVP settings and every line of copy come
from that one file. No component needs to be touched to personalise the site.

---

## The idea

Most invitation sites are a stack of themed sections. This one is a single
room where the light changes.

The background is one continuous gradient driven by scroll position —
midnight, plum, dusk, ember — with persistent film grain, a vignette and
drifting motes of light above it. The invitation itself is an ivory paper
object floating inside that world. Sections do not fade between themselves;
they are all standing in the same place while the light moves. That is what
makes the transitions feel continuous rather than sliced.

## Architecture

```
app/
  layout.tsx            fonts, metadata
  page.tsx              provider + composition
  globals.css           design tokens, base, reduced-motion gate
  api/rsvp/route.ts     RSVP persistence + optional webhook

components/
  shell/                the persistent world
    InvitationProvider  the one piece of state: sealed → opening → open
    SmoothScroll        Lenis, stopped while the envelope is sealed
    AmbientBackdrop     the scroll-driven palette journey
    Atmosphere          grain + vignette
    AudioToggle         the only persistent control
    ScrollProgress      a gold thread down the right edge
    Invitation          section order
  gate/
    OpeningScreen       the ~6s opening choreography
    Envelope3D          the envelope, its GSAP master timeline, the wax seal
  sections/             Hero · Couple · Story · Events · Venue
                        Gallery · Countdown · Rsvp · Closing
  ui/                   Reveal · SplitText · Parallax · Monogram
                        Ornament · Section · Button

lib/
  motion.ts             the animation system
  audio.ts              the audio engine
  hooks.ts              reduced motion, countdown, scroll lock
```

## Typography

`app/globals.css` holds a six-size fluid scale and seven utility classes.
Components never set a font size of their own — they pick a voice:

| class | job |
|---|---|
| `t-hero` | the couple's names, once at the top and once at the end |
| `t-display` | what each scene is called |
| `t-title` | a name inside a scene — an event, a moment |
| `t-lede` | the one italic sentence that sets a scene |
| `t-body` | everything said at normal speaking volume |
| `t-caption` / `t-micro` | captions, field labels, plate numbers |
| `t-eyebrow` | the gold small-caps label that opens a scene |

Every size is bounded by viewport **height** as well as width, so a short
screen never has its composition pushed off the bottom. Large display type
carries negative tracking, small caps carry positive — set once, in the
class, not at the call site. `.measure` and `.measure-wide` cap prose at
34ch and 46ch at every breakpoint.

## The animation system

`lib/motion.ts` is the contract. Nothing is hand-tuned at the call site.

**Easings** — `silk` for entrances, `ink` for colour and opacity, `veil` for
full-screen moves, `exit` for dismissals. No `back`, no bounce, anywhere.

**Durations** — `quick .45s`, `base .9s`, `slow 1.4s`, `cinema 2.2s`.
Entrances are slow, exits are quick: things arrive with ceremony and leave
without fuss.

**Springs** are reserved for objects with implied mass — the envelope flap,
the wax seal, a button under a thumb. Text and images never spring.

**The reveal grammar** is one vocabulary used everywhere: `riseIn` (18px),
`settleIn` for images (1.06 → 1, never past 1), `drawLine` for ornaments,
`lineReveal` for per-word text. Nothing travels more than 28px. Stagger is
40–70ms. Only `transform` and `opacity` animate — never layout.

**Reduced motion** is a single rule applied twice: JS variants collapse to a
200ms opacity fade via `motionSafe()`, and CSS animations (grain, foil,
flicker, motes) are stopped in `globals.css`. Lenis is not created at all —
smoothed scrolling is itself motion, and is a common trigger. The content is
always identical; only the movement stops.

**Nothing is typed inline.** Durations, easings, delays (`beat`), stagger
gaps, spring constants, scroll-spring constants, the opening choreography
(`overture`), the hero's entrance (`arrival`), the envelope's six beats
(`envelopeTimeline`), the three permitted loops (`loop`), the mote field and
even the Lenis scroll feel all live in `lib/motion.ts`. A grep for
`duration:` or `stiffness:` across `components/` returns nothing.

**Three loops exist, and no more.** The scroll cue (is there more below?),
the ring around "Open Invitation" (this is waiting for you), and the audio
bars (sound is actually playing). Each answers a question the guest is
asking. Everything else moves once, on arrival, and then stops.

### Why GSAP is here

GSAP drives exactly one thing: the envelope's master timeline. Six beats —
seal breaks, flap lifts, flap passes behind, card rises, card turns, camera
pushes in — each landing on a precise frame relative to the others. A
timeline expresses that; six independent springs do not. Everything else on
the site is Framer Motion.

The envelope is built from `clip-path` triangles in a single `preserve-3d`
space, so the flap genuinely passes behind the pocket rather than faking it
with `z-index`, and the folds stay crisp at any size with nothing to
download. Everything inside it is sized from one custom property, `--env`,
bounded by width *and* height — so the object scales as a unit and never
pushes the "Open" button off a short screen.

### The handover

The seam between the gate and the invitation is hidden rather than matched.
When the camera has pushed all the way into the card, a warm bloom fills the
screen; the invitation resolves underneath it; then the gate fades and the
bloom clears onto a composition that is already in place.

So the hero's first three elements — the hairline, the eyebrow, the names —
do not move when they arrive. They are in exactly the place the gate just
showed them, and they only resolve. Anything that travelled would give away
that a second screen had taken over. Only the elements the gate never showed
are allowed to rise.

Hiding the seam beats matching it pixel for pixel at five viewport sizes,
and it reads as the card opening into light.

## Scene continuity

Between every pair of scenes sits the same mark: a thread dropping from the
scene above, through a small diamond, into the scene below (`SceneBreak`).
It is the paragraph break of the invitation, and it is most of why the page
reads as one continuous evening rather than nine stacked sections. Every
junction carries it except the last — the closing opens with a flourish of
its own, and two marks in a row would stutter at the moment the page should
be letting go.

## Music

Playback never starts on its own — it begins on the tap that opens the
envelope, which is what autoplay policy requires and what good manners
require too.

- Drop a licensed track at **`public/audio/theme.mp3`** and it is used.
- If that file is absent, an ambient score is **synthesised in the browser**:
  a warm pad under sparse pentatonic notes through a generated reverb. The
  note choice is a random walk, so it never repeats and has no loop point for
  the ear to catch. Zero payload, no licensing.

Music fades out while the tab is in the background, and the mute preference
is remembered.

## RSVP

`POST /api/rsvp` writes to two sinks and succeeds if either works:

1. `RSVP_WEBHOOK_URL` — an Apps Script, Zapier hook, Slack webhook or your
   own endpoint. Set it in `.env.local`.
2. `data/rsvp.jsonl` — a local append-only log, git-ignored.

If both fail it returns 503 and the form offers a WhatsApp fallback. A
wedding site that silently drops RSVPs is worse than one with no form.

## Photography

Every picture goes through `<Photograph/>`, and that is the point: one
grade, one frame weight, one parallax law. Three layers sit over each image
— a warm multiply pulling it toward candlelight, a soft bloom in the upper
third, and an inner vignette that gives the frame weight. Unrelated images
shot on different days read as one film because nothing is allowed to be
treated differently.

The parallax is deliberately small and mathematically exact: the picture is
oversized by twice its drift and travels exactly its own overflow, so it is
flush with one edge of the frame at each end of the pass and never exposes a
gap in between.

The gallery is laid out as a photo essay rather than a grid. A uniform grid
tells the guest every picture is worth the same, which is never true — so
the plates vary in width, shape, which margin they hug, and how far they are
pushed down the page. Two run nearly edge to edge and carry the scene; the
rest are quieter. Captions sit outside the frame, numbered, the way plates
are captioned in a printed book. The overlapping rhythm is confined to large
screens, where there is room for it.

## Adding a story or photographs

Two scenes ship complete but empty, because no content was supplied for
them: `story` and `gallery` in `site.config.ts` are empty arrays.

**Nothing is commented out.** The running order in `Invitation.tsx` is
composed from the content that exists — put entries in either array and the
scene appears in the right place, with its scene-break punctuation, its
reveals and its scroll choreography already wired. Take them out again and
the page closes over the gap.

For photographs, drop files into `public/images/` and list them in
`gallery`. Any aspect ratio works; frames crop with `object-cover` and are
graded by `<Photograph/>`. The essay layout is tuned for six plates and
repeats its rhythm beyond that.

## Verified viewports

Layout is checked at 360×800, 390×844, 430×932, 768×1024 and 1440×900.
At all five: the opening screen fits without scrolling (81–131px of
headroom), there is no horizontal overflow, and no element escapes the
viewport. Mobile is the primary target throughout; desktop is the
responsive case.

## Performance notes

- Only compositor properties animate. `will-change` is set on the four
  elements the envelope actually moves, for exactly as long as they move,
  and cleared when the timeline ends.
- The flap casts its shadow as a separate static layer rather than through
  a `drop-shadow` filter, which would be re-rasterised on every frame of
  the rotation — the difference between a 60fps opening and a 40fps one.
- The content is mounted behind the gate, so fonts, images and the map
  iframe are all ready by the time the envelope finishes opening.
- Scroll-linked values pass through light springs to remove iOS momentum
  jitter.
- The map iframe is lazy and does not take the scroll until tapped — a
  full-bleed map that swallows a thumb swipe is one of the most common ways
  mobile sites annoy people.
- Mobile is the primary target throughout; desktop is the responsive case.
