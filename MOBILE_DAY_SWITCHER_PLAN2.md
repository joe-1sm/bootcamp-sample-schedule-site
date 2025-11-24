# Mobile Day Switcher - Implementation Plan v2

## Document Purpose
This is the **revised implementation plan** incorporating feedback from UI/UX Expert and Architect reviews. This plan supersedes v1 and provides the definitive specification for building the mobile day switcher.

---

## Executive Summary

**What:** Mobile-first day navigation for the bootcamp schedule calendar  
**Why:** Current 7-day grid is illegible on mobile; horizontal scroll breaks header alignment  
**How:** Responsive day switcher with 1/3/7-day views, arrow navigation, and view toggles  
**Impact:** Dramatically improved mobile UX; desktop unchanged  

---

## Problem Statement

### Current Issues on Mobile
1. **Horizontal scroll breaks header alignment** - Day labels don't scroll with events
2. **7-day view is illegible** - Events are cramped, text too small to read
3. **Poor user experience** - Requires pinch/zoom to interact with calendar
4. **Not mobile-first** - Desktop layout forced onto small screens

### User Impact
- Mobile users struggle to read event details
- Navigation is confusing due to header desync
- Does not match mobile calendar UX expectations (Google Calendar, Apple Calendar)

---

## Solution Overview

Implement a **responsive day switcher** with these characteristics:

- **Mobile phones (<768px):** Default to **1-day view**, allow 3/7-day switching
- **Tablets (768px-1099px):** Show switcher, allow 1/3/7-day switching
- **Desktop (≥1100px):** Hide switcher, always 7-day view (unchanged)
- **Navigation:** Touch-friendly arrow buttons to move between days
- **Persistence:** View preference saved in `sessionStorage`
- **Accessibility:** Full keyboard navigation and screen reader support

---

## UI/UX Design

### Mobile Layout (<768px)

```
┌─────────────────────────────────────┐
│ 1SM Winter Break MCAT Bootcamp     │  ← Existing header
│ Week #1                             │     (hide date range on mobile)
├─────────────────────────────────────┤
│ ⚫—— ✓ Live sessions                │  ← Existing filters
│ ⚫—— ✓ Assignments                  │
├─────────────────────────────────────┤
│  [<]  Saturday, Dec 13  [>]        │  ← NEW: Sticky nav bar
├─────────────────────────────────────┤
│  ⚪ 1 Day  ⚪ 3 Days  ⚪ 7 Days      │  ← NEW: View toggles
├─────────────────────────────────────┤
│  8 AM                               │  ← Calendar grid
│ ┌─────────────────────────────────┐ │
│ │ Complete AAMC #1 under          │ │
│ │ test-like conditions            │ │
│ │ 8 AM – 3:30 PM                  │ │
│ └─────────────────────────────────┘ │
│  10 AM                              │
│  ...                                │
└─────────────────────────────────────┘
```

### Component Specifications

#### 1. Day Navigation Bar (Sticky)
**Position:** Between filters and calendar, sticky at top  
**Components:**
- Left arrow `[<]` - Navigate to previous day(s)
- Center label - Current date range
  - 1-day: "Saturday, Dec 13"
  - 3-day: "Sat 13 – Mon 15"
  - 7-day: "Dec 13 – 19"
- Right arrow `[>]` - Navigate to next day(s)

**Behavior:**
- Buttons disable at week boundaries (no wrapping)
- Arrows move by `currentView` increment (1, 3, or 7 days)
- Center label updates with `aria-live="polite"` for screen readers
- Inactive buttons get `aria-disabled="true"` + visual styling

**Touch Targets:**
- Minimum 44px × 44px for arrow buttons
- Adequate spacing between elements

#### 2. View Toggle Pills
**Position:** Below navigation bar  
**Components:**
- Three pill buttons: "1 Day", "3 Days", "7 Days"
- Radio button behavior (single selection)
- Active state: Brand color background + white text

**Default States:**
- Mobile (<768px): "1 Day" active on first load
- Tablet (768-1099px): "1 Day" or last saved preference
- Desktop (≥1100px): Hidden, forced to 7-day

**Persistence:**
- Save to `sessionStorage` on user selection
- Load saved preference on subsequent navigation
- Clamp stale values (e.g., if saved=3 but only 2 days remain)

#### 3. Calendar Grid Modifications
**1-Day View:**
- Single column, full width
- Header: Time axis + single day label
- No horizontal scroll

**3-Day View:**
- Three columns, equal width
- Header: Time axis + 3 day labels
- Slight horizontal scroll if needed on narrow phones

**7-Day View:**
- All seven columns (current behavior)
- Horizontal scroll enabled on mobile
- Desktop: No scroll, full width grid

**Visible Column Management:**
- CSS `display: none` on hidden columns
- Minimal reflow, no DOM manipulation
- Header labels sync with visible columns

---

## Technical Implementation

### 1. HTML Structure

**Add between existing filters and calendar:**

