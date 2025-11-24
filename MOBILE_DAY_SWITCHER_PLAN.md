# Mobile Day Switcher - Implementation Plan

## Document Purpose
This document outlines the plan to implement a mobile day switcher for the bootcamp schedule calendar. It should be reviewed by another agent or developer before implementation to identify potential issues, suggest improvements, and validate the approach.

---

## Problem Statement

### Current Issues on Mobile
1. **Horizontal scroll breaks header alignment** - Day labels (Sat, Sun, Mon...) don't scroll with events
2. **7-day view is cramped** - Events are tiny and hard to read on small screens
3. **Poor user experience** - Pinch/zoom required to read event details
4. **Not mobile-first** - Desktop layout forced onto mobile with horizontal scrolling

### User Impact
- Mobile users struggle to navigate the schedule
- Events are difficult to read without zooming
- Header/content desync creates confusion
- Does not match mobile calendar UX expectations (Google Calendar, Apple Calendar, etc.)

---

## Solution Overview

Implement a **responsive day switcher** that adapts the calendar view based on screen size:

- **Mobile (< 768px):** Default to 1-day view with navigation arrows
- **Tablet (768px - 1099px):** Option for 1, 3, or 7-day view
- **Desktop (≥ 1100px):** Always show 7-day view (current behavior)

---

## UI/UX Design

### Mobile Layout (< 768px)

```
┌─────────────────────────────────────┐
│ 1SM Winter Break MCAT Bootcamp     │
│ Week #1 · December 13 – 19, 2025   │
├─────────────────────────────────────┤
│ ⚫—— ✓ Live sessions                │  ← Existing filters
│ ⚫—— ✓ Assignments                  │
├─────────────────────────────────────┤
│  [<]  Saturday, Dec 13  [>]        │  ← NEW: Day navigation
│                                     │
│  ⚪ 1 Day  ⚪ 3 Days  ⚫ 7 Days      │  ← NEW: View toggles
├─────────────────────────────────────┤
│  8 AM                               │
│ ┌─────────────────────────────────┐ │
│ │ Complete AAMC #1 under          │ │
│ │ test-like conditions            │ │
│ │ 8 AM – 3:30 PM                  │ │
│ └─────────────────────────────────┘ │
│  10 AM                              │
│  12 PM                              │
│  ...                                │
└─────────────────────────────────────┘
```

### Component Breakdown

#### 1. Day Navigation Bar
**Position:** Between filters and calendar  
**Components:**
- Left arrow button `[<]` - Go to previous day(s)
- Center text - Current date range display
  - 1-day: "Saturday, Dec 13"
  - 3-day: "Sat 13 – Mon 15"
  - 7-day: "Dec 13 – 19, 2025"
- Right arrow button `[>]` - Go to next day(s)

**Styling:**
- Full width bar
- Arrows: Touch-friendly (44px min)
- Center text: Bold, prominent
- Subtle background to separate from calendar
- Sticky positioning (stays visible while scrolling)

#### 2. View Toggle Pills
**Position:** Below day navigation bar  
**Components:**
- Three pill buttons: "1 Day", "3 Days", "7 Days"
- Similar styling to existing filter pills
- Active state clearly indicated
- Default: "1 Day" selected on mobile

**Behavior:**
- Single selection (radio button style)
- Smooth transition when switching views
- Persist selection in sessionStorage
- On desktop (≥ 1100px): Hide this control entirely

#### 3. Calendar Modifications
**Changes needed:**
- **1-day view:** Show only selected day's column
- **3-day view:** Show 3 consecutive days (scrollable horizontally if needed)
- **7-day view:** Show all 7 days (current behavior)
- **Header:** Always in sync with visible days
- **No horizontal overflow** on 1-day and 3-day views

---

## Technical Implementation

### 1. HTML Structure Changes

**Add navigation controls between filters and calendar:**

