# Design brief

How Polaris looks and how its parts behave when touched. Which features exist is in `REQUIREMENTS.md`, how the app is built is in `ARCHITECTURE.md`. The mock-ups in `mockups/` are the reference implementation: when this text and the mock-ups disagree, the mock-ups win and this file gets fixed.

## 1. Character

Light, soft and calm. A study planner should feel quiet, not busy.

- **Tone, not lines.** No borders and no shadows. Areas are told apart by tone: page, sheet, field, card. The only lines are outlines for focus, selection, editing and errors.
- **Color lives in the courses.** The frame is neutral pearl. Color comes from the course color, which fills course cards, dashboard cards, table headers and calendar entries. Every colored surface uses dark text.
- **Round and friendly.** Large radii, pill tags, circles as the one ornament (a soft circle in the corner of a card).
- **Compact.** 14px base text, 34px buttons, 44px inputs, gaps of 4 to 24px.
- **One typeface** (Manrope), weights 500 to 800, outline icons.
- **No pure white.** Surfaces are tinted pearl. White appears only as a translucent layer on top of an accent color.
- **Plain and consistent.** One radius per role, one tone per role. Values come from the tokens below, never from a new number.

## 2. Files

| File | What it is |
| ---- | ---------- |
| `mockups/base.css` | Structure only: layout, sizes of the frame, table and calendar grids. No colors. |
| `mockups/theme.css` | **All tokens** (section 1 of the file) and the look of every component (sections 2 to 9). |
| `mockups/*.html` | The static screens (section 10), and `mobile-*.html`, the same pages in a phone-sized frame. Open `mockups/index.html` for an overview. |
| `wireframes/` | The structure of every screen. The layout comes from here. |
| `inspo/` | The mood: the original palette and three dashboards. |

**Raw colors exist only in the token block of `theme.css`** (and of `frontend/src/styles.css`). Everything below it uses `var(--...)`. To change the look, change tokens.

## 3. Colors

The base palette comes from `inspo/palette.jpg`: Pearl Bush `#EBDFDC` became the page, Bleached Cedar `#261627` the ink, Matterhorn `#4E3742` the hover color.

### 3.1 Surfaces

| Token | Value | Role |
| ----- | ----- | ---- |
| `--color-page` | `#EBDFDC` | Page, header and navbar (one tone, so the frame disappears). |
| `--color-sheet` | `#F6EFEC` | The content sheet (rounded, lighter than the page), dialogs, login and register card. |
| `--color-sheet-raised` | `#FBF7F5` | Lighter than the sheet: in-place cell inputs. |
| `--color-field` | `#E3D4D0` | Darker than the page: inputs, buttons, selects, the `+` bars, a selected or hovered calendar day. |
| `--color-panel` | field 60% over sheet | Option panels in dialogs. |
| `--color-cell` | field 35% over sheet | A calendar day. |
| `--color-cell-out` | field 30%, transparent | A calendar day outside the month. |

Layering, from back to front: page, sheet, then either an accent card or field-toned controls. Fields are darker than what they sit on, raised things are lighter.

### 3.2 Text and interaction

| Token | Value | Role |
| ----- | ----- | ---- |
| `--color-ink` | `#261627` | Text, primary buttons, the active navigation entry, today in the calendar. |
| `--color-ink-soft` | `#6E5862` | Secondary text, labels, placeholders. |
| `--color-on-ink` | `= --color-page` | Text and icons on an ink surface. |
| `--color-hover` | `#4E3742` | Hover background of buttons and the `+` bars (navigation entries use a light tint instead). |
| `--color-focus` | `= --color-ink` | Focus outline (2px). |
| `--color-danger` | `#9B3D3D` | The only non-palette color. Error icon and error outline. Error text itself is ink. |
| `--color-danger-tint` | danger 12% | Background of the whole-form error banner. |
| `--color-scrim` | ink 40% | Behind dialogs. |
| `--color-ink-on-accent` | ink 84% | Secondary text on an accent color (labels on cards). |

### 3.3 Translucent layers

