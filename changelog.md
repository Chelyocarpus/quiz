# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.10] - 2026-02-28

### Fixed

- **XSS in shared set import dialog** (`js/ui.js`) — `showSharedSetDialog` was inserting `setName` and `t.term` directly into `innerHTML` template literals; both values are now passed through `escapeHTML()` before rendering
- **XSS in toast notifications** (`js/ui.js`) — `ToastSystem.show()` was building the toast via `innerHTML = \`…${message}…\``; replaced with `createElement('div')` + `textContent` assignment to safely handle any message string
- **Injected `@keyframes bounceIn` bypassed `prefers-reduced-motion`** (`js/ui.js`) — the shared set dialog injected a `<style>` tag at runtime containing `.modal-dialog { animation: bounceIn 0.5s }` and the keyframe definition, which skipped the stylesheet's `@media (prefers-reduced-motion: reduce)` rules; both rules removed — the existing CSS slide-in transition on `.modal-dialog` already provides the entrance effect and respects reduced-motion
- **Hardcoded `px` values in dialog layout** (`js/ui.js`) — `saveButton.style.marginRight` and `rightButtons.style.gap` were set to the literal string `'10px'`; replaced with `'var(--space-2)'` to use the design-token spacing system
- **`feedback.innerHTML = ''` cleared via assignment** (`js/main.js`) — two locations used `innerHTML = ''` to clear the feedback element; changed to `textContent = ''` which is the correct, side-effect-free approach for emptying a text-only element

## [1.5.9] - 2026-02-28

### Fixed

- **Sticky terms-header is no longer see-through** (`css/styles.css`) — replaced semi-transparent `var(--border-color)` / `background-image` tint combo with a single opaque `background: var(--card-bg-solid)` (`#ffffff` light / `#1a1a2e` dark) plus `border-bottom: 1px solid var(--border-color)` to visually separate it from the list

## [1.5.8] - 2026-02-28

### Fixed

- **`.button-small` tap targets in list view** (`css/styles.css`) — `.list-view .secondary-actions .button` was overriding the global `.button-small` min-height/width back to auto; now explicitly sets `min-width: 44px; min-height: 44px; width: auto; display: inline-flex` so icon buttons are properly sized in list view

## [1.5.7] - 2026-02-28

### Fixed

- **"Discard & Leave" confirmation button wording** (`js/ui.js`, `js/main.js`) — added `DialogSystem.confirmDiscard()` and `showDiscardConfirm()` so the destructive action button reads "Discard" instead of "Delete"; `backToSets()` and `newSet()` now call `showDiscardConfirm()` instead of `showDeleteConfirm()`
- **`.button-small` mobile layout** (`css/styles.css`) — added `display: inline-flex; align-items: center; justify-content: center` so icon-only small buttons are properly centred; changed padding to equal `var(--space-2)` on all sides; added explicit `@media (max-width: 540px)` override to prevent the base `.button` media-query rule from enlarging or stretching `.button-small` elements

## [1.5.6] - 2026-02-28

### Changed

- **Hint field hidden by default** (`index.html`, `js/main.js`) — hint input is collapsed under an "Add hint" toggle button; opening it shifts Term to col 1 and reveals Hint at col 2; saving/cancelling a term resets it to hidden; editing a term auto-shows the hint field so it can be reviewed
- **Tab buttons fill the row equally** (`css/styles.css`) — removed `min-width: 110px`, added `flex: 1; min-width: 0` so four tabs always fit side-by-side without overflow; tighter padding on mobile
- **44×44 px tap targets everywhere** (`css/styles.css`) — term action edit/delete buttons are now `44×44 px` flex containers; `.banner-new-btn` and `.hint-toggle` have `min-height: 44px`; `.button-small` already fixed in 1.5.5
- **Creator controls stack on mobile** (`css/styles.css`) — `@media (max-width: 540px)` now forces `.creator-controls` to column layout with full-width buttons; form "Add / Cancel" buttons stretch to fill available width