```html
<!-- NEW: Mobile Day Switcher (hidden on desktop ≥1100px) -->
<div class="day-switcher" id="daySwitcher">
  <!-- Sticky Navigation Bar -->
  <nav class="day-nav" aria-label="Calendar day navigation">
    <button 
      class="day-nav__btn day-nav__btn--prev" 
      id="dayNavPrev" 
      aria-label="Previous day"
      aria-disabled="false"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    
    <div 
      class="day-nav__current" 
      id="dayNavCurrent" 
      aria-live="polite"
      aria-atomic="true"
    >
      Saturday, Dec 13
    </div>
    
    <button 
      class="day-nav__btn day-nav__btn--next" 
      id="dayNavNext" 
      aria-label="Next day"
      aria-disabled="false"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </nav>
  
  <!-- View Toggle Pills -->
  <div class="view-toggle" role="radiogroup" aria-label="Calendar view density">
    <button 
      class="view-toggle__pill view-toggle__pill--active" 
      data-view="1" 
      role="radio" 
      aria-checked="true"
      id="viewToggle1"
    >
      1 Day
    </button>
    <button 
      class="view-toggle__pill" 
      data-view="3" 
      role="radio" 
      aria-checked="false"
      id="viewToggle3"
    >
      3 Days
    </button>
    <button 
      class="view-toggle__pill" 
      data-view="7" 
      role="radio" 
      aria-checked="false"
      id="viewToggle7"
    >
      7 Days
    </button>
  </div>
</div>
```

**Modify existing header for mobile:**

```html
<!-- Hide date range on mobile since day-nav provides it -->
<div class="header-date-range">
  <!-- Show only on tablet/desktop -->
  Week #1 · <span class="hide-on-mobile">December 13 – 19, 2025</span>
</div>
```

---

### 2. CSS Implementation

```css
/* ============================================
   MOBILE DAY SWITCHER
   ============================================ */

/* Hide on desktop, show on mobile/tablet */
.day-switcher {
  display: block;
}

@media (min-width: 1100px) {
  .day-switcher {
    display: none;
  }
}

/* Hide main header date range on mobile */
.hide-on-mobile {
  display: inline;
}

@media (max-width: 767px) {
  .hide-on-mobile {
    display: none;
  }
}

/* ============================================
   DAY NAVIGATION BAR
   ============================================ */

.day-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid var(--line);
  
  /* Sticky positioning with iOS safe area support */
  position: sticky;
  top: 0;
  z-index: 20;
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

.day-nav__btn {
  /* Touch-friendly size */
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  
  /* Styling */
  border: 1.5px solid #d1d5db;
  border-radius: 50%;
  background: white;
  color: #475569;
  cursor: pointer;
  
  /* Flexbox centering for SVG */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Transitions */
  transition: all 0.2s ease;
}

.day-nav__btn:hover:not(:disabled) {
  background: var(--brand-live);
  border-color: var(--brand-live);
  color: white;
  transform: scale(1.05);
}

.day-nav__btn:active:not(:disabled) {
  transform: scale(0.95);
}

.day-nav__btn:disabled,
.day-nav__btn[aria-disabled="true"] {
  opacity: 0.3;
  cursor: not-allowed;
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.day-nav__btn:focus-visible {
  outline: 2px solid var(--brand-live);
  outline-offset: 2px;
}

.day-nav__current {
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  flex: 1;
  padding: 0 16px;
  color: #1e293b;
  
  /* Prevent text overflow on very narrow screens */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 400px) {
  .day-nav__current {
    font-size: 1rem;
    padding: 0 12px;
  }
  
  .day-nav__btn {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
  }
}

/* ============================================
   VIEW TOGGLE PILLS
   ============================================ */

.view-toggle {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid var(--line);
  justify-content: center;
  flex-wrap: wrap; /* Wrap on very narrow screens */
}

.view-toggle__pill {
  /* Touch-friendly size */
  padding: 10px 20px;
  min-height: 44px;
  
  /* Styling */
  border: 1.5px solid #d1d5db;
  border-radius: 22px;
  background: white;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  /* Transitions */
  transition: all 0.25s ease;
  
  /* Prevent text selection */
  user-select: none;
}

.view-toggle__pill:hover:not(.view-toggle__pill--active) {
  background: #f8f9fa;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.view-toggle__pill:active {
  transform: translateY(0);
}

.view-toggle__pill--active,
.view-toggle__pill[aria-checked="true"] {
  background: var(--brand-live);
  color: white;
  border-color: var(--brand-live);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.view-toggle__pill:focus-visible {
  outline: 2px solid var(--brand-live);
  outline-offset: 2px;
}

@media (max-width: 400px) {
  .view-toggle__pill {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}

/* ============================================
   CALENDAR VIEW STATES
   ============================================ */

/* Base: All columns hidden by default when day switcher active */
.calendar.day-switcher-active .day-column,
.calendar.day-switcher-active .calendar-header > .day-label {
  display: none;
}

/* Show only visible columns */
.calendar.day-switcher-active .day-column.day-column--visible,
.calendar.day-switcher-active .calendar-header > .day-label.day-label--visible {
  display: block;
}

/* 1-Day View: Single column, full width */
@media (max-width: 1099px) {
  .calendar.view-1-day.day-switcher-active .calendar-header {
    grid-template-columns: 100px 1fr;
  }
  
  .calendar.view-1-day.day-switcher-active .calendar-body {
    grid-template-columns: 100px 1fr;
  }
}

/* 3-Day View: Three columns */
@media (max-width: 1099px) {
  .calendar.view-3-day.day-switcher-active .calendar-header {
    grid-template-columns: 80px repeat(3, minmax(0, 1fr));
  }
  
  .calendar.view-3-day.day-switcher-active .calendar-body {
    grid-template-columns: 80px repeat(3, minmax(0, 1fr));
  }
}

/* 7-Day View: All columns, horizontal scroll on mobile */
@media (max-width: 767px) {
  .calendar.view-7-day.day-switcher-active {
    overflow-x: auto;
  }
}

/* ============================================
   TRANSITIONS & ANIMATIONS
   ============================================ */

/* Smooth view transitions (respects prefers-reduced-motion) */
@media (prefers-reduced-motion: no-preference) {
  .calendar-body,
  .calendar-header {
    transition: grid-template-columns 0.25s ease;
  }
  
  .day-column,
  .day-label {
    transition: opacity 0.2s ease;
  }
}

/* Reduced motion: Instant transitions */
@media (prefers-reduced-motion: reduce) {
  .calendar-body,
  .calendar-header,
  .day-column,
  .day-label {
    transition: none;
  }
}
```

