## Project State & Directed Next Steps

_Last reviewed: November 24, 2025_

This document captures the current state of the `1SM Bootcamp Sample Schedule` front-end and prescribes concrete next steps to reach the “top-notch” UX and accessibility bar outlined in the existing design memos.

---

### 1. Current System Snapshot

| Area | Current Implementation |
| --- | --- |
| Calendar grid (`index.html`, `styles.css`, `script.js`) | Desktop-first 7-day grid renders from static data. Hover/selection logic, floating mobile “View Details” CTA, and iframe-resize modal are in place. No adaptive tiers or compact time formatting yet. |
| Filters (`filter-pill` controls) | Vertical toggle pills with basic `is-off` dimming exist, but the RGB ripple animation, dot ordering, and focus treatment described in `RGB_RIPPLE_EFFECT.md`/`FILTER_TOGGLE_REDESIGN.md` are not yet shipped. |
| Event details panel | Session time visibility bug resolved (`FIXES_IMPLEMENTED.md`). CTA redesign (circular pulse button) is live. Floating details button handles mobile scroll gap (`MOBILE_FIX_SUMMARY.md`). |
| Mobile UX | Page still relies on horizontal scrolling; the reviewed `MOBILE_DAY_SWITCHER_PLAN.md` is approved but not implemented. |
| Accessibility & perf | Baseline semantics exist, but backlog items from `feedback.md` remain (skip link, stronger focus states, ARIA wiring, touch-target audit, sanitization, resource hints). |

---

### 2. Directed Plan (Ordered by Impact)

#### Priority A — Mobile Day Switcher (Week Scope Navigation)
**Objective:** Deliver the approved 1/3/7-day switcher to make the schedule legible on mobile without horizontal scroll gymnastics.  
**Drivers:** `MOBILE_DAY_SWITCHER_PLAN.md`, UX expert approval (default 1-day, sticky nav, sessionStorage).  
**Actions:**
1. **Markup:** Insert the `day-switcher` block (nav arrows + radio-pill view toggles) between the filter stack and calendar.
2. **State management:** Implement `dayViewState` in `script.js` with helpers (`checkViewport`, `handleViewToggle`, `handleDayNavigation`, `updateVisibleDays`, `updateDayNavDisplay`, `updateNavigationButtons`).
3. **CSS:** Introduce `view-1-day`, `view-3-day`, `view-7-day` classes; update grid templates for <=768px; style sticky nav + pills per spec.
4. **Persistence & resize:** Use `sessionStorage` key `bootcamp-calendar-view`; debounced resize watcher toggles switcher visibility at 768px/1100px.
5. **QA:** Cover flows listed in plan (edge days, filters, embedded iframe, accessibility).

#### Priority B — Adaptive Event Layout & Compact Time Strings
**Objective:** Ship the three-tier event layout + smart time formatting from `CALENDAR_ADAPTIVE_LAYOUT.md` to address readability issues highlighted in `feedback.md`.  
**Actions:**
1. Add `formatTimeCompact`/`formatRangeCompact` utilities and swap all time labels to the compact format.
2. During `createEventElement`, compute duration, apply `event-tier-{tall|medium|short}`, generate clock icon SVG once, and store `data-time-range` for tooltips.
3. Extend `styles.css` with tier-specific rules, `.calendar-event__time-wrapper`, tooltip styling, and remove the legacy `.is-compact` logic.
4. Validate touch targets on mobile (ensure ≥44px height for short events; consider per-viewport adjustments as suggested in `feedback.md`).

#### Priority C — Filter Toggle Enhancements (RGB ripple + Focus)
**Objective:** Align filter pills with the Option A + RGB ripple spec, while closing accessibility gaps (focus-visible, `prefers-reduced-motion`).  
**Actions:**
1. Reorder pill contents via flexbox so dot → label → toggle → green indicator, rename “Live events” → “Live sessions”.
2. Implement the three-phase animation (`toggleSurge`, `shimmerRipple`, `greenLightSurge`) guarded by `@media (prefers-reduced-motion: reduce)`.
3. Add `.filter-pill:focus-within` outline per `feedback.md`, ensure keyboard tabbing visibly highlights the pill.
4. Double-check color contrast for the homework pill (adjust `--brand-homework` or text color) to surpass WCAG AA.

#### Priority D — Accessibility & Resilience Backlog
**Objective:** Close the remaining items from `feedback.md` and `session display.md`.  
**Actions:**
1. **Navigation aids:** Add a `skip-link` to `#eventDetails`, and shift `aria-live` from the entire aside to the title element.
2. **Controls:** Wire `aria-pressed` or `aria-current` semantics onto event cards, ensure keyboard selection shifts focus into `.details-card`, and audit ARIA relationships.
3. **Content safety:** Wrap `details.descriptionEl.innerHTML = ...` with a sanitizer or document the trusted-source assumption in code comments.
4. **Touch targets:** Enforce ≥44px mobile event heights and evaluate horizontal scroll affordances (fades or peeking columns).
5. **Performance hints:** Add `rel="preload"` for `styles.css`/`script.js`, and inline minimal critical CSS for faster first paint (optional stretch).

#### Priority E — Quality-of-Life Enhancements (Post-Stabilization)
**Objective:** Incremental polish once core UX gaps close.  
Suggestions: current-time indicator, analytics on CTA/floating button usage, swipe gestures for day nav (Phase 2), haptic feedback for floating button, iframe modal timing refinements.

---

### 3. Implementation Map

| Task | Files | Est. Effort |
| --- | --- | --- |
| Day switcher (Priority A) | `index.html`, `styles.css`, `script.js` | ~1 day (includes QA) |
| Adaptive event tiers (Priority B) | `script.js`, `styles.css` | ~0.5 day |
| Filter RGB ripple + focus (Priority C) | `styles.css`, `index.html` (text copy) | ~0.5 day |
| Accessibility backlog (Priority D) | `index.html`, `styles.css`, `script.js` | ~0.5 day |
| QoL enhancements (Priority E) | Various | As scheduled |

---

### 4. Verification Checklist (Post-implementation)

- ✅ Mobile: 1/3/7-day toggles, sticky nav, floating details CTA all cooperate.
- ✅ Calendar events: tier styling renders as spec, tooltips show on short events, touch height audit passes.
- ✅ Filters: ripple animates only when enabled, focus ring & reduced-motion fallback verified.
- ✅ Accessibility: screen readers announce selections succinctly, keyboard users can reach CTA and details without traps.
- ✅ Performance: Lighthouse ≥90 for Accessibility & Performance on mobile emulation.

---

**Owner:** Master Architect (you)  
**Next Review:** After Priority A–D ship or if scope changes.