Rule: ink tints on light surfaces, white glass on accent colors.

| Token | Value | Used for |
| ----- | ----- | -------- |
| `--tint-1` | ink 7% | Hover of navigation entries, ghost button (header). |
| `--tint-2` | ink 9% | Active sub entry, icon buttons on light surfaces. |
| `--tint-3` | ink 14% | The hover tools in tables. |
| `--glass-1` | white 22% | The corner circle on a card. |
| `--glass-2` | white 30% | The "not done yet" box inside a card. |
| `--glass-3` | white 40% | Tags and icon buttons on a colored card. |
| `--glass-4` | white 70% | Checkbox in a table. |

### 3.4 Accent palette

Ten colors for courses and tags: darker pastels with moderate saturation, each clearly different from its neighbors. Hues run around the wheel; `stone` is the neutral. Contrast is measured with the WCAG formula; secondary text (ink 84%) is at least 4.8:1 on every accent.

| Token | Value | Hue | Ink on it |
| ----- | ----- | --- | --------- |
| `--accent-clay` | `#D49A85` | 16 | 7.1 |
| `--accent-mustard` | `#D9B26A` | 39 | 8.6 |
| `--accent-olive` | `#B9B97C` | 60 | 8.4 |
| `--accent-sage` | `#8FB09C` | 144 | 7.2 |
| `--accent-teal` | `#82B5B0` | 174 | 7.5 |
| `--accent-blue` | `#8FA5C9` | 217 | 6.8 |
| `--accent-periwinkle` | `#A59FD2` | 247 | 6.9 |
| `--accent-plum` | `#B592B5` | 300 | 6.3 |
| `--accent-rose` | `#D49BA9` | 345 | 7.4 |
| `--accent-stone` | `#BCA79D` | 19 (neutral) | 7.5 |

**Default: `--accent-clay`**, set once as `--accent-default`. It is the warmest of the ten, belongs to the pearl and ink base, and looks good as a full gallery. `stone` is the quiet alternative. A course picks its color in the course dialog (6.9) and starts with the default. Tags cannot pick one yet and always use it.

A course has one color, `--course-color` (`--tag-color` for a tag), and everything that shows the course reads it: the card fill, the navbar dot, the dashboard heading dot and cards, the table headers, the calendar entries and the circles in the day list. Without a value both fall back to `--accent-default`.

Derived tones, all mixed from `--course-color` over `--color-sheet` and tunable in one place:

| Token | Share of the course color | Where |
| ----- | ------------------------- | ----- |
| `--mix-table-title` | 38% | Title column of a table (the table header is the full color). |
| `--mix-table-body` | 15% | Body cells of a table. |
| `--mix-card-secondary` | 78% | The second dashboard card of a course (Assignments), slightly lighter than the first. |
| `--mix-tag-row` | 30% | A row in the tags dialog. |

An eleventh color needs at least 4.5:1 contrast with ink at 84%, at least 25 degrees of hue distance to its neighbors, and about the same saturation and lightness as the others.

### 3.5 Contrast of the frame

| Pair | Ratio |
| ---- | ----- |
| Ink on page / on sheet / on field | 13.1 / 15.1 / 11.9 |
| Ink soft on page / on sheet / on field | 5.0 / 5.7 / 4.5 |
| Page on ink, page on hover color | 13.1, 8.3 |
| Danger on sheet | 5.9 |

## 4. Typography

Font: **Manrope** (`--font-sans`), weights 400, 500, 600, 700, 800. Fallback: `ui-sans-serif, system-ui, sans-serif`.

| Token | Size | Used for |
| ----- | ---- | -------- |
| `--fs-2xs` | 10px | Calendar entries. |
| `--fs-xs` | 11.5px | Tags, table headers, small caps headings, day numbers. |
| `--fs-sm` | 12.5px | Labels, checkbox labels, errors, weekday names. |
| `--fs-md` | 13.5px | Dense and secondary text: stats, table cells, lists, descriptions, user email. |
| `--fs-base` | 14px | Body, buttons, inputs. |
| `--fs-lg` | 16px | Card titles, titles of option panels. |
| `--fs-h2` | 18px | Section headings (a course on the dashboard, a table, the month), brand. |
| `--fs-dialog` | 20px | Dialog title. |
| `--fs-auth` | 24px | Login and register title. |
| `--fs-h1` | 26px | Page title. |