---

### 3. JavaScript Implementation

#### State Management

```javascript
/**
 * Day view state object
 * Manages current view mode, day index, and visibility
 */
const dayViewState = {
  currentView: 1,              // 1, 3, or 7 days
  currentDayIndex: 0,          // 0-6 (Saturday-Friday)
  visibleDayIndices: [0],      // Array of visible day indices
  isMobile: false,             // Viewport < 1100px
  totalDays: 7,                // Total days in schedule
  savedScrollTop: 0            // Preserve scroll position when switching
};

/**
 * DOM element references (cached for performance)
 */
const dayViewElements = {
  switcher: null,
  navPrev: null,
  navNext: null,
  navCurrent: null,
  viewPills: [],
  calendar: null,
  calendarBody: null,
  dayColumns: [],
  dayLabels: []
};
```

#### Initialization

```javascript
/**
 * Initialize day switcher
 * Called from main init() function
 */
function initDaySwitcher() {
  // Cache DOM elements
  dayViewElements.switcher = document.getElementById('daySwitcher');
  dayViewElements.navPrev = document.getElementById('dayNavPrev');
  dayViewElements.navNext = document.getElementById('dayNavNext');
  dayViewElements.navCurrent = document.getElementById('dayNavCurrent');
  dayViewElements.viewPills = document.querySelectorAll('.view-toggle__pill');
  dayViewElements.calendar = document.querySelector('.calendar');
  dayViewElements.calendarBody = document.querySelector('.calendar-body');
  dayViewElements.dayColumns = document.querySelectorAll('.day-column');
  dayViewElements.dayLabels = document.querySelectorAll('.calendar-header > .day-label');
  
  // Exit if DOM not ready
  if (!dayViewElements.switcher || !dayViewElements.calendar) {
    console.warn('Day switcher elements not found');
    return;
  }
  
  // Check viewport and set initial state
  checkViewport();
  
  // Attach event handlers
  attachDaySwitcherHandlers();
  
  // Load saved preference (with guards)
  loadViewPreference();
  
  // Initial render
  updateVisibleDays();
  updateDayNavDisplay();
  updateViewToggleButtons();
}

/**
 * Check viewport size and set mobile flag
 * Desktop (≥1100px) always shows 7-day view
 */
function checkViewport() {
  dayViewState.isMobile = window.innerWidth < 1100;
  
  if (!dayViewState.isMobile) {
    // Desktop: Force 7-day view, hide switcher
    dayViewState.currentView = 7;
    dayViewState.currentDayIndex = 0;
    dayViewState.visibleDayIndices = [0, 1, 2, 3, 4, 5, 6];
    
    if (dayViewElements.calendar) {
      dayViewElements.calendar.classList.remove('day-switcher-active');
    }
  } else {
    // Mobile/Tablet: Enable switcher
    if (dayViewElements.calendar) {
      dayViewElements.calendar.classList.add('day-switcher-active');
    }
    
    // On first load, default to 1-day view
    if (dayViewState.currentView === 7 && !sessionStorage.getItem('bootcamp-calendar-view')) {
      dayViewState.currentView = 1;
    }
  }
}
```

#### Event Handlers

```javascript
/**
 * Attach all event handlers for day switcher
 */
function attachDaySwitcherHandlers() {
  // View toggle pills
  dayViewElements.viewPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const view = parseInt(pill.dataset.view, 10);
      handleViewToggle(view);
    });
  });
  
  // Navigation buttons
  if (dayViewElements.navPrev) {
    dayViewElements.navPrev.addEventListener('click', () => {
      if (!dayViewElements.navPrev.disabled) {
        handleDayNavigation('prev');
      }
    });
  }
  
  if (dayViewElements.navNext) {
    dayViewElements.navNext.addEventListener('click', () => {
      if (!dayViewElements.navNext.disabled) {
        handleDayNavigation('next');
      }
    });
  }
  
  // Keyboard navigation (arrow keys)
  document.addEventListener('keydown', (e) => {
    if (!dayViewState.isMobile) return;
    
    // Only handle if not typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (!dayViewElements.navPrev.disabled) {
        handleDayNavigation('prev');
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (!dayViewElements.navNext.disabled) {
        handleDayNavigation('next');
      }
    }
  });
  
  // Window resize handler (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasMobile = dayViewState.isMobile;
      checkViewport();
      
      // If switched between mobile/desktop
      if (wasMobile !== dayViewState.isMobile) {
        updateVisibleDays();
        updateDayNavDisplay();
        updateViewToggleButtons();
      }
    }, 250);
  });
}

/**
 * Handle view toggle button click
 * @param {number} viewCount - 1, 3, or 7
 */
function handleViewToggle(viewCount) {
  if (!dayViewState.isMobile) return;
  
  // Save scroll position
  if (dayViewElements.calendarBody) {
    dayViewState.savedScrollTop = dayViewElements.calendarBody.scrollTop;
  }
  
  // Update state
  dayViewState.currentView = viewCount;
  
  // Adjust currentDayIndex if it would overflow
  const maxIndex = dayViewState.totalDays - viewCount;
  if (dayViewState.currentDayIndex > maxIndex) {
    dayViewState.currentDayIndex = Math.max(0, maxIndex);
  }
  
  // Save preference
  saveViewPreference(viewCount);
  
  // Update UI
  updateVisibleDays();
  updateDayNavDisplay();
  updateViewToggleButtons();
  
  // Restore scroll position after render
  requestAnimationFrame(() => {
    if (dayViewElements.calendarBody) {
      dayViewElements.calendarBody.scrollTop = dayViewState.savedScrollTop;
    }
  });
  
  // Check if active event is now hidden
  checkActiveEventVisibility();
}

/**
 * Handle navigation arrow click
 * @param {string} direction - 'prev' or 'next'
 */
function handleDayNavigation(direction) {
  if (!dayViewState.isMobile) return;
  
  // Save scroll position
  if (dayViewElements.calendarBody) {
    dayViewState.savedScrollTop = dayViewElements.calendarBody.scrollTop;
  }
  
  const step = dayViewState.currentView;
  
  if (direction === 'prev') {
    // Move backwards by step, don't go below 0
    dayViewState.currentDayIndex = Math.max(0, dayViewState.currentDayIndex - step);
  } else {
    // Move forwards by step, respect week boundary
    const maxIndex = dayViewState.totalDays - dayViewState.currentView;
    dayViewState.currentDayIndex = Math.min(maxIndex, dayViewState.currentDayIndex + step);
  }
  
  // Update UI
  updateVisibleDays();
  updateDayNavDisplay();
  
  // Restore scroll position after render
  requestAnimationFrame(() => {
    if (dayViewElements.calendarBody) {
      dayViewElements.calendarBody.scrollTop = dayViewState.savedScrollTop;
    }
  });
  
  // Check if active event is now hidden
  checkActiveEventVisibility();
}
```