```html
<!-- NEW: Day Switcher (Mobile Only) -->
<div class="day-switcher" id="daySwitcher">
  <!-- Navigation Bar -->
  <div class="day-nav">
    <button class="day-nav__btn day-nav__btn--prev" id="dayNavPrev" aria-label="Previous day">
      <svg><!-- Left arrow icon --></svg>
    </button>
    <div class="day-nav__current" id="dayNavCurrent">
      Saturday, Dec 13
    </div>
    <button class="day-nav__btn day-nav__btn--next" id="dayNavNext" aria-label="Next day">
      <svg><!-- Right arrow icon --></svg>
    </button>
  </div>
  
  <!-- View Toggle Pills -->
  <div class="view-toggle" role="radiogroup" aria-label="Calendar view">
    <button class="view-toggle__pill view-toggle__pill--active" data-view="1" role="radio" aria-checked="true">
      1 Day
    </button>
    <button class="view-toggle__pill" data-view="3" role="radio" aria-checked="false">
      3 Days
    </button>
    <button class="view-toggle__pill" data-view="7" role="radio" aria-checked="false">
      7 Days
    </button>
  </div>
</div>
```

### 2. CSS Changes

**New classes needed:**

```css
/* Hide day switcher on desktop */
@media (min-width: 1100px) {
  .day-switcher {
    display: none;
  }
}

/* Day Navigation Bar */
.day-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 10;
}

.day-nav__btn {
  width: 44px;
  height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  /* ... hover/focus states ... */
}

.day-nav__current {
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  flex: 1;
  padding: 0 16px;
}

/* View Toggle Pills */
.view-toggle {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid var(--line);
  justify-content: center;
}

.view-toggle__pill {
  padding: 8px 16px;
  border: 1.5px solid #d1d5db;
  border-radius: 20px;
  background: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-toggle__pill--active {
  background: var(--brand-live);
  color: white;
  border-color: var(--brand-live);
}

/* Calendar view states */
.calendar.view-1-day .day-column:not(.day-column--visible) {
  display: none;
}

.calendar.view-1-day .calendar-header > div:not(.calendar-header__spacer):not(.day-label--visible) {
  display: none;
}

/* Similar for view-3-day */
.calendar.view-3-day .day-column {
  /* Show only 3 consecutive days */
}

/* 7-day view on mobile: allow horizontal scroll */
.calendar.view-7-day {
  overflow-x: auto;
}
```

**Grid modifications:**

```css
/* 1-day view: Single column, full width */
@media (max-width: 767px) {
  .calendar.view-1-day .calendar-header {
    grid-template-columns: 100px 1fr;
  }
  
  .calendar.view-1-day .calendar-body {
    grid-template-columns: 100px 1fr;
  }
}

/* 3-day view: Three columns */
@media (max-width: 767px) {
  .calendar.view-3-day .calendar-header {
    grid-template-columns: 80px repeat(3, minmax(0, 1fr));
  }
  
  .calendar.view-3-day .calendar-body {
    grid-template-columns: 80px repeat(3, minmax(0, 1fr));
  }
}
```

### 3. JavaScript State Management

**New state variables:**

```javascript
const dayViewState = {
  currentView: 1,           // 1, 3, or 7
  currentDayIndex: 0,       // 0-6 (Sat-Fri)
  visibleDayIndices: [0],   // Array of visible day indices
  isMobile: false           // Viewport < 768px
};
```

**Key functions to add:**

