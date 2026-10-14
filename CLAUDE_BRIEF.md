# 2XAB Footwear — Claude Handoff Brief

You are continuing an existing storefront project. **Improve and repair this project in place; do not replace it with a simplified template or remove existing sections/features.** Keep the current premium, monochrome black/white visual direction and the current two-row infinite logo-marquee concept (top row moves right-to-left, bottom row left-to-right). The user said the earlier carousel approach was good: preserve its overall appearance/behavior rather than inventing a different carousel.

## First: inspect before editing
1. Read `index.html`, `style.css`, `script.js`, and `README.md` fully.
2. Map every section, ID, event listener, anchor, image path, and animation dependency before changing code.
3. Keep a backup or use small, testable changes. Do not delete working sections to fix one bug.

## Required section order
1. Main hero using `assets/img/hero.jpg`.
2. Hero headline artwork `assets/img/herotext.png` in the left-side copy area, replacing the old text headline. Keep CSS variables/custom properties for manually tuning artwork width/scale and x/y position, plus the Explore Collection CTA position.
3. Explore Collection button immediately below the hero-text artwork, polished premium styling and smooth hover/focus/press states.
4. Two-row **logo-only** infinite marquee between the hero and the shoe frame/scroll sequence. Use white logo marks, not plain brand-name text. Keep top row moving right-to-left and lower row left-to-right, seamless loop with duplicated track content, balanced spacing, edge fades, no jumps. Prefer genuine brand logo assets only when supplied/licensed; otherwise use tasteful simple vector marks and do not present text as logos. Avoid relying on trademarked logos as if endorsed by those brands.
5. Scroll-controlled sneaker frame sequence (`#shoe-animation`) must work reliably.
6. Shop by Categories section (Sports, Casual, Sneakers).
7. Featured Collection on a **white background**, with centered heading and six product cards using `assets/store/1.png` through `assets/store/6.png`. Remove the line “Six picks. One different standard.” Cards should form a genuinely seamless continuous loop: last card transitions back to first without a visible jump, duplicate flash, blank gap, or reverse snap. The centered card can scale slightly larger than side cards. Pause movement on hover/focus and add restrained image zoom.
8. Keep all remaining existing sections, footer, interactions and responsive behavior unless there is a clear bug. Do not blend the black and white sections together with gradients: black sections stay black, white sections stay white, with crisp boundaries. Any blending currently above the black/white boundary can remain only where it does not cross the boundary.

## Functional fixes and destination pages
- Repair all broken frame-sequence behavior. Support `assets/frames/ezgif-frame-001.jpg` through `ezgif-frame-111.jpg` and backward compatibility for `assets/frame/`. Use correct section IDs and robust image preloading. Handle missing frames gracefully with a clear fallback; never throw uncaught errors. Ensure scroll progress maps consistently from first to last frame and is smooth on desktop/mobile.
- Fix navbar behavior: scroll down hides it smoothly; scroll up reveals it; at page top it remains visible. Avoid jitter, layout jumps, and accidental hiding while using mobile menu. Make tap targets a little larger and keyboard focus visible.
- Add elegant scroll-entry animations throughout the page (IntersectionObserver preferred), including hero art/CTA, marquees, category cards, featured heading/cards, and existing sections. Use staggered entrances where useful. Respect `prefers-reduced-motion`; don't animate every tiny element excessively or harm performance.
- Fix every internal anchor and CTA. No dead links, wrong section IDs, placeholder `href="#"`, or buttons that appear functional but do nothing.
- Build matching-theme destination pages for the Shop by Categories cards: `sports.html`, `casual.html`, `sneakers.html`. They should reuse the same navbar/footer/theme, be responsive, have a working back/home route and meaningful product/category content. Share CSS/JS where practical; don't make three visually unrelated pages.
- Check product card buttons, cart counter, search, wishlist, mobile nav, newsletter, footer links, and other current interactions. Clearly mark anything that must remain a front-end demo because no backend is configured; don't pretend payments or email submissions actually work.

## Visual and UX quality
- Premium editorial footwear storefront: strong typography, intentional spacing, clean grids, restrained shadows, crisp black/white sections, consistent border radii, high-quality responsive behavior.
- Product cards need thoughtful proportions, image containment/cropping, product name, concise meta/price placeholders if real data is absent, hover/focus states, and accessible actions. Keep the continuous carousel smooth and readable, not too fast.
- Buttons must have hover, active, focus-visible, and disabled states as applicable. Add meaningful alt text, semantic headings, accessible labels, and sufficient contrast.
- Keep CSS tuning knobs documented with comments near the variables. Avoid conflicting duplicate overrides and `!important` patches where a clean rule is possible.

## Code comments and maintainability
- Add useful comments at the start of each major HTML section explaining purpose and dependencies.
- Add CSS comments for each section and for manually adjustable hero-art/CTA position, marquee speed, frame sequence sizing, card scale, and animation timing.
- Add JS comments for navbar direction logic, frame preloading/scroll mapping, marquee pause/resume, featured-carousel looping, and reveal animations.
- Comments should explain intent and tuning points, not narrate obvious syntax. Use clear names and avoid duplicate event listeners.

## Validation checklist (must actually test)
- Open homepage via a local server; inspect console for errors and failed assets.
- Verify every section appears in the intended order and no section has been removed.
- Verify all 111 frames load when supplied, scroll smoothly in both directions, and don't freeze after scrolling away/back.
- Verify logo marquee moves in the correct opposite directions and has no seam/jump.
- Verify featured carousel loops card 6 to card 1 seamlessly; hover/focus pauses it; hover zoom works; white section remains pure/solid white and black sections remain solid black.
- Verify category links open their matching pages and navigation works back to home.
- Test desktop, tablet, mobile, keyboard navigation, reduced-motion preference, and missing-image fallback.
- Fix bugs found before delivery. Provide a concise changelog and list any assets still missing.

## Assets currently expected (some may not be included in this handoff ZIP)
- `assets/img/logo.png` (provided)
- `assets/img/hero.jpg`
- `assets/img/herotext.png`
- `assets/img/shopby.jpg`
- `assets/img/sports.png`, `casual.png`, `sneakers.png`
- `assets/store/1.png` through `assets/store/6.png`
- `assets/frames/ezgif-frame-001.jpg` through `ezgif-frame-111.jpg` (or legacy `assets/frame/`)

Do not invent that assets are present if they're missing. Preserve existing asset folders and paths; report any unavailable files clearly. Deliver the complete updated project folder as a ZIP, including all HTML/CSS/JS pages and README.