## [1.5.5] - 2026-02-28

### Fixed

- **"Learn" title now reliably navigates home** (`js/ui.js`) — `resetToOverview` now always calls `switchTab('saved-sets-tab')`, so clicking the title from any tab (Create, Import, etc.) visibly returns to My Sets
- **Cancel editing a set** (`index.html`, `js/main.js`) — added a prominent "← My Sets" button at the start of `creator-controls`; calls `backToSets()` which prompts before discarding unsaved terms, then clears state and switches to My Sets tab
- **Button touch targets** (`css/styles.css`) — set `.button-small` to `min-width: 44px; min-height: 44px` to comply with WCAG 2.5.5 minimum target size

## [1.5.4] - 2026-02-28

### Fixed

- **Cancel Edit button now visible** (`index.html`, `css/styles.css`, `js/main.js`) — "Add Term" and "Cancel Edit" buttons moved out of the CSS grid into a dedicated `.form-actions` flex row below the inputs; previously the buttons were grid children which caused layout unpredictability
- **Minimum touch target size** (`css/styles.css`) — added `min-height: 44px` to `.button` to meet WCAG 2.5.5 (44×44 px minimum)
- **"Learn" title always navigates home** (`js/ui.js`) — `resetToOverview` previously did nothing if the quiz section had no inline `display` style; it now always shows the import section and hides the quiz section, only showing the toast when actually exiting quiz mode

### Changed

- Edit mode button references switched from brittle `querySelector('button[onclick="addTerm()"]')` to `getElementById('addTermBtn')` for reliability

## [1.5.3] - 2026-02-28

### Changed

- **Create tab form layout** (`index.html`, `css/styles.css`) — replaced flex row with a 2-column CSS grid; Term and Hint sit side by side on row 1, Definition spans the full width on row 2 giving it maximum space, "Add" button is right-aligned on row 3; on screens ≤ 540 px all fields stack to a single column
- **Editing set name banner** (`index.html`, `css/styles.css`, `js/main.js`, `js/ui.js`, `js/storage.js`) — when opening a saved set for editing a prominent inline banner shows the set name; includes a "New Set" button to discard and start fresh; `saveCurrentSet` pre-fills the prompt with the current name and updates the banner after saving
- **Clear All uses danger dialog** (`js/main.js`) — switched from `showConfirm` to `showDeleteConfirm` so the confirmation button is red; message contextually includes the set name when editing a named set
- **`newSet()` helper** (`js/main.js`) — prompts before discarding existing terms, then resets state and focuses the Term input

## [1.5.2] - 2026-02-28

### Changed

- **Compact create/edit tab layout** (`index.html`, `css/styles.css`, `js/storage.js`, `js/main.js`) — overhauled the creator form and term list to use space far more efficiently:
  - **Inline form row** — Term, Definition and Hint inputs sit on one horizontal flex row with proportional widths (2:3:1.5) alongside the Add Term button; inputs wrap on narrow screens
  - **Grid-based term rows** — term list replaced stacked label/value blocks with a sticky-header table grid (`2.5ch · 1fr · 1.5fr · auto`); each term occupies a single compact row with columns for index, term, definition and actions
  - **Hint indicator** — optional hint shown as a small lightbulb icon next to the definition instead of a separate row; hovering reveals the hint text
  - **Larger scrollable area** — `#termsList` max-height changed from `300px` to `50vh`; removed excess padding so rows align flush
  - **Removed duplicate function** — dead `updateTermsList` declaration in `main.js` removed; `storage.js` is now the single definition

## [1.5.1] - 2026-02-28

### Changed

- **Delete dialog uses danger pattern** (`js/ui.js`) — added `DialogSystem.confirmDelete()` and `showDeleteConfirm()` helper; delete actions now show a red "Delete" button instead of a generic "OK", and `alert`/`confirm` dialogs reset the button class to prevent style bleed
- **Replaced emoji icons with Lucide icons** (`js/storage.js`, `css/styles.css`) — term list edit and delete buttons now use `<i data-lucide="pencil">` and `<i data-lucide="trash-2">` instead of ✏️/❌ emojis; delete button hover uses a red tint to reinforce the destructive action; `lucide.createIcons()` is called after rendering the term list