```javascript
// Initialize day switcher (called in init())
function initDaySwitcher() {
  const daySwitcher = document.getElementById('daySwitcher');
  if (!daySwitcher) return;
  
  checkViewport();
  attachDaySwitcherHandlers();
  loadViewPreference();
  updateVisibleDays();
}

// Check if mobile viewport
function checkViewport() {
  dayViewState.isMobile = window.innerWidth < 768;
  
  if (!dayViewState.isMobile) {
    // Desktop: always show 7 days
    dayViewState.currentView = 7;
    showAllDays();
  }
}

// Handle view toggle button clicks
function handleViewToggle(viewCount) {
  dayViewState.currentView = viewCount;
  saveViewPreference(viewCount);
  updateVisibleDays();
  updateViewToggleButtons();
}

// Handle navigation arrow clicks
function handleDayNavigation(direction) {
  // direction: 'prev' or 'next'
  const step = dayViewState.currentView;
  
  if (direction === 'prev') {
    dayViewState.currentDayIndex = Math.max(0, dayViewState.currentDayIndex - step);
  } else {
    const maxIndex = 6 - (step - 1);
    dayViewState.currentDayIndex = Math.min(maxIndex, dayViewState.currentDayIndex + step);
  }
  
  updateVisibleDays();
  updateDayNavDisplay();
}

// Update which day columns are visible
function updateVisibleDays() {
  const { currentView, currentDayIndex } = dayViewState;
  
  // Calculate visible day indices
  const visibleIndices = [];
  for (let i = 0; i < currentView; i++) {
    const index = currentDayIndex + i;
    if (index <= 6) visibleIndices.push(index);
  }
  
  dayViewState.visibleDayIndices = visibleIndices;
  
  // Update DOM
  updateCalendarColumns();
  updateCalendarHeaders();
}

// Show/hide appropriate day columns
function updateCalendarColumns() {
  dayColumns.forEach((column, index) => {
    const isVisible = dayViewState.visibleDayIndices.includes(index);
    column.classList.toggle('day-column--visible', isVisible);
  });
  
  // Update calendar class for CSS
  const calendar = document.querySelector('.calendar');
  calendar.className = `calendar view-${dayViewState.currentView}-day`;
}

// Update calendar headers to match visible days
function updateCalendarHeaders() {
  const headerLabels = document.querySelectorAll('.day-label');
  headerLabels.forEach((label, index) => {
    const isVisible = dayViewState.visibleDayIndices.includes(index);
    label.classList.toggle('day-label--visible', isVisible);
  });
}

// Update day navigation text (e.g., "Saturday, Dec 13")
function updateDayNavDisplay() {
  const currentEl = document.getElementById('dayNavCurrent');
  if (!currentEl) return;
  
  const { currentView, currentDayIndex } = dayViewState;
  const startDay = calendarConfig.days[currentDayIndex];
  
  if (currentView === 1) {
    // "Saturday, Dec 13"
    currentEl.textContent = `${startDay.name}, ${formatDate(startDay.iso)}`;
  } else if (currentView === 3) {
    const endDay = calendarConfig.days[currentDayIndex + 2];
    // "Sat 13 – Mon 15"
    currentEl.textContent = `${startDay.name.substr(0,3)} ${getDayNumber(startDay.iso)} – ${endDay.name.substr(0,3)} ${getDayNumber(endDay.iso)}`;
  } else {
    // "Dec 13 – 19, 2025"
    currentEl.textContent = "Dec 13 – 19, 2025";
  }
  
  // Disable prev/next buttons at boundaries
  updateNavigationButtons();
}

// Enable/disable navigation buttons based on position
function updateNavigationButtons() {
  const prevBtn = document.getElementById('dayNavPrev');
  const nextBtn = document.getElementById('dayNavNext');
  
  prevBtn.disabled = dayViewState.currentDayIndex === 0;
  nextBtn.disabled = dayViewState.currentDayIndex + dayViewState.currentView > 6;
}

// Save user preference to sessionStorage
function saveViewPreference(view) {
  sessionStorage.setItem('calendarView', view);
}

// Load user preference from sessionStorage
function loadViewPreference() {
  const saved = sessionStorage.getItem('calendarView');
  if (saved && dayViewState.isMobile) {
    dayViewState.currentView = parseInt(saved, 10);
  }
}
```

### 4. Event Handling

