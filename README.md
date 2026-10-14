# 2XAB Footwear — Storefront Prototype

Front-end prototype. Cart, wishlist, search and newsletter are demo-only: nothing is purchased, saved or subscribed.

## Run locally
Serve the folder with any static server (for example VS Code Live Server, or `python3 -m http.server`) and open `index.html`. Opening the file directly will work for most things but a server is recommended for consistent asset loading.

## Pages
- `index.html` — homepage: hero, single logo strip, shoe frame sequence, shop by categories, featured carousel, story, visit, follow, footer.
- `sports.html`, `casual.html`, `sneakers.html` — category destinations.
- `shop.html` — all products, with search.
- `privacy.html`, `terms.html` — placeholder legal pages (replace before launch).

## Files
- `style.css` — design tokens (top of file), sections numbered 1–19.
- `script.js` — shared behaviour plus homepage modules. `CONFIG` block at the top holds the tuning knobs.
- `CLAUDE_BRIEF.md` — original handoff brief.

## Tuning (all in one place)
- Hero artwork: `--hero-art-width`, `--hero-art-scale`, `--hero-art-x`, `--hero-art-y`.
- Hero CTA: `--hero-cta-width`, `--hero-cta-x`, `--hero-cta-y`.
- Logo marquee: `--logo-width`, `--logo-height`, `--logo-gap`, `--marquee-left-duration`, `--marquee-right-duration`.
- Featured cards: `--card-width`, `--card-gap`, `--card-scale-side`, `--card-scale-center`; speed in `CONFIG.featuredSpeed`.
- Frame sequence: scroll length `--sequence-height`; easing `CONFIG.frameEase`.
- WhatsApp: set `CONFIG.whatsappNumber` (digits, with country code). Empty = demo message.

## Assets
Expected paths (not included in the handoff ZIP; the site degrades gracefully without them):
- `assets/img/logo.png` (original) and `assets/img/logo-white.png` (transparent white version, used by the site)
- `assets/img/hero.jpg`, `assets/img/herotext.png`, `assets/img/shopby.jpg`
- `assets/img/sports.png`, `casual.png`, `sneakers.png`
- `assets/store/1.png` … `6.png`
- `assets/frames/ezgif-frame-001.jpg` … `111.jpg` (legacy folder `assets/frame/` also accepted)

Missing frames show a logo fallback panel and make only two requests. Missing images are hidden without breaking layout.

## Still placeholder — replace before launch
- Logo marquee marks are generic vector shapes. Swap in licensed white brand logos (keep viewBox 120×42, `fill="currentColor"`) when available.
- Contact details, address, prices, product names and copy are placeholders.
- Email and Instagram handles were changed to `2xab`; confirm the real ones.
- Preview and social photos are Unsplash placeholders.

## Changelog (this pass)
- Brand name corrected from 2KAB to 2XAB everywhere; transparent white logo added.
- Featured carousel rebuilt: seamless loop (prefix copies, measured loop length), centre card emphasis, hover/focus/touch/button pause, reduced-motion static row. Background is pure white with no gradient bleed.
- Logo marquee: duplicated track for a seamless loop; generic marks replace text-based logos; rows move in opposite directions.
- Navbar: direction-aware hide/show; mobile drawer fixed (was trapped inside the header); focus management and Escape close.
- Shoe frame sequence: frame probing with fallback (no 404 storm), nearest-frame drawing, reverse scroll verified, render loop only runs while easing.
- Fixed horizontal overflow on mobile (footer/newsletter), categories heading clipping, cart badge styling, CTA text wrapping.
- Removed dead anchors and `href="#"` placeholders; WhatsApp button no longer links nowhere.
- Scroll reveal uses animation (not transition), so hover transforms are not overridden; content stays visible without JS.
- Preview: keyboard controls added; wheel zoom now needs Ctrl/⌘ so page scroll isn't trapped.
- Reduced motion: marquees and hero animations stop; featured row becomes scrollable; sequence shows the first frame.
- Added sports, casual, sneakers, shop, privacy and terms pages sharing the same header, footer and styles.

## Validation status for this rebuild
- `script.js` passes `node --check`.
- CSS opening/closing brace counts match.
- HTML files were checked for duplicate IDs and local referenced asset paths.
- Browser-based visual and interaction testing was not run in this environment.
- The provided ZIP does not include the hero/category/product artwork or the 88 animation frames; those assets must be supplied for the original visuals and frame playback.

## Quick Edit Panel
Open `style.css` and search for `QUICK EDIT PANEL — CHANGE VALUES IN THIS SECTION`. Use `QUICK-EDIT-GUIDE.txt` for a concise explanation of the controls.