## [1.5.0] - 2026-02-28

### Added

- **Drag-and-drop file upload zone** (`index.html`, `css/styles.css`, `js/animations.js`) — replaced the plain `<input type="file">` with a full drop zone: cloud-upload icon, "Drop your file here" prompt, browse-files button, drag-enter/drag-over visual feedback, accepted-file badge with filename, and error toast for unsupported extensions
- **`escapeHTML` utility** (`js/storage.js`) — local helper function that escapes `&`, `<`, `>`, `"`, `'` before inserting user-controlled set names into innerHTML

### Changed

- **Saved Sets promoted to first tab** (`index.html`, `js/main.js`) — "My Sets" is now the default active tab so returning users land directly on their content; `loadSavedSets()` is also called on `DOMContentLoaded`
- **Saved sets grid layout** (`css/styles.css`, `js/storage.js`) — changed from a single-column list to a responsive `auto-fill` card grid (min 260 px per card); each card shows a term-count badge, set name, save date, a full-width "Study" CTA, and icon-only secondary actions (Edit, Export, Delete)
- **Empty saved-sets state** (`js/storage.js`) — replaced plain text with an icon + "Create a Set" button that switches to the Create tab

## [1.4.0] - 2026-02-28

### Added

- **2026 Animation Trends** — comprehensive motion design system across 10 trend categories (`css/styles.css`, `js/animations.js`)
  - **`@property` custom properties** — registered `--gradient-angle`, `--glow-opacity`, `--card-glow`, `--btn-spotlight-x/y`, `--count-val` for smooth CSS interpolation of values previously unanimatable
  - **`interpolate-size: allow-keywords`** — enables `height: 0 → auto` transition on hint reveal without JavaScript measurement
  - **`@view-transition`** — cross-document view transitions with named elements (`#questionCard`, `#roundSummary`, `#importSection`) and custom slide/fade keyframes
  - **`@starting-style` entry effects** — cards, modals, toasts, and tab content enter from below with opacity/transform without any JavaScript
  - **Scroll-driven animations** — `.saved-set-item`, `.term-item`, and `.import-method` reveal as they enter the viewport using `animation-timeline: view()` with `animation-range`; scroll-progress bar on `body::before` tracks page scroll with `animation-timeline: scroll()`
  - **Ambient background motion** — two drifting radial-gradient blobs (`body::after`, `.container::before`) animate continuously on a slow Bézier path for atmospheric depth
  - **3D card tilt system** — `perspective(900px)` with JS-driven `--tilt-x`/`--tilt-y` CSS variables updated on `mousemove` via `requestAnimationFrame`; inner elements lift with `translateZ`
  - **Animated typography** — rotating gradient heading on round summary (animated `--gradient-angle`); blinking cursor on `.prompt strong` while the input is focused; `text-pop`/`text-shake-in` keyframes on feedback text; `animateCounter()` utility for rolling score numbers
  - **SVG/icon stroke draw** — `stroke-dasharray` + `stroke-dashoffset` keyframe on button icon paths fires on hover; dark-mode toggle gets a spin frame triggered via `.transitioning` class
  - **Staggered entrance system** — tab buttons, round-summary stat lines, and action buttons cascade in with `nth-child` animation delays (50–460 ms); tab switches re-trigger stagger via forced reflow in `animations.js`
  - **Spotlight cursor glow** — CSS `radial-gradient` at `--btn-spotlight-x/y` on every `.button::before`, coordinates updated live on `mousemove`
  - **Ripple on click** — `.ripple` `<span>` injected at click coordinates, expands and fades via `ripple-expand` keyframe, removed after `animationend`
  - **Motion-blur shake** — incorrect-answer shake keyframe integrates `filter: blur()` for kinetic feel; preserves 3D perspective transforms
  - **Correct/incorrect card states** — `MutationObserver` on `#feedback` applies `.correct-answer` (green glow + pop scale) or `.incorrect-answer` (red glow) to `#questionCard`
  - **Fallback IntersectionObserver** — `animations.js` detects `CSS.supports('animation-timeline', 'scroll()')` and applies `.scroll-revealed` class manually for unsupported browsers
  - **`prefers-reduced-motion` comprehensive block** — disables all new scroll-driven, ambient, 3D, stagger, spotlight, and counter animations; immediately reveals all scroll-reveal targets