```javascript
function attachDaySwitcherHandlers() {
  // View toggle pills
  const viewPills = document.querySelectorAll('.view-toggle__pill');
  viewPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const view = parseInt(pill.dataset.view, 10);
      handleViewToggle(view);
    });
  });
  
  // Navigation buttons
  const prevBtn = document.getElementById('dayNavPrev');
  const nextBtn = document.getElementById('dayNavNext');
  
  prevBtn.addEventListener('click', () => handleDayNavigation('prev'));
  nextBtn.addEventListener('click', () => handleDayNavigation('next'));
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!dayViewState.isMobile) return;
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleDayNavigation('prev');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleDayNavigation('next');
    }
  });
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasMobile = dayViewState.isMobile;
      checkViewport();
      
      // If switched from mobile to desktop or vice versa
      if (wasMobile !== dayViewState.isMobile) {
        updateVisibleDays();
        updateDayNavDisplay();
      }
    }, 250);
  });
}
```

---

## Responsive Breakpoints

### Mobile (< 768px)
- Show day switcher controls
- Default to 1-day view
- Navigation arrows visible
- View toggles visible

### Tablet (768px - 1099px)
- Show day switcher controls (optional)
- Default to 3-day view
- User can switch between 1/3/7

### Desktop (≥ 1100px)
- Hide day switcher controls
- Always show 7-day view
- Current behavior maintained

**Rationale:** 768px is a common tablet breakpoint, and below that is where users really struggle with 7-day calendar views.

---

## User Flow Examples

### Example 1: Mobile user views Monday events

1. Page loads → Defaults to Saturday (first day)
2. User taps right arrow `[>]` three times
3. Now viewing Monday (single day, full width)
4. All Monday events clearly visible
5. User can scroll vertically to see all hours

### Example 2: Mobile user wants 3-day overview

1. Currently viewing Saturday (1-day)
2. User taps "3 Days" pill
3. View expands to show Sat-Sun-Mon
4. User can see multiple days at once for planning
5. Arrows now move in 3-day increments

### Example 3: Desktop user (unchanged)

1. Page loads → Shows all 7 days (current behavior)
2. Day switcher controls hidden
3. No change to existing desktop UX

---

## Edge Cases & Handling

### 1. Last day(s) of week
**Problem:** User is viewing Friday in 3-day view, but only 1 day remains  
**Solution:** Show whatever days remain (Fri-Sat-Sun if wrapping, or just Friday if last day)

### 2. Active event selection
**Problem:** User has event selected, then switches view  
**Solution:** Keep event selected if still visible; if not, keep details panel but scroll to that day

### 3. Filter interaction
**Problem:** User filters events while in 1-day view  
**Solution:** Filters work normally, just hiding events within visible day(s)

### 4. Floating mobile details button
**Problem:** Does the floating "View Details" button still make sense?  
**Solution:** Keep it. In 1-day view, details panel is still below the calendar.

### 5. Viewport resize mid-session
**Problem:** User resizes from mobile to desktop  
**Solution:** Detect resize, switch to 7-day view, hide controls smoothly

### 6. No events on selected day
**Problem:** User navigates to a day with no events  
**Solution:** Show empty calendar with time axis, no error state needed

### 7. SessionStorage unavailable
**Problem:** User has disabled localStorage/sessionStorage  
**Solution:** Graceful fallback, always default to 1-day view (no saved preference)

---

## Accessibility Considerations

### ARIA Attributes
- View toggle pills use `role="radiogroup"` and `role="radio"`
- Navigation buttons have descriptive `aria-label`s
- Active view pill has `aria-checked="true"`
- Day switcher has `aria-live="polite"` on date display (announces changes)

### Keyboard Navigation
- Tab through navigation buttons and view toggles
- Arrow keys (←/→) navigate between days
- Space/Enter activates focused button
- Focus indicators clearly visible

### Screen Readers
- Announce current date range when changed
- Announce view mode when toggled
- Navigation state clear (e.g., "Previous day, disabled" at start)

### Touch Targets
- All buttons minimum 44px × 44px
- Adequate spacing between toggle pills
- Easy to tap on mobile devices