#### Render Functions

```javascript
/**
 * Update which day columns are visible based on state
 */
function updateVisibleDays() {
  if (!dayViewState.isMobile) {
    // Desktop: Show all days
    showAllDays();
    return;
  }
  
  const { currentView, currentDayIndex } = dayViewState;
  
  // Calculate visible day indices
  const visibleIndices = [];
  for (let i = 0; i < currentView; i++) {
    const index = currentDayIndex + i;
    if (index < dayViewState.totalDays) {
      visibleIndices.push(index);
    }
  }
  
  dayViewState.visibleDayIndices = visibleIndices;
  
  // Update DOM
  updateCalendarColumns();
  updateCalendarHeaders();
  updateCalendarViewClass();
}

/**
 * Show/hide appropriate day columns
 */
function updateCalendarColumns() {
  dayViewElements.dayColumns.forEach((column, index) => {
    const isVisible = dayViewState.visibleDayIndices.includes(index);
    column.classList.toggle('day-column--visible', isVisible);
  });
}

/**
 * Show/hide appropriate day headers
 */
function updateCalendarHeaders() {
  dayViewElements.dayLabels.forEach((label, index) => {
    const isVisible = dayViewState.visibleDayIndices.includes(index);
    label.classList.toggle('day-label--visible', isVisible);
  });
}

/**
 * Update calendar class for CSS targeting
 */
function updateCalendarViewClass() {
  const calendar = dayViewElements.calendar;
  if (!calendar) return;
  
  // Remove old view classes
  calendar.classList.remove('view-1-day', 'view-3-day', 'view-7-day');
  
  // Add current view class
  calendar.classList.add(`view-${dayViewState.currentView}-day`);
}

/**
 * Show all days (desktop mode)
 */
function showAllDays() {
  dayViewElements.dayColumns.forEach(column => {
    column.classList.add('day-column--visible');
  });
  
  dayViewElements.dayLabels.forEach(label => {
    label.classList.add('day-label--visible');
  });
  
  if (dayViewElements.calendar) {
    dayViewElements.calendar.classList.remove('view-1-day', 'view-3-day', 'view-7-day');
  }
}

/**
 * Update day navigation display text
 * Shows current date range
 */
function updateDayNavDisplay() {
  if (!dayViewElements.navCurrent) return;
  
  const { currentView, currentDayIndex } = dayViewState;
  const startDay = calendarConfig.days[currentDayIndex];
  
  if (!startDay) return;
  
  let displayText = '';
  
  if (currentView === 1) {
    // "Saturday, Dec 13"
    displayText = `${startDay.name}, ${formatDateShort(startDay.iso)}`;
  } else if (currentView === 3) {
    // "Sat 13 – Mon 15"
    const endIndex = Math.min(currentDayIndex + 2, dayViewState.totalDays - 1);
    const endDay = calendarConfig.days[endIndex];
    displayText = `${startDay.name.substring(0, 3)} ${getDayNumber(startDay.iso)} – ${endDay.name.substring(0, 3)} ${getDayNumber(endDay.iso)}`;
  } else {
    // "Dec 13 – 19"
    displayText = "Dec 13 – 19";
  }
  
  dayViewElements.navCurrent.textContent = displayText;
  
  // Update navigation button states
  updateNavigationButtons();
}

/**
 * Enable/disable navigation buttons based on boundaries
 * No wrapping allowed - stop at week edges
 */
function updateNavigationButtons() {
  if (!dayViewElements.navPrev || !dayViewElements.navNext) return;
  
  const { currentDayIndex, currentView, totalDays } = dayViewState;
  
  // Disable prev if at start
  const atStart = currentDayIndex === 0;
  dayViewElements.navPrev.disabled = atStart;
  dayViewElements.navPrev.setAttribute('aria-disabled', atStart ? 'true' : 'false');
  
  // Disable next if at or beyond end
  const atEnd = currentDayIndex + currentView >= totalDays;
  dayViewElements.navNext.disabled = atEnd;
  dayViewElements.navNext.setAttribute('aria-disabled', atEnd ? 'true' : 'false');
}

/**
 * Update view toggle button active states
 */
function updateViewToggleButtons() {
  dayViewElements.viewPills.forEach(pill => {
    const view = parseInt(pill.dataset.view, 10);
    const isActive = view === dayViewState.currentView;
    
    pill.classList.toggle('view-toggle__pill--active', isActive);
    pill.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
}
```