Weights: `--fw-medium` 500 (secondary navigation, labels), `--fw-semibold` 600 (buttons, navigation, tags, row titles), `--fw-bold` 700 (headings, active entries), `--fw-extrabold` 800 (page title, brand, dialog title).
Tracking: `--tracking-h1` -0.03em, `--tracking-heading` -0.02em, `--tracking-caps` +0.08em (only for the small uppercase headings such as "NOT DONE YET"). Line height 1.45. Uppercase is used nowhere else.

## 5. Shape and size

### 5.1 Radii

The bigger the surface, the bigger the radius; an element inside another has a smaller radius than its container. Circles (50%) are used for dots, hover tools and the corner ornament.

| Token | Value | Used for |
| ----- | ----- | -------- |
| `--radius-xs` | 6px | Checkbox, calendar entry. |
| `--radius-sm` | 10px | Icon buttons, table cells, sub entries, `+` bars, brand mark, cell inputs. |
| `--radius-md` | 12px | Buttons, navigation entries, calendar days, list rows. |
| `--radius-lg` | 14px | Inputs, large buttons, banners, the box inside a card. |
| `--radius-xl` | 18px | Option panels. |
| `--radius-card` | 22px | Course and dashboard cards. |
| `--radius-sheet` | 24px | The content sheet. |
| `--radius-dialog` | 26px | Dialogs, login and register card. |
| `--radius-pill` | 999px | Tags. |

### 5.2 Sizes

| Token or value | Size |
| -------------- | ---- |
| `--header-h` | 56px |
| `--sidebar-w` | 220px (entries 36px high, sub entries 32px, padding 8px 12px) |
| `--control-h` | 34px (buttons, selects) |
| `--field-h` | 44px (inputs, the square add button) |
| Content sheet | margin 0 16px 16px 0, padding 28px 32px 40px |
| Icons | 18px, stroke `--icon-stroke` 1.8, round caps |
| Motion | `--duration` .15s, background only |

Spacing in use: 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40. Gap between cards 16px; between sections 28 to 30px; page title to content 16px.

## 6. Components

The structure of each screen comes from the wireframes. This section says how each piece looks and reacts.

### 6.1 Frame

- **Header.** 56px, page tone (no bar). Brand left: a 30px ink rounded square (`--radius-sm`) with a four-point star, then "Polaris" in extrabold 18px. Right: the Tags button, the user email in soft ink, the Log out button, both buttons ghost (`--tint-1`) with a leading icon. Login and register show only the brand.
- **Navbar.** 220px, page tone, no divider. Entries: icon, label, semibold, `--radius-md`, hover `--tint-1`, **active = ink fill with `--color-on-ink` text**. "Courses" expands (chevron rotates) to the course list: dot in the course color, 13.5px, soft ink; hover `--tint-1`; the current course is `--tint-2` and bold.
- **Content sheet.** `--color-sheet`, `--radius-sheet`, fills the rest of the window.
- **Page head.** Title (h1) left, actions right: the back button, the dashboard filters, and on the courses page the Tags filter (the same select as on the dashboard).

### 6.2 Buttons

All buttons: `--control-h`, `--radius-md`, semibold, field tone, **hover = `--color-hover` with `--color-on-ink` text**, 0.15s. One primary action per area; no outlined or text-only buttons.

| Variant | Look |
| ------- | ---- |
| Default | Field tone. |
| Primary (add, create, save, log in, register) | Ink fill, on-ink text. |
| Ghost (header) | `--tint-1`. |
| Square icon (add) | 44px, `--radius-lg`, primary. |
| Select (filters, statistic) | Default button with a chevron after the label. Long values are cut with an ellipsis. A multi-select (filters) opens a list of checkboxes under the button (`--color-panel`, `--radius-lg`, checkboxes in `--color-sheet`) and shows the number selected, e.g. "Tags (2)". |
| Small icon button | 30px, `--radius-sm`, `--glass-3` on a colored card, `--tint-2` on light surfaces; hover = ink fill with an on-ink icon (`--color-hover` in the calendar). |
| Auth submit | Full width, 46px, `--radius-lg`. |