---

## Performance Considerations

### Rendering Optimization
- Don't re-render entire calendar on view switch
- Use CSS `display: none` to hide columns (minimal reflow)
- Cache DOM references for day columns and headers
- Debounce window resize handler (250ms)

### Memory
- Minimal new state (just a few integers)
- No additional DOM elements created/destroyed
- SessionStorage usage is tiny (single integer)

### Animation
- Use CSS transitions for smooth view changes
- GPU-accelerated properties only (`transform`, `opacity`)
- No janky JavaScript animations

---

## Testing Checklist

### Functional Tests
- [ ] 1-day view shows only selected day
- [ ] 3-day view shows 3 consecutive days
- [ ] 7-day view shows all days on mobile (with horizontal scroll)
- [ ] Navigation arrows work in all view modes
- [ ] View toggles switch between modes correctly
- [ ] Desktop always shows 7 days, controls hidden
- [ ] SessionStorage saves/loads preference correctly

### Edge Case Tests
- [ ] Navigate to last day in 1-day view (next button disabled)
- [ ] Navigate to last 2 days in 3-day view (shows only 2)
- [ ] Switch views with event selected
- [ ] Filter events while in 1-day view
- [ ] Resize viewport from mobile to desktop and back
- [ ] View empty day (no events)

### Accessibility Tests
- [ ] Keyboard navigation works (Tab, Arrow keys, Space/Enter)
- [ ] Screen reader announces view changes
- [ ] Focus indicators visible
- [ ] ARIA attributes correct
- [ ] Touch targets meet 44px minimum

### Visual Tests
- [ ] Navigation bar looks good on all mobile sizes
- [ ] View toggles match existing filter pill style
- [ ] Active state clearly visible
- [ ] Arrows are touch-friendly
- [ ] Date display is readable

### Cross-Browser Tests
- [ ] Chrome/Edge (Android)
- [ ] Safari (iOS)
- [ ] Firefox (Android)
- [ ] Samsung Internet

### Responsive Tests
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] Pixel 5 (393px)
- [ ] iPad Mini (768px)
- [ ] iPad (820px)
- [ ] Desktop (1100px+)

---

## Potential Issues & Mitigations

### Issue 1: Complexity
**Risk:** Adding state management increases code complexity  
**Mitigation:** Keep state simple (single object), clear function names, extensive comments

### Issue 2: Existing Event Interactions
**Risk:** Event selection, hover, expand might break  
**Mitigation:** Don't modify event element creation, only column visibility

### Issue 3: Mobile Filters + Switcher = Too much UI
**Risk:** Header becomes cluttered on mobile  
**Mitigation:** Compact design, stack vertically, sticky positioning

### Issue 4: SessionStorage Conflicts
**Risk:** Could conflict with other stored preferences  
**Mitigation:** Use specific key name: `bootcamp-calendar-view`

### Issue 5: Animation Performance on Old Devices
**Risk:** View transitions could be janky on older phones  
**Mitigation:** Use CSS transitions (GPU), check `prefers-reduced-motion`

### Issue 6: Iframe Embedding
**Risk:** Day switcher might look weird in embedded view  
**Mitigation:** Test in iframe, ensure responsive behavior works

---

## Files to Modify

### index.html
- Add day switcher HTML structure between filters and calendar
- Add SVG icons for arrow buttons

### styles.css
- Add `.day-switcher` and child component styles
- Add view state classes (`.view-1-day`, `.view-3-day`, `.view-7-day`)
- Add responsive media queries
- Modify calendar grid for 1/3 day layouts

### script.js
- Add `dayViewState` object
- Add 8-10 new functions for day switching logic
- Modify `init()` to call `initDaySwitcher()`
- Add event handlers for navigation and view toggle

**Estimated lines of code:**
- HTML: ~40 lines
- CSS: ~150 lines
- JavaScript: ~200 lines

---

## Implementation Order