#### Helper Functions

```javascript
/**
 * Check if currently selected event is still visible
 * Reset details panel if it's hidden
 */
function checkActiveEventVisibility() {
  if (!activeEventId) return;
  
  // Find which day the active event is on
  const activeEventDayIndex = findEventDayIndex(activeEventId);
  
  if (activeEventDayIndex === -1) return;
  
  // Check if that day is still visible
  const isVisible = dayViewState.visibleDayIndices.includes(activeEventDayIndex);
  
  if (!isVisible) {
    // Active event is now hidden, reset details panel
    resetActiveState();
  }
}

/**
 * Find which day index an event belongs to
 * @param {string} eventId
 * @returns {number} Day index (0-6) or -1 if not found
 */
function findEventDayIndex(eventId) {
  for (let dayIndex = 0; dayIndex < calendarConfig.days.length; dayIndex++) {
    const day = calendarConfig.days[dayIndex];
    const event = day.events.find(e => e.id === eventId);
    if (event) return dayIndex;
  }
  return -1;
}

/**
 * Format date for display (e.g., "Dec 13")
 * @param {string} isoDate - ISO date string
 * @returns {string}
 */
function formatDateShort(isoDate) {
  const date = new Date(isoDate);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

/**
 * Get day number from ISO date
 * @param {string} isoDate
 * @returns {number}
 */
function getDayNumber(isoDate) {
  return new Date(isoDate).getDate();
}

/**
 * Save view preference to sessionStorage
 * @param {number} view
 */
function saveViewPreference(view) {
  try {
    sessionStorage.setItem('bootcamp-calendar-view', view.toString());
  } catch (e) {
    console.warn('Failed to save view preference:', e);
  }
}

/**
 * Load view preference from sessionStorage
 * Includes guard against stale/invalid values
 */
function loadViewPreference() {
  if (!dayViewState.isMobile) return;
  
  try {
    const saved = sessionStorage.getItem('bootcamp-calendar-view');
    if (saved) {
      let view = parseInt(saved, 10);
      
      // Guard: Clamp to valid range
      if (view < 1) view = 1;
      if (view > 7) view = 7;
      
      // Guard: If saved view would overflow, reduce it
      const remainingDays = dayViewState.totalDays - dayViewState.currentDayIndex;
      if (view > remainingDays) {
        view = remainingDays;
      }
      
      dayViewState.currentView = view;
    }
  } catch (e) {
    console.warn('Failed to load view preference:', e);
  }
}
```

#### Integration Points

```javascript
/**
 * Add to existing init() function
 */
function init() {
  // ... existing initialization ...
  
  // Initialize day switcher
  initDaySwitcher();
  
  // ... rest of initialization ...
}

/**
 * Modify existing resetActiveState() function
 * (This already exists, just ensure it can be called by day switcher)
 */
function resetActiveState() {
  // ... existing reset logic ...
  
  // Note: hideFloatingButton() should already be called here
}
```

---

## Responsive Breakpoints (Refined)

### Mobile Phones (<768px)
- **Switcher:** Visible
- **Default View:** 1-day (hard-coded on first load)
- **Allowed Views:** 1, 3, or 7 days
- **Navigation:** Arrow buttons move by current view increment
- **Rationale:** Single-day columns guarantee legibility on narrow screens

### Tablets (768px-1099px)
- **Switcher:** Visible
- **Default View:** Last saved preference (or 1-day if none)
- **Allowed Views:** 1, 3, or 7 days
- **Rationale:** Touch-first devices benefit from focused views

### Desktop (≥1100px)
- **Switcher:** Hidden
- **Default View:** 7-day (forced)
- **Allowed Views:** 7-day only
- **Rationale:** Sufficient screen real estate; maintain current UX

---

## Edge Cases & Solutions

### 1. Week Boundary Navigation
**Problem:** User is viewing Friday in 1-day view and clicks next  
**Solution:** Disable "Next" button when `currentDayIndex + currentView >= totalDays`  
**No wrapping:** Schedule is a fixed week; don't loop to Saturday

### 2. Active Event Hidden by View Change
**Problem:** User has event selected, switches to 1-day view, event is on different day  
**Solution:** Call `checkActiveEventVisibility()` after view change; if event hidden, call `resetActiveState()`

### 3. Partial Day Spans
**Problem:** User is viewing Friday in 3-day view (only Fri-Sat remain)  
**Solution:** Show only available days (2 instead of 3); nav display shows "Fri 20 – Sat 21"

### 4. Filter Interaction
**Problem:** User filters events while in 1-day view  
**Solution:** Filters work normally, hiding events in visible day(s)

### 5. Viewport Resize Mid-Session
**Problem:** User rotates device or resizes browser  
**Solution:** Debounced resize handler checks viewport, switches between mobile/desktop modes

### 6. Scroll Position Loss
**Problem:** User switches views and loses vertical scroll position  
**Solution:** Save `calendarBody.scrollTop` before render, restore in `requestAnimationFrame()` callback

### 7. Stale SessionStorage
**Problem:** Saved preference is invalid (e.g., view=3 but only 1 day remains)  
**Solution:** Clamp loaded value to valid range in `loadViewPreference()`