### 6.3 Form controls

- **Text input.** 44px, `--radius-lg`, field tone, padding 0 16px, no border. Placeholder `--color-ink-soft`. Focus: 2px `--color-focus` outline, 2px offset (inputs outline themselves).
- **Input with a swatch** (new tag): the field has the tag color swatch (16px circle) inside at the left.
- **Invalid input.** 2px `--color-danger` outline, and the message under it: 16px danger icon plus ink text, 12.5px semibold. A whole-form error is a banner instead (`--color-danger-tint`, `--radius-lg`, danger icon, ink text).
- **Checkbox.** 16px, `--radius-xs`, field tone; checked = ink fill with an on-ink checkmark. In tables 17px with `--glass-4` instead of field tone.
- **Label.** 12.5px bold, soft ink, above the input.

### 6.4 Tags

Pill (`--radius-pill`), `--glass-3` on the card, 11.5px semibold, padding 3px 10px. On the sheet (the course page) the pill is `--color-field`. The tag color shows in the tags dialog (swatch and row tint), not on the pill.

### 6.5 Course card (courses page)

The card is **filled with `--course-color`**, ink text, `--radius-card`, 168px high at least, padding 20px 18px 14px. A soft circle (`--glass-1`, 108px) hangs out of the top right corner, clipped by the card. Title 16px bold, tags under it, then the description (13.5px, `--color-ink-on-accent`, cut after 150 characters with an ellipsis), and the two icon buttons (edit, delete) at the bottom right. Clicking the card opens the course, the buttons do not. Four cards per row, 16px gap. Editing happens in the course dialog (6.9), the card has no edit state.

### 6.6 Dashboard cards

Per course: a heading (a dot in the course color and the name, 18px bold), then two cards side by side, as tall as the taller one. Both are filled with the course color; the second (Assignments) is `--mix-card-secondary`. Inside: title 16px bold; stats as label and value on one line (label in `--color-ink-on-accent`, value semibold, right aligned); the "not done yet" list in a `--glass-2` box with a `--radius-lg`, small caps heading, 6px ink dots. Empty states are plain text in `--color-ink-on-accent`.

### 6.7 Course page tables

- **Under the title** the course page shows the tags of the course (field-toned pills) and below them the full description: 14px ink, at most 720px wide, line breaks kept. Both are left out when empty and the tables move up.
- **Grid.** Title column 224px, every other column 144px. Header row 44px, body rows 40px, 2px gap between cells, `--radius-sm` on every cell. Boolean cell: centered checkbox. Number cell: centered number, tabular figures.
- **Colors.** Header cells are the full course color with ink text (11.5px bold). The title column is `--mix-table-title`, semibold. The body is `--mix-table-body`.
- **Long titles** wrap onto further lines instead of being cut. The row grows, its other cells stay vertically centered.
- **Add bars.** A 20px bar on the right of the table and a 20px bar below it, 4px away from the table, field tone, soft ink `+`, hover `--color-hover`.
- **Hover tools.** On a column header two 18px circles appear at the right inside the cell (`--tint-3`): edit (number columns only) and delete. A row title only has delete. Hover of a tool: ink fill.
- **In-place edit.** The cell holds an input (`--color-sheet-raised`, `--radius-sm`, 2px ink outline, semibold). Enter or leaving the field saves, Escape drops the change. A new row starts as "Default lecture." or "Default assignment." and a new column as "Default bool-col." or "Default num-col.", already in edit mode.
- The two tables sit side by side while they fit and wrap under each other when they do not.

### 6.8 Calendar