### Changed

- Replaced all emoji icons throughout the UI with [Lucide Icons](https://lucide.dev) (SVG icon library) for better scalability, consistency, and accessibility
  - Added Lucide CDN script to `index.html` with `<link rel="preconnect">` for performance
  - Added Lucide icon sizing CSS (`.lucide`, `.title-icon`, tab icon overrides)
  - Replaced emoji in all static HTML buttons, headings, tab labels, hints, and progress stats
  - Replaced emoji in dynamically rendered HTML in `main.js` (`updateTermsList`, `editTerm`, `addTerm`, `toggleFormatHelp`, `toggleDarkMode`)
  - Replaced emoji in dynamically rendered HTML in `storage.js` (`loadSavedSets` saved-set action buttons)
  - Replaced emoji in dialog content in `ui.js` (`showSharedSetDialog`)
  - Removed celebratory emoji from round summary in `quiz-engine.js`
  - Removed emoji `content` values from CSS pseudo-elements (`.button-share::before`, `.copyable::after`)
  - All dynamic renders now call `lucide.createIcons()` to activate freshly inserted icon elements

## [1.2.0] - 2026-02-28

### Added

- `style.md` — design system documentation covering colour tokens, typography scale, shadow system, spacing grid, border radii, timing functions, button variants, and accessibility notes
- Inter variable font loaded via Google Fonts with `<link rel="preconnect">` hints for performance

### Changed

- Complete redesign of `css/styles.css` applying 2025/2026 design trends:
  - **Glassmorphism** — `backdrop-filter: blur()` on container, cards, modals, and toasts
  - **Fluid typography** — all font sizes now use `clamp()` for smooth viewport-responsive scaling
  - **Vibrant gradient palette** — indigo (`#6366f1`) → violet (`#8b5cf6`) primary replaces flat blue
  - **Layered shadow system** — four named shadow tokens (`sm` / `md` / `lg` / `xl`) using brand-tinted color
  - **Pill-shaped buttons** — `border-radius: 9999px` across all button variants
  - **Micro-interactions** — spring-easing hover lifts, icon scale on tab hover, toggle rotation effect
  - **Deep dark mode** — rich `#0f0f17` base with semi-transparent glass surfaces
  - **Animated shimmer** on the progress bar fill
  - **CSS design token system** — expanded to include spacing (`--space-*`), radii (`--radius-*`), and timing (`--ease-*`, `--duration-*`) tokens
  - **`prefers-reduced-motion`** — collapses all animations and transitions for accessibility
  - **`:focus-visible`** — modern keyboard-only focus rings across all interactive elements
  - **Ambient page background** — radial gradient mesh for subtle depth

## [1.1.0] - 2026-02-28

### Changed

- Reorganized project folder structure:
  - Moved all JavaScript files into `js/`
  - Moved all CSS files into `css/`
- Renamed script files to reflect their responsibilities:
  - `script.js` → `js/main.js` — global state, initialization, event listeners, UI navigation, term creation, dark mode
  - `script2.js` → `js/quiz-engine.js` — answer checking, round logic, progress tracking, retry and reset functions
  - `script3.js` → `js/storage.js` — localStorage persistence, file import/export, set saving and loading
  - `script4.js` → `js/ui.js` — DialogSystem, ToastSystem, sharing, session management
- Updated `index.html` asset references to match the new folder structure