### 8. SessionStorage Unavailable
**Problem:** User has disabled storage or private browsing  
**Solution:** Graceful fallback in try/catch blocks; default to 1-day view

### 9. No Events on Selected Day
**Problem:** User navigates to empty day  
**Solution:** Show empty calendar grid; no error state needed

### 10. Floating Mobile Button
**Problem:** Does floating "View Details" button work with day switcher?  
**Solution:** Yes, keeps working. Details panel is still below calendar in 1-day view.

---

## Accessibility Implementation

### ARIA Attributes
- Navigation bar: `<nav aria-label="Calendar day navigation">`
- View toggles: `role="radiogroup" aria-label="Calendar view density"`
- Each pill: `role="radio" aria-checked="true|false"`
- Arrow buttons: Descriptive `aria-label="Previous day"` / `"Next day"`
- Disabled buttons: `aria-disabled="true"` (in addition to `disabled` attribute)
- Date display: `aria-live="polite" aria-atomic="true"` (announces range changes)

### Keyboard Navigation
- **Tab:** Cycle through nav buttons and view pills
- **Arrow Left/Right:** Navigate days (global, when not in input)
- **Space/Enter:** Activate focused button
- **Focus Indicators:** 2px solid outline on `:focus-visible`

### Screen Reader Announcements
- View change: "1 Day view selected"
- Navigation: "Showing Saturday, December 13" (via `aria-live`)
- Disabled state: "Previous day, disabled" (at week start)

### Touch Targets
- All buttons: Minimum 44px × 44px
- View pills: 44px height, adequate padding
- Adequate spacing (8px gaps) between elements

### Motion Preferences
- Transitions only if `prefers-reduced-motion: no-preference`
- Instant changes if `prefers-reduced-motion: reduce`

---

## Performance Optimizations

### Rendering
- **No DOM manipulation:** Use CSS `display: none` to hide columns
- **Cached references:** All DOM queries done once in init
- **Minimal reflow:** Grid changes trigger layout, but contained to calendar area
- **Scroll preservation:** Prevent jarring jumps when switching views

### Event Handling
- **Debounced resize:** 250ms delay before processing viewport changes
- **Early exits:** Check `isMobile` flag before processing events
- **Passive listeners:** Consider `{ passive: true }` for future touch handlers

### Memory
- **Tiny state:** Just a few primitives in `dayViewState`
- **No new DOM elements:** Switcher is static HTML, visibility toggled
- **SessionStorage:** Single integer value (~10 bytes)

### Animations
- **GPU-accelerated:** Use `transform` and `opacity` only
- **CSS transitions:** Offload animation work to compositor thread
- **Reduced motion support:** Respect user preferences

---

## Testing Checklist

### Functional Tests
- [ ] 1-day view shows only selected day
- [ ] 3-day view shows 3 consecutive days
- [ ] 7-day view shows all days (with horizontal scroll on mobile)
- [ ] Navigation arrows work in all view modes
- [ ] View toggles switch between modes correctly
- [ ] Prev button disabled at start of week
- [ ] Next button disabled at end of week
- [ ] Desktop always shows 7 days, switcher hidden
- [ ] SessionStorage saves view preference
- [ ] Preference loads correctly on return visit

### Edge Case Tests
- [ ] Navigate to last day in 1-day view (next disabled)
- [ ] Navigate to Fri-Sat in 3-day view (shows only 2 days)
- [ ] Switch views with event selected
- [ ] Switch to view that hides active event (details reset)
- [ ] Filter events while in 1-day view
- [ ] Resize viewport from mobile to desktop
- [ ] Resize viewport from desktop to mobile
- [ ] View empty day (no events)
- [ ] Scroll position preserved when switching views

### Accessibility Tests
- [ ] Keyboard: Tab through all controls
- [ ] Keyboard: Arrow keys navigate days
- [ ] Keyboard: Space/Enter activate buttons
- [ ] Screen reader announces view changes
- [ ] Screen reader announces date range changes
- [ ] Screen reader announces disabled state
- [ ] Focus indicators visible on all controls
- [ ] ARIA attributes correct
- [ ] Touch targets meet 44px minimum
- [ ] Reduced motion preference respected

### Visual Tests (Mobile)
- [ ] Navigation bar looks good on iPhone SE (375px)
- [ ] Navigation bar looks good on standard phones (390-430px)
- [ ] View toggles wrap gracefully on narrow screens
- [ ] Active pill clearly distinguished
- [ ] Disabled buttons visually obvious
- [ ] Date text doesn't overflow
- [ ] Sticky positioning works correctly
- [ ] iOS safe area respected

### Visual Tests (Tablet/Desktop)
- [ ] Switcher shows on tablet (768-1099px)
- [ ] Switcher hidden on desktop (≥1100px)
- [ ] 7-day view looks identical to current desktop
- [ ] No layout shift when switcher appears/disappears

### Integration Tests
- [ ] Event selection works in all view modes
- [ ] Event hover/focus works in all view modes
- [ ] Filters work in all view modes
- [ ] Floating details button works in 1-day view
- [ ] Embed modal still triggers correctly
- [ ] Iframe resize script still works

### Cross-Browser Tests
- [ ] Chrome/Edge (Android)
- [ ] Safari (iOS - test sticky positioning + safe areas)
- [ ] Firefox (Android)
- [ ] Samsung Internet
- [ ] Chrome (Desktop)
- [ ] Safari (Desktop)

### Device Tests
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] Pixel 5 (393px)
- [ ] Galaxy S21 (360px)
- [ ] iPad Mini (768px)
- [ ] iPad (820px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1100px+)