- Month header: a 32px icon button each side, the month centered (18px bold). Weekday names 12.5px semibold, soft ink.
- Grid: 7 columns, 3px gap, rows 96px. A day is `--color-cell`, `--radius-md`, number top left (11.5px bold, soft ink).
- **Entries:** pills in the course color, ink text, 10px bold, `--radius-xs`. A day shows the first four entries and cuts the rest.
- **States:** outside the month = `--color-cell-out`, no number; hover = `--color-field`; **selected** = field tone with a 2px ink outline; **today** = ink fill with an on-ink number (the strongest tone); today and selected together = the outline moves 1px outside.
- Day panel on the right (332px, no card): date as h2, two selects and a primary square button, then the entries: 11px circle in the course color, text, remove button.

### 6.9 Dialogs

A scrim (`--color-scrim`) over the whole page, a centered 460px panel: `--color-sheet`, `--radius-dialog`, padding 26px. Head: title (20px extrabold) and a close icon button. The page behind stays visible. A dialog higher than the window scrolls (at most the window height minus 32px).

- **Tags dialog:** new tag input with swatch and a square add button, then rows (38px, `--radius-md`, `--mix-tag-row` tint of the tag color, swatch and name). Click a name to rename it in place; the delete circle (same as the table tools) appears on hover at the right of the row. The swatch is not clickable yet.
- **Course dialog** (title "Edit the course", opened by the edit button of a card; adding a course stays the input above the cards): four option panels like the column dialogs, each with a label (12.5px bold, soft ink): the title (input), the tags (checkbox rows like the tags filter, two per line, boxes in `--color-sheet`), the description (multi-line input, three rows, can be resized) and the color (the ten accents as 28px circles with an 8px gap, the chosen one with a 2px ink outline 2px away from the circle). Cancel (field tone) and Save (primary) sit centered at the bottom.
- **Column dialogs:** option panels (`--color-panel`, `--radius-xl`, padding 16px 18px) with the title and its control on one line, inputs below in `--color-sheet` (42px), the action button centered at the bottom.

### 6.10 Login and register

`--color-page` page under the plain header. A card 420px wide at most, `--color-sheet`, `--radius-dialog`, padding 36px 32px 28px, with a corner circle in a 20% tint of `--accent-default`. Centered title (24px). Login shows the error banner under the title; register shows the field error under the password input. Submit button full width. Below it the link to the other screen (bold, underlined).

### 6.11 Mobile layout

Below **768px** the layout changes, above it nothing does. Same tokens, no new colors.

- **Header.** Stays at the top while the page scrolls. Brand left; right the Tags button (icon only) and a square burger button (ghost, 34px), which turns into a cross while the navbar is open. The email and Log out leave the header.
- **Navbar.** The burger opens it from the header downward over the content, full width, page tone, scrolling if it is taller than the window. The entries are the desktop ones (Courses expands to the course list, Dashboard, Calendar), **Log out is the last entry**, pushed to the bottom. Choosing an entry closes it. Entries are 44px high and list entries 40px, so they are easy to hit.
- **Content sheet.** Margin 0 8px 8px, padding 16px 16px 28px.
- **Page head.** Stacked: the title, then directly under it the tags filter, the back button or the dashboard filters.
- **One column.** Course cards, the lecture table above the assignment table, and the two dashboard cards are one per row. A table wider than the sheet scrolls inside its own area, the page never scrolls sideways.
- **Calendar.** Month grid on top, the day panel below it at full width. Rows are 56px high. A day shows its entries as 7px dots in the course color, up to eight (the text does not fit); the day panel lists them with names.
- **Dialogs.** 100% wide minus a 16px margin, padding 20px, option panels 14px 16px. A dialog starts 12px below the header, which the scrim covers like the rest of the page, and is at most as high as the space under it (window height minus the header and 28px); the content scrolls if it is higher. In the course dialog the ten colors wrap into **two rows of five**, spread over the full width, and the number inputs of the column dialogs stand one under the other. There is no wireframe or mock-up of its own for this: it is the desktop dialog with these changes, `courses-edit-dialog.html` shows it in a window narrower than 768px.
- **Preview.** `mobile-*.html` show the responsive pages in a 360px wide frame (the narrowest supported screen). `mobile-navbar.html` opens the navbar through the address `#nav`, which the burger uses too.