1. **Phase 1: HTML Structure** (5 min)
   - Add day switcher markup
   - Add navigation buttons with SVG icons
   - Add view toggle pills

2. **Phase 2: CSS Styling** (15 min)
   - Style navigation bar and buttons
   - Style view toggle pills
   - Add view state classes
   - Add responsive grid modifications

3. **Phase 3: JavaScript State** (10 min)
   - Create `dayViewState` object
   - Add viewport detection
   - Add state management functions

4. **Phase 4: Navigation Logic** (10 min)
   - Implement arrow button handlers
   - Implement day index calculations
   - Update visible columns based on state

5. **Phase 5: View Toggle Logic** (10 min)
   - Implement view switch handlers
   - Update grid classes based on view
   - Save/load preferences

6. **Phase 6: Testing & Polish** (10 min)
   - Test all view modes
   - Test navigation boundaries
   - Test responsive behavior
   - Fix any edge cases

**Total estimated time:** 60 minutes

---

## Success Criteria

This implementation is successful if:

✅ Mobile users can easily view 1, 3, or 7 days  
✅ Navigation is intuitive with arrow buttons  
✅ Default 1-day view is readable without zooming  
✅ Desktop experience unchanged (7-day view)  
✅ No performance degradation  
✅ Accessible to keyboard and screen reader users  
✅ Works across all modern mobile browsers  
✅ User preference persists during session  

---

## Alternative Approaches Considered

### Alternative 1: Fix horizontal scroll sync
**Pros:** Quick fix  
**Cons:** Doesn't solve cramped mobile UX, still poor experience  
**Decision:** Rejected - doesn't address root problem

### Alternative 2: Swipe gestures to navigate
**Pros:** Modern, gesture-based  
**Cons:** Complex to implement, accessibility issues, not discoverable  
**Decision:** Maybe add later, arrows are better baseline

### Alternative 3: Date picker dropdown
**Pros:** Allows jumping to any date  
**Cons:** Overkill for 7-day schedule, more complex UI  
**Decision:** Rejected - arrows are sufficient for 7 days

### Alternative 4: Tabs for each day
**Pros:** Clear, simple  
**Cons:** 7 tabs on mobile is cramped, less flexible  
**Decision:** Rejected - view toggles + arrows more flexible

---

## Questions for Reviewer

Before implementation, please review and provide feedback on:

1. **Is the default 1-day view on mobile the right choice?** Or should it default to 3-day?

2. **Should the day switcher be visible on tablet (768px-1099px)?** Or only on true mobile (<768px)?

3. **Sticky navigation bar - good idea or annoying?** Stays at top while scrolling calendar.

4. **SessionStorage vs localStorage?** Session = per-tab, Local = persistent. Which is better?

5. **Should we add swipe gestures as Phase 2?** Left/right swipe to navigate days?

6. **View toggle placement** - Below nav bar (as planned) or somewhere else?

7. **Animation speed** - How fast should view transitions be? 0.2s, 0.3s, or instant?

8. **Edge case: Wrapping weeks?** Should we wrap to next week if user navigates past Friday?

9. **Should filters collapse on mobile** to save vertical space for day switcher?

10. **Accessibility concern** - Is the current ARIA approach sufficient?

---

## Conclusion

This plan implements a mobile-first day switcher that solves the horizontal scroll issue and dramatically improves mobile UX. The approach is:

- **User-centric:** Follows established mobile calendar patterns
- **Responsive:** Adapts to all screen sizes
- **Accessible:** Keyboard and screen reader friendly
- **Performant:** Minimal overhead, smooth transitions
- **Non-breaking:** Desktop experience unchanged

The implementation is straightforward with clear state management and well-defined component boundaries. Estimated ~60 minutes to complete with thorough testing.

---

**Status:** Ready for review and feedback before implementation  
**Next Step:** Review by another agent/developer, address feedback, then build  
**Estimated Implementation Time:** 60 minutes  
**Risk Level:** Low (isolated feature, doesn't modify core calendar logic)

