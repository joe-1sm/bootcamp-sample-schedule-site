# Assignment Bank Implementation Plan

## Overview
Add a self-service "Assignment Bank" feature where students can browse potential assignments, preview them on their calendar, and self-assign items to their schedule.

---

## Phase 1: Data Foundation
**Goal:** Set up the Airtable schema to support the feature

### Tasks
1. **Create `potential_Assignments` table** (duplicate from `Assignments`)
   - Ensure all fields exist: `title`, `assignment_type`, `subjects`, `question_source`, `estimated_time`, `get_started_link`, `student_side_description`, `start_date_time`, `end_date_time`, `Attachments`

2. **Add linked record fields to `potential_Assignments`:**
   - `aamc_resource` → links to `aamc_resources` table
   - `uworld_test` → links to `UWorld Test IDs` table  
   - `1sm_resource` → links to `1sm_resources` table

3. **Add tracking link:**
   - In `Assignments` table: add `source_potential_assignment` field linking to `potential_Assignments` (one-to-one)
   - This lets us know which potential assignments have been assigned to which students

4. **Populate initial data:**
   - Create `potential_Assignments` records for key AAMC/UWorld/1SM items
   - Link them to their source tables

### Deliverable
- Schema ready for API integration

---

## Phase 2: API Layer Updates
**Goal:** Extend Cloudflare Worker to support Assignment Bank operations

### Tasks
1. **New endpoint: `GET /potential-assignments`**
   - Fetch all records from `potential_Assignments`
   - Include linked data from source tables (aamc, uworld, 1sm)
   - Accept filter params: `assignment_type`, `subjects`, `question_source`
   - Accept `studentEmail` to exclude already-assigned items

2. **New endpoint: `POST /assignments`**
   - Create new record in `Assignments` table
   - Look up student record ID from `Student Roster` using email
   - Link to student and to source `potential_Assignments` record
   - Return created assignment

3. **New endpoint: `GET /student-lookup`**
   - Given email, return student record ID from `Student Roster`
   - Needed for linking assignments to students

4. **Update CORS** if needed for new endpoints

### Deliverable
- API supports reading potential assignments and creating new assignments

---

## Phase 3: UI Foundation - Tab Toggle & Basic List
**Goal:** Add the Assignment Bank tab with basic browsing

### Tasks
1. **Tab toggle UI:**
   - Add tabs above current "SELECTED SESSION" header
   - Two tabs: "Selected Session" | "Assignment Bank"
   - Style to match existing design

2. **Assignment Bank container:**
   - New panel that shows when "Assignment Bank" tab is active
   - Hide the session details panel when bank is active

3. **Basic list view:**
   - Fetch from `/potential-assignments` endpoint
   - Display each item showing `title` and `estimated_time` (as "Time req.")
   - Simple scrollable list

4. **Loading & empty states:**
   - Spinner while loading
   - "No assignments found" message when filtered to empty

### Deliverable
- Users can toggle between session view and assignment bank
- Basic list of potential assignments visible

---

## Phase 4: Filtering System
**Goal:** Add all filter controls

### Tasks
1. **Assignment Type radio buttons:**
   - Options: mcat-style, anki, study-guide, textbook, video, guided-review
   - "All" option (default, no filter)
   - Filter list on selection

2. **Subjects dropdown (always visible):**
   - Multi-select dropdown
   - Options: Physics, General Chemistry, Organic Chemistry, Biochemistry, Biology, Psych/Soc, CARS
   - Filter by `subjects` field (multiple select)

3. **Question Source dropdown (conditional):**
   - Only visible when assignment_type is "mcat-style" or "All"
   - Options: AAMC, UWorld, 1SM, Kaplan, Princeton Review, Blueprint, Jack Westin, Altius, Other
   - Additional option: "No MCAT-style questions" to exclude all mcat-style

4. **Filter logic:**
   - Filters are AND-ed together
   - Empty filter = show all
   - Update list in real-time as filters change

### Deliverable
- Full filtering system working

---

## Phase 5: Assignment Popup
**Goal:** Draggable popup with assignment details

### Tasks
1. **Popup component:**
   - Draggable (user can move it around)
   - Opens when clicking a list item
   - Close button (X) in corner

2. **Popup content:**
   - **Title** (header format)
   - **Time Required:** [estimated_time value]
   - **Easy Link:** ✅ (green) if `get_started_link` exists, ❌ (red) if empty
   - **Description:** `student_side_description` (skip if empty)
   - **UWorld section** (if applicable):
     - Test ID: [uworld_test_id]
     - Question IDs: [qid_string_lookup]