## 7. States

Hover, active and selected states are described with their component. The rest:

| State | Look |
| ----- | ---- |
| Editing (cell) | Raised tone and a 2px ink outline. |
| Error | 2px `--color-danger` outline, danger icon, ink message. |
| Disabled | Not designed yet. |

## 8. Icons

Inline SVG, 24px grid, shown at 18px (11px inside the hover tools, 14px in the `+` bars), stroke only, `currentColor`, round caps and joins. Used: courses (book), dashboard (four squares), calendar, tag, log out, pencil, cross, check, plus, chevrons (down, left, right), arrow left, burger, alert (circle with a mark). The brand mark is a filled four-point star.

## 9. Rules for new components

1. Take every value from a token. If one is missing, add a token.
2. Separate with tone, not lines. An outline only means focus, selection, editing or error.
3. A colored surface uses a course or accent color, dark text, and white glass for what is inside it.
4. Fields are darker than their surface, raised things are lighter. A child has a smaller radius than its parent.
5. One primary (ink) action per area, everything else is field-toned. Buttons hover to `--color-hover`, navigation and list items to a light tint.
6. Text sizes come from the scale in section 4. Check contrast: at least 4.5:1 for ink and for secondary text on an accent.

## 10. Screens

| Screen | Wireframe | Mock-up |
| ------ | --------- | ------- |
| Courses | `courses.svg` | `courses.html` |
| Tags dialog | `courses-tags-overlay.svg` | `courses-tags-overlay.html` |
| Course dialog (edit) | `courses-edit-dialog.svg` | `courses-edit-dialog.html` |
| Dashboard | `dashboard.svg` | `dashboard.html` |
| Log in (error banner) | `auth-login.svg` | `auth-login.html` |
| Register (field error) | `auth-register.svg` | `auth-register.html` |
| Course, tables side by side | `course-tables-side-by-side.svg` | `course-tables-side-by-side.html` |
| Course, tables stacked | `course-tables-stacked.svg` | `course-tables-stacked.html` |
| Course, empty tables | `course-tables-empty.svg` | `course-tables-empty.html` |
| Course, table interactions | `course-table-interactions.svg` | `course-table-interactions.html` |
| Add column dialog | `course-add-column-dialog.svg` | `course-add-column-dialog.html` |
| Edit column dialog | `course-edit-column-dialog.svg` | `course-edit-column-dialog.html` |
| Calendar, today selected | `calendar-today-selected.svg` | `calendar-today-selected.html` |
| Calendar, other day selected | `calendar-other-day-selected.svg` | `calendar-other-day-selected.html` |

The interactions mock-up shows the hover states forced on at once with the class `hot`; in the app they come from `:hover`. The text under it is a note for the mock-up only.

The tables side by side now only fit with few columns, because the title column is wider (224px): Lectures with two number or checkbox columns next to Assignments with one. Everything else wraps under each other.

Mobile (below 768px, section 6.11):

| Screen | Wireframe | Mock-up |
| ------ | --------- | ------- |
| Courses | `mobile-courses.svg` | `mobile-courses.html` |
| Course (tables one under the other) | `mobile-course.svg` | `mobile-course.html` |
| Dashboard | `mobile-dashboard.svg` | `mobile-dashboard.html` |
| Calendar | `mobile-calendar.svg` | `mobile-calendar.html` |
| Log in | `mobile-login.svg` | `mobile-login.html` |
| Navbar open | `mobile-navbar.svg` | `mobile-navbar.html` |

## 11. Open points

- **Tag color** cannot be chosen, tags use `--accent-default`.
- **Disabled state** and **empty states** beyond the table and dashboard ones are not designed.
- **Tablets.** Between 768px and about 1000px the wide layout is used as it is.
- **Calendar entries** are 10px text, readable by contrast but small. If that is too small in use, the day cells need to grow.
- **Dark theme** is not planned. It would be a second set of the tokens in section 3.
