# Toggle Concepts for Event Filters

## Option A – Color-Coded Pills (Implemented)
- Merge the legend and toggles into two saturated pills that borrow the live/homework colors.
- Large custom checkboxes sit inside each pill; when checked they flip to a solid black background with a centered white checkmark. Unchecked pills automatically dim (reduced saturation/opacity) so the “off” state reads clearly.
- Labels are concise (“Live events” / “Assignments”), keeping the row clean while the color still communicates the type.
- Keyboard accessibility: the entire pill now shows a bold `focus-within` ring whenever the hidden checkbox is focused, so tabbing users can see where they are.
- Works well for touch targets and keeps the visual hierarchy compact under the hero text.

## Option B – Segmented Switch Row
- Replace the pills with a two-segment switch (like a pill-shaped tab bar) where each half can be toggled independently.
- The active half uses the session color as its background; inactive halves become a thin-outline chip with muted text.
- Hover/focus states light up the outline instead of the fill to avoid confused affordances.
- Pros: extremely compact and modern; Cons: harder to communicate that both segments can be independently toggled.

## Option C – Icon + Badge Toggles
- Keep a neutral base chip but prepend an icon badge: a filled circle for live, a dotted outline for homework.
- The icon badge always shows the brand/secondary color (acting as the legend) while the chip itself stays white.
- When checked, the chip background flips to charcoal with white text and an inline check icon; unchecked uses light gray text and border.
- Provides the best accessibility contrast and can scale if more event types are introduced later.

---
### UI/UX Expert Feedback (Review of Option A Implementation)

The implementation of Option A is visually strong and effectively merges the legend with the filter controls. However, there are a few critical refinements needed to ensure it meets "top notch" standards:

1.  **Accessibility (Focus States)**:
    -   The current implementation relies on a hidden checkbox (`opacity: 0`). Keyboard users tabbing through the interface receive no visual feedback when the focus lands on the filter pills.
    -   **Recommendation**: Add a `:focus-within` style to the `.filter-pill` (e.g., a double border or a distinct focus ring) to ensure keyboard navigability is apparent.

2.  **Interaction Feedback**:
    -   While the checkbox state changes, the "pill" background remains the fully saturated brand color even when unchecked. This effectively communicates the "Legend" aspect (Red = Live), but creates a slight cognitive dissonance where a "turned off" button still looks "bright/active".
    -   **Recommendation**: Consider slightly desaturating or dimming the background color of the pill when the checkbox is unchecked (e.g., `opacity: 0.6` or a grayscale filter), while keeping the border or text colored to maintain the legend association. This would reinforce the "off" state without losing the category identity.

3.  **Touch Targets**:
    -   The padding is good (`12px 18px`), making for a decent touch target. Ensure the `label` element correctly passes clicks to the input on all devices (it should by default, but verify with `cursor: pointer`).
