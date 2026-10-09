# Vauclair — Haute Horlogerie

A concept website for a fictional Swiss luxury watch maison, inspired by brands like Audemars Piguet.

## Run it locally

```bash
git clone https://github.com/Shrreyasdiaries/Claude-make.git
cd Claude-make
git checkout claude/watch-brand-website-3jsbbx
npm install
npm run dev
```

Then open **http://localhost:5173**.

## What's inside

- **Loader** with a counter, then the hero wordmark and watch animate in
- **Hero**: the section pins while you scroll. The wordmark breaks apart, the watch grows and drifts, and it tilts in 3D with your cursor
- **Live watch**: drawn entirely as an SVG in code. The hands show the real time with a sweeping seconds hand, and the date window shows today's date
- **Exploded calibre**: scroll to separate the crystal, bezel, hands, dial, case and the moving movement into 3D layers
- **Manifesto**: words light up as you read
- **Collection**: five dial variants in a pinned horizontal scroll (stacked vertically on mobile)
- Velocity-reactive marquee, count-up numbers, a timeline that draws itself, a custom cursor, magnetic buttons

Stack: Vite · GSAP + ScrollTrigger · Lenis smooth scroll. No image assets.

---

# Aram Architects

A second concept site, in `aram/`: an architecture studio whose projects are shown as isometric models on plinths, all drawn in code.

Run it with `npm run aram` (after `npm install`), then open **http://localhost:5173**.
You can also open `aram/index.html` directly in a browser, since it is a single self-contained file.

- **Hero**: a line drawing of a house draws itself, then on scroll it fills in as a solid model, the sky turns to dusk and the windows light up
- **Selected works**: five project panels pinned on screen, each one wiping up over the last
- **Index of works**: hover a row to see a floating preview of that model
- **Approach**: a site plan that builds up in four layers (site, light, mass, material) as you scroll
- Live local time for the Mumbai, Dubai and Lisbon studios, and a copy-email button