---

## Implementation Phases

### Phase 1: HTML Structure (5 minutes)
1. Add day switcher markup after filters, before calendar
2. Add SVG arrow icons to navigation buttons
3. Add view toggle pill buttons
4. Add `.hide-on-mobile` span to header date range

**Testing:** Verify HTML renders correctly on mobile/desktop

---

### Phase 2: CSS Styling (20 minutes)
1. Hide switcher on desktop (≥1100px)
2. Style day navigation bar (sticky, iOS safe areas)
3. Style arrow buttons (touch targets, hover, disabled states)
4. Style date display (center text)
5. Style view toggle pills (active state, transitions)
6. Add view state classes (`.view-1-day`, `.view-3-day`, `.view-7-day`)
7. Modify calendar grid for 1-day and 3-day layouts
8. Add transitions (respect `prefers-reduced-motion`)
9. Hide main header date range on mobile

**Testing:** Verify visual design matches spec, test responsive breakpoints

---

### Phase 3: JavaScript State & Init (15 minutes)
1. Create `dayViewState` object
2. Create `dayViewElements` cache object
3. Write `initDaySwitcher()` function
4. Write `checkViewport()` function
5. Write `loadViewPreference()` with guards
6. Wire up `initDaySwitcher()` in main `init()` function

**Testing:** Verify state initializes correctly, viewport detection works

---

### Phase 4: Navigation Logic (15 minutes)
1. Write `handleDayNavigation(direction)` function
2. Write `updateVisibleDays()` function
3. Write `updateCalendarColumns()` function
4. Write `updateCalendarHeaders()` function
5. Write `updateDayNavDisplay()` function
6. Write `updateNavigationButtons()` function
7. Write helper functions (`formatDateShort`, `getDayNumber`)
8. Attach click handlers to arrow buttons

**Testing:** Verify arrows move between days correctly, boundaries respected

---

### Phase 5: View Toggle Logic (10 minutes)
1. Write `handleViewToggle(viewCount)` function
2. Write `updateViewToggleButtons()` function
3. Write `updateCalendarViewClass()` function
4. Write `saveViewPreference()` function
5. Attach click handlers to view pills

**Testing:** Verify view switching works, preference saves/loads

---

### Phase 6: Integration & Edge Cases (15 minutes)
1. Write `checkActiveEventVisibility()` function
2. Write `findEventDayIndex(eventId)` helper
3. Add scroll position preservation logic
4. Attach keyboard event handlers (arrow keys)
5. Attach resize event handler (debounced)
6. Test all integration points with existing features

**Testing:** Verify event selection, filters, floating button all work

---

### Phase 7: Accessibility & Polish (10 minutes)
1. Verify all ARIA attributes in place
2. Test keyboard navigation (Tab, arrows, Space/Enter)
3. Test focus indicators
4. Test screen reader announcements
5. Verify touch target sizes
6. Test reduced motion preferences

**Testing:** Full accessibility audit, keyboard-only navigation

---

### Phase 8: Cross-Device Testing (10 minutes)
1. Test on real devices (iOS, Android)
2. Test viewport resize behavior
3. Test sticky positioning on iOS
4. Test safe areas on iPhone with notch
5. Test landscape orientation
6. Fix any device-specific bugs

**Testing:** Verify works across all target devices

---

**Total Estimated Time:** 100 minutes (~1.5 hours with buffer)

---

## Files to Modify

### index.html
- Add day switcher HTML between filters and calendar (~50 lines)
- Add `.hide-on-mobile` wrapper to header date range (1 line)

### styles.css
- Add day switcher styles (~200 lines)
- Add view state classes (~50 lines)
- Add responsive grid modifications (~40 lines)
- Add motion preference rules (~20 lines)
- **Total: ~310 lines**

### script.js
- Add state objects (~15 lines)
- Add init functions (~40 lines)
- Add navigation functions (~80 lines)
- Add view toggle functions (~50 lines)
- Add helper functions (~60 lines)
- Add integration functions (~30 lines)
- **Total: ~275 lines**

**Grand Total:** ~635 lines across 3 files

---

## Success Criteria

This implementation is successful if:

✅ **Mobile users can navigate days easily** with touch-friendly arrow buttons  
✅ **Default 1-day view is readable** without zooming on phones <768px  
✅ **Navigation respects week boundaries** (no wrapping past Friday)  
✅ **Vertical scroll position preserved** when switching views  
✅ **Active event details reset** when event hidden by view change  
✅ **Desktop experience unchanged** (7-day view, switcher hidden)  
✅ **No performance degradation** (smooth transitions, minimal reflow)  
✅ **Fully accessible** (keyboard navigation, screen reader support)  
✅ **Works across devices** (iOS safe areas, Android, tablets)  
✅ **Preference persists** (sessionStorage with stale value guards)  

---

## Alternative Approaches (Evaluated & Rejected)

### ❌ Alternative 1: Fix horizontal scroll sync
**Why rejected:** Doesn't solve root problem (cramped mobile UX)

### ❌ Alternative 2: Swipe gestures only
**Why rejected:** Accessibility issues, not discoverable. **However:** Strong yes for Phase 2 addition (arrows provide baseline, swipe for power users)

### ❌ Alternative 3: Date picker dropdown
**Why rejected:** Overkill for 7-day schedule, more complex UI

### ❌ Alternative 4: Tabs for each day
**Why rejected:** 7 tabs are cramped, less flexible than arrow navigation

---

## Questions for Reviewer (Resolved)

All questions from v1 have been addressed by UI/UX Expert and Architect feedback. Decisions locked in for implementation:

1. ✅ **Default mobile view:** 1-day (hard-coded <768px on first load)
2. ✅ **Tablet visibility:** Yes, show switcher <1100px
3. ✅ **Sticky nav:** Yes, with iOS safe area support
4. ✅ **Storage:** `sessionStorage` with stale value guards
5. ✅ **Swipe gestures:** Phase 2 (after arrow baseline established)
6. ✅ **View toggle placement:** Below nav bar (as planned)
7. ✅ **Animation speed:** 0.25s transitions (respect reduced motion)
8. ✅ **Week wrapping:** No wrapping - disable Next at end
9. ✅ **Filters:** Keep as-is, don't collapse
10. ✅ **Accessibility:** Current ARIA approach approved

---

## Key Changes from v1

### Based on UI/UX Expert Feedback
- ✅ Default to 1-day view on mobile (<768px) - **mandated**
- ✅ Show switcher on tablets (768-1099px) - **confirmed**
- ✅ Sticky navigation bar - **confirmed**
- ✅ Use `sessionStorage` (not `localStorage`) - **confirmed**
- ✅ No week wrapping, disable buttons at boundaries - **confirmed**
- ✅ Preserve scroll position when switching views - **added**
- ✅ Hide main header date range on mobile - **added**
- ✅ Swipe gestures planned for Phase 2 - **noted**

### Based on Architect Feedback
- ✅ Hard-code `currentView = 1` for <768px on first load - **implemented**
- ✅ Honor saved preference only after explicit user choice - **implemented**
- ✅ Render switcher for all viewports <1100px - **clarified**
- ✅ Disable Next when `currentDayIndex + currentView ≥ totalDays` - **implemented**
- ✅ iOS safe area support (`env(safe-area-inset-*)`) - **added to CSS**
- ✅ Preserve vertical scroll position (capture/reapply) - **implemented**
- ✅ Guard against stale sessionStorage values (clamp) - **implemented**
- ✅ Use `aria-live="polite"` on nav label only - **refined**
- ✅ Add `aria-disabled="true"` for inactive buttons - **added**
- ✅ Call `resetActiveState()` when active event hidden - **implemented**
- ✅ Structure handlers for future swipe gesture hooks - **noted in code**
- ✅ Document intention for passive touch listeners - **noted**

---

## Post-Implementation: Phase 2 Enhancements

After successful Phase 1 implementation and testing, consider:

### Phase 2A: Swipe Gestures (UI/UX Expert: "Strong yes")
- Add touch event handlers (`touchstart`, `touchmove`, `touchend`)
- Detect horizontal swipe gestures (threshold: 50px)
- Call `handleDayNavigation('prev'|'next')` on swipe
- Add visual feedback (drag indicator)
- Use `touch-action: pan-y` to allow vertical scroll
- Consider passive event listeners for performance

### Phase 2B: "Jump to Today" Button
- Add optional "Jump to Start" link if user gets lost
- Probably overkill for 7-day schedule, but nice-to-have
- Could show only if user is 3+ days from start

### Phase 2C: Animation Polish
- Add subtle slide transitions when changing days
- Consider spring animations for view toggles
- Ensure all animations respect `prefers-reduced-motion`

---

## Architect Review Notes (v2)

Overall, v2 resolves every open point from the previous round—hard‑coded 1‑day default on phones, sticky nav with safe‑area padding, non‑wrapping navigation, scroll preservation, and explicit ARIA contracts are all spelled out. I have only two implementation cautions left:

1. **`findEventDayIndex` data source:** The current `script.js` stores events in a flat `events` array, not inside `calendarConfig.days[x].events`. As written, `day.events` will be `undefined`, so the helper will never find a match, meaning hidden selections won’t reset. Fix by building an `eventDayIndexMap` during `renderEvents()` (e.g., `eventToDayIndex[id] = columnIdx`) and consult it inside `checkActiveEventVisibility()`.
2. **Navigation label clamping:** When the user loads directly into a saved 3-day view near the end of the week, `loadViewPreference()` clamps the view but does not rerender the nav label until `updateVisibleDays()` runs. Ensure `updateVisibleDays()` / `updateDayNavDisplay()` are triggered immediately after clamping so the first paint isn’t briefly inaccurate.

Addressing those two details keeps the implementation aligned with the spec; no further blockers from my side.

---

## Conclusion

This revised plan incorporates all feedback from UI/UX Expert and Architect reviews. The approach is:

- ✅ **User-centric:** 1-day default on mobile guarantees legibility
- ✅ **Responsive:** Adapts to all screen sizes with clear breakpoints
- ✅ **Accessible:** Full keyboard, screen reader, and motion preference support
- ✅ **Performant:** Minimal overhead, GPU-accelerated, scroll position preserved
- ✅ **Non-breaking:** Desktop experience unchanged; mobile dramatically improved
- ✅ **Future-proof:** Structured for Phase 2 swipe gesture addition
- ✅ **iOS-friendly:** Safe area support for notched devices
- ✅ **Robust:** Guards against edge cases and stale state

**Implementation is ready to proceed with confidence.**

---

**Status:** ✅ Approved for implementation (UI/UX Expert + Architect sign-off)  
**Next Step:** Begin Phase 1 (HTML structure)  
**Estimated Total Time:** 100 minutes (~1.5 hours)  
**Risk Level:** Low (isolated feature, clear spec, non-breaking)  
**Future Enhancements:** Phase 2 swipe gestures after baseline ships

---

**Document Version:** 2.0  
**Last Updated:** November 24, 2025  
**Authors:** Senior Developer (plan), UI/UX Expert (review), Architect (review)