3. **Styling:**
   - Match existing design aesthetic
   - Shadow/elevation to show it's floating
   - Reasonable default size, scrollable if content is long

### Deliverable
- Clicking any assignment opens detailed popup

---

## Phase 6: Calendar Preview & Self-Assignment
**Goal:** Let students preview and assign items to their calendar

### Tasks
1. **Date/time picker in popup:**
   - Empty date/time field user can click
   - Opens date picker, then time picker
   - Default duration = `estimated_time`
   - Allow adjusting start/end times

2. **Calendar preview:**
   - When time is selected, show a "ghost" event on the calendar
   - Different styling (dashed border, semi-transparent)
   - Updates in real-time as user adjusts times

3. **Confirmation flow:**
   - "Add to Calendar" button
   - Confirmation dialog: "Add [title] to your calendar for [date] [time]?"
   - On confirm: call `POST /assignments`

4. **Post-assignment:**
   - Success message
   - Option A: Auto-refresh calendar after 2-3 seconds
   - Option B: "Refresh to see your new assignment" message
   - Close popup

5. **Student lookup:**
   - On page load, fetch student record ID using email
   - Cache for use when creating assignments

### Deliverable
- Full self-assignment flow with calendar preview

---

## Phase 7: Custom Assignment
**Goal:** Let students create fully custom assignments

### Tasks
1. **"Add Custom Assignment" button:**
   - At bottom of assignment list
   - Opens custom assignment form

2. **Custom assignment form:**
   - Title (required)
   - Estimated time (duration picker)
   - Description (optional, textarea)
   - Get Started Link (optional, URL)
   - Attachments (file upload)
   - Question Source (dropdown)
   - Assignment Type (dropdown)
   - Subjects (multi-select)
   - Date/Time (with calendar preview)

3. **Submission:**
   - Validate required fields
   - Create in `Assignments` table (no link to `potential_Assignments`)
   - Same confirmation flow as regular assignment

### Deliverable
- Students can create custom assignments

---

## Phase 8: Polish & Edge Cases
**Goal:** Handle edge cases and improve UX

### Tasks
1. **Already assigned indicator:**
   - If a potential assignment is already on student's calendar, show indicator
   - Prevent duplicate assignment or show warning

2. **Mobile responsiveness:**
   - Ensure filters work on mobile
   - Popup is usable on smaller screens

3. **Error handling:**
   - API failures show user-friendly messages
   - Retry logic for transient failures

4. **Performance:**
   - Cache potential assignments list
   - Debounce filter changes

### Deliverable
- Production-ready feature

---

## Technical Notes

### Cloudflare Worker Changes
- Need write access to Airtable (verify token permissions)
- New routes: `/potential-assignments`, `/assignments` (POST), `/student-lookup`
- Handle linked record expansion for source tables

### Frontend Changes
- New files: `assignment-bank.js` (or integrate into `script.js`)
- New CSS for: tabs, filters, popup, calendar preview ghost events
- Drag library for popup (or vanilla JS implementation)

### Airtable Schema Summary
```
potential_Assignments
├── title (text)
├── assignment_type (single select)
├── subjects (multiple select)
├── question_source (single select)
├── estimated_time (duration)
├── get_started_link (URL)
├── student_side_description (long text)
├── Attachments (attachment)
├── aamc_resource (linked record → aamc_resources)
├── uworld_test (linked record → UWorld Test IDs)
├── 1sm_resource (linked record → 1sm_resources)

Assignments (add field)
├── source_potential_assignment (linked record → potential_Assignments)

Student Roster (existing)
├── Student Name (primary)
├── Student Email (for lookup)
```

---

## Estimated Effort

| Phase | Complexity | Estimate |
|-------|------------|----------|
| Phase 1: Data Foundation | Low | 1-2 hours (mostly Airtable UI work) |
| Phase 2: API Layer | Medium | 2-3 hours |
| Phase 3: Tab Toggle & List | Medium | 2-3 hours |
| Phase 4: Filtering | Medium-High | 3-4 hours |
| Phase 5: Popup | Medium | 2-3 hours |
| Phase 6: Calendar Preview | High | 4-5 hours |
| Phase 7: Custom Assignment | Medium | 2-3 hours |
| Phase 8: Polish | Medium | 2-3 hours |

**Total: ~18-26 hours of development**

---

## Questions to Resolve Before Starting

1. ✅ Confirm `potential_Assignments` table creation approach
2. Should we auto-populate `potential_Assignments` from source tables, or manual entry?
3. Any rate limits on Airtable we should be aware of?
4. Should assignments have a "pending" state before appearing on calendar, or instant?

