# Wright Click Studio — wrightclickstudio.com

A static marketing site for the studio. No build step, no framework, no
dependencies: three files and a browser.

```
index.html            the picture
css/site.css          art direction
js/site.js            motion + behaviour
privacy-policy.html   studio privacy policy
terms-of-service.html studio terms
```

Open `index.html`, or serve the folder (`python3 -m http.server 8000`) and
visit <http://localhost:8000>.

---

## The idea

**The Web, Directed.** The name's second half is the throwaway pun; the first
half is the brand. A *wright* is a maker — shipwright, playwright, wheelwright
— someone who builds a thing that carries other people somewhere. So the site
is staged as a picture:

| Section | Plays as |
| --- | --- |
| Title card | Cold open, letterbox, studio ident |
| The Reel | A filmstrip of the formats we shoot |
| Departments | Crew list — Direction, Design, Engineering, Motion, Release |
| Interlude | Title-card statement + the four numbers we'll stand behind |
| Production | The call sheet: four phases, what you get from each |
| The Studio | Where the name comes from, and how we work |
| End card | The production brief |

**The signature mechanic is a key light.** One tungsten source tracks the
pointer with a bit of lag (it has mass). It lights the page *and* the headline
letters themselves — `.lit` paints its type from a radial gradient whose centre
is the light, so "The Web," is hot and "Directed." falls into shadow. Warm
highlight, cool shadow: that's how a scene gets graded, and it's what keeps the
page from reading as another dark-mode gradient template.

Supporting texture: 35 mm grain, lens vignette, letterbox gates that retract
after the ident, autofocus brackets that snap to whatever you're framing, and a
transport scrubber along the bottom with a running timecode.

---

## Things you'll want to change

**1. Wire up the form.** In `js/site.js`, section 10:

```js
const ENDPOINT = '';   // ← paste your Formspree / Basin / Netlify URL
```

Leave it empty and the form composes a pre-filled mail draft instead, so it's
never a dead end. Fill it in and briefs POST as JSON. Change `INBOX` too.

**2. Swap the reel for real work.** The six frames in `#reel` describe the
*formats* we build rather than naming clients — deliberately, since inventing
case studies and conversion figures for a new studio would be advertising
things that never happened. As real projects land, replace each `.frame` with
the client's name, what you did, and a real screenshot: drop an `<img>` into
`.frame-plate` in place of the `.plate-art` div. The plate art is pure CSS
(`.plate-art--*`), so there are no image assets to manage until then.

**3. The four numbers** in the interlude are commitments, not history —
zero templates, a Lighthouse target, a two-week first look, one person on the
job. They're true on day one. Edit `data-count` / `data-suffix` if you'd rather
promise something else.

**4. Pricing.** The three tiers deliberately carry no prices. To publish rates,
add `<p class="tier-price">from $X,XXX</p>` under each `<h3>` — there's a
comment marking the spot.

**5. Contact details.** `hello@wrightclickstudio.com` appears in the end card,
the footer, the JSON-LD block, and `js/site.js`. Search and replace.

**6. The legal pages** are honest boilerplate describing what this site
actually does, but they are not legal advice — have someone qualified read them
before launch, especially if you add analytics or take payments.

> `privacy.html` and `terms.html` (no hyphens) are **not** part of this site.
> They belong to a separate TikTok tool for Williamson's Chapel UMC and are
> referenced by TikTok's app review, along with the `tiktok*.txt` verification
> file. Leave all three alone.

---

## Behaviour worth knowing

- **Reduced motion** stills the entire picture — no ident, no grain jitter, no
  crawl, no wipes, and the reel becomes an ordinary horizontal scroller.
- **Touch devices** get the same native reel and no key-light chase.
- **Without JavaScript** the page still reads top to bottom: `html:not(.js)`
  rules open the gates, reveal everything, and fall the reel back to a scroller.
- **The ident plays once per session**, and any click, key, scroll or tap cuts
  it short.
- One `sessionStorage` flag (`wcs.seen`) — that's the only thing stored, and
  it's why the privacy policy can say there are no tracking cookies.

### One trap, documented so nobody re-breaks it

The reveal animation hides elements with `clip-path: inset(0 … 100% …)`.
Chromium counts `clip-path` when computing intersection ratios, so a clipped
element reports `intersectionRatio: 0` **even when it's fully on screen** — a
ratio-based `threshold` would wait forever for a reveal that only fires once the
threshold is met. The observer in `js/site.js` therefore uses `threshold: 0`
and leans on `isIntersecting`, with a timed sweep as insurance. Don't raise it.

---

## Deploying

Static hosting, nothing to build. Netlify, Cloudflare Pages, Vercel or GitHub
Pages all work — point them at the repository root. Set `wrightclickstudio.com`
as the custom domain and force HTTPS.
