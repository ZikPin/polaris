# Design brief

The visual design of Polaris. This is the guide for the real styling (T-020). The mock-ups in `mockups/` are the reference implementation: when this text and the mock-ups disagree, the mock-ups win and this file gets fixed.

## 1. Character

Light, soft and calm. A study planner should feel quiet, not busy.

- **Tone, not lines.** There are no borders and no shadows. Areas are told apart by tone: page, sheet, field, card. The only lines are outlines for focus, selection and editing.
- **Color lives in the courses.** The frame is neutral pearl. Color comes from the course color, which fills course cards, dashboard cards, table headers and calendar entries. Every colored surface uses dark text.
- **Round and friendly.** Large radii, pill tags, circles as the one ornament (a soft circle in the corner of a card).
- **Compact.** 14px base text, 34px buttons, 44px inputs, gaps of 4 to 24px.
- **One typeface** (Manrope), weights 500 to 800, outline icons.
- **No pure white.** Surfaces are tinted pearl. White appears only as a translucent layer on top of an accent color.
- **Plain and consistent.** One radius per role, one tone per role. A new component takes its values from the tokens below, never from a new number.

## 2. Files

| File | What it is |
| ---- | ---------- |
| `mockups/base.css` | Structure only: layout, sizes of the frame, table and calendar grids. No colors. |
| `mockups/theme.css` | **All tokens** (section 1 of the file) and the look of every component (sections 2 to 9). |
| `mockups/*.html` | The 13 screens, static. Open `mockups/index.html` for an overview. |
| `wireframes/` | The structure of every screen. The layout comes from here. |
| `inspo/` | The mood: the original palette and three dashboards. |

**Rule: raw colors exist only in the token block of `theme.css`.** Everything below that block uses `var(--...)`. To change the look, change tokens. The mock-ups load the font from Google Fonts; the app should bundle it.

## 3. Colors

The base palette comes from `inspo/palette.jpg`: Pearl Bush `#EBDFDC` became the page, Bleached Cedar `#261627` became the ink, Matterhorn `#4E3742` became the hover color. Copper Rose and Gun Powder are no longer used.

### 3.1 Surfaces

| Token | Value | Role |
| ----- | ----- | ---- |
| `--color-page` | `#EBDFDC` | Page, header and navbar (one tone, so the frame disappears). |
| `--color-sheet` | `#F6EFEC` | The content sheet (rounded, lighter than the page), dialogs, login and register card. |
| `--color-sheet-raised` | `#FBF7F5` | Lighter than the sheet: the edit card, in-place cell inputs. |
| `--color-field` | `#E3D4D0` | Darker than the page: inputs, buttons, selects, the `+` bars, a selected or hovered calendar day. |
| `--color-panel` | field 60% over sheet | Option panels in the column dialogs. |
| `--color-cell` | field 35% over sheet | A calendar day. |
| `--color-cell-out` | field 30%, transparent | A calendar day outside the month. |

Layering, from back to front: page, sheet, then either an accent card or field-toned controls. Fields are always darker than what they sit on; raised things (edit card, cell inputs) are lighter.

### 3.2 Text and interaction

| Token | Value | Role |
| ----- | ----- | ---- |
| `--color-ink` | `#261627` | Text, primary buttons, the active navigation entry, today in the calendar. |
| `--color-ink-soft` | `#6E5862` | Secondary text, labels, placeholders. |
| `--color-on-ink` | `= --color-page` | Text and icons on an ink surface. |
| `--color-hover` | `#4E3742` | Hover background of buttons and the `+` bars (navigation entries use a light tint instead, see states). |
| `--color-focus` | `= --color-ink` | Focus outline (2px). |
| `--color-danger` | `#9B3D3D` | The only non-palette color. Error icon and error outline. Error text itself is ink. |
| `--color-danger-tint` | danger 12% | Background of the whole-form error banner. |
| `--color-scrim` | ink 40% | Behind dialogs. |
| `--color-ink-on-accent` | ink 84% | Secondary text on an accent color (labels on cards). |

### 3.3 Translucent layers

| Token | Value | Used for |
| ----- | ----- | -------- |
| `--tint-1` | ink 7% | Hover of navigation entries, ghost button (header). |
| `--tint-2` | ink 9% | Active sub entry, icon buttons on light surfaces. |
| `--tint-3` | ink 14% | The hover tools in tables. |
| `--glass-1` | white 22% | The corner circle on a card. |
| `--glass-2` | white 30% | The "not done yet" box inside a card. |
| `--glass-3` | white 40% | Tags and icon buttons on a colored card. |
| `--glass-4` | white 70% | Checkbox in a table. |

Rule: ink tints on light surfaces, white glass on accent colors.

### 3.4 Accent palette

Ten colors for courses and tags. They are darker pastels with moderate saturation, so dark ink text has at least 6.3:1 contrast on every one of them, and each is clearly different from the neighbors. Hues run around the wheel; `stone` is the neutral.

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

**Default: `--accent-clay`**, set once as `--accent-default`. The app has no way to choose a color yet, so every course and tag uses the default, and it decides the whole first impression. Clay is the warmest of the ten, belongs to the pearl and ink base, and looks good as a full gallery. `stone` is the quiet alternative; changing the default is a one-line change.

How a color reaches a component:

- A course element sets `--course-color` (for example `style="--course-color: var(--accent-sage)"`). Everything inside it reads that variable: the card fill, the dashboard cards, the table header, the calendar entries, the navbar dot.
- A tag element sets `--tag-color` in the same way.
- Without a value, both fall back to `--accent-default`.
- The mock-ups use assorted accents to show the palette. The app uses the default until colors can be chosen.

Derived tones, all mixed from `--course-color` over `--color-sheet` and tunable in one place:

| Token | Share of the course color | Where |
| ----- | ------------------------- | ----- |
| `--mix-table-title` | 38% | Title column of a table (the table header is the full color). |
| `--mix-table-body` | 15% | Body cells of a table. |
| `--mix-card-secondary` | 78% | The second dashboard card of a course (Assignments), slightly lighter than the first. |
| `--mix-tag-row` | 30% | A row in the tags dialog. |

To add an eleventh color, it must have at least 4.5:1 contrast with `--color-ink` at 84% (secondary text), be at least 25 degrees of hue away from its neighbors, and stay about as saturated and as light as the others, so that the gallery stays calm.

### 3.5 Contrast

Measured with the WCAG formula.

| Pair | Ratio |
| ---- | ----- |
| Ink on page / on sheet / on field | 13.1 / 15.1 / 11.9 |
| Ink on any accent | 6.3 to 8.6 |
| Secondary text (ink 84%) on any accent | at least 4.8 |
| Ink soft on page / sheet / field | 5.0 / 5.7 / 4.5 |
| Page on ink (text on primary button, active entry) | 13.1 |
| Page on hover color | 8.3 |
| Danger on sheet | 5.9 |

Known weak spot: the calendar entries are 10px text, readable by contrast but small.

## 4. Typography

Font: **Manrope** (`--font-sans`), weights 400, 500, 600, 700, 800. Fallback: `ui-sans-serif, system-ui, sans-serif`.

| Token | Size | Used for |
| ----- | ---- | -------- |
| `--fs-2xs` | 10px | Calendar entries. |
| `--fs-xs` | 11.5px | Tags, table headers, small caps headings, day numbers. |
| `--fs-sm` | 12.5px | Labels, checkbox labels, errors, weekday names. |
| `--fs-md` | 13.5px | Dense and secondary text: stats, table cells, lists, user email. |
| `--fs-base` | 14px | Body, buttons, inputs. |
| `--fs-lg` | 16px | Card titles, titles of option panels. |
| `--fs-h2` | 18px | Section headings (a course on the dashboard, a table, the month), brand. |
| `--fs-dialog` | 20px | Dialog title. |
| `--fs-auth` | 24px | Login and register title. |
| `--fs-h1` | 26px | Page title. |

Weights: `--fw-medium` 500 (secondary navigation, labels), `--fw-semibold` 600 (buttons, navigation, tags, row titles), `--fw-bold` 700 (headings, active entries), `--fw-extrabold` 800 (page title, brand, dialog title).
Tracking: `--tracking-h1` -0.03em, `--tracking-heading` -0.02em, `--tracking-caps` +0.08em (only for the small uppercase headings such as "NOT DONE YET").
Line height 1.45. Uppercase is used nowhere else.

## 5. Shape and size

### 5.1 Radii

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

Circles (50%) are used for dots, hover tools and the corner ornament. Rule: the bigger the surface, the bigger the radius; an element inside another has a smaller radius than its container.

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

All structure comes from the wireframes. This section only says how each piece looks.

### 6.1 Frame

- **Header.** 56px, page tone (no bar). Brand left: a 30px ink rounded square (`--radius-sm`) with a four-point star, then "Polaris" in extrabold 18px. Right: the Tags button, the user email in soft ink, the Log out button, both ghost buttons (`--tint-1`) with a leading icon. Login and register show only the brand.
- **Navbar.** 220px, page tone, no divider. Entries: icon, label, semibold, `--radius-md`, hover `--tint-1`, **active = ink fill with `--color-on-ink` text**. "Courses" expands (chevron rotates) to the course list: dot in the course color, 13.5px, soft ink; hover `--tint-1`; the current course is `--tint-2` and bold.
- **Content sheet.** `--color-sheet`, `--radius-sheet`, fills the rest of the window.
- **Page head.** Title (h1) left, actions right (the back button, the dashboard filters) and the Tags filter of the courses page (REQ-F-29), the same select as on the dashboard.

### 6.2 Buttons

All buttons: `--control-h`, `--radius-md`, semibold, field tone, **hover = `--color-hover` with `--color-on-ink` text**, 0.15s.

| Variant | Look |
| ------- | ---- |
| Default | Field tone. |
| Primary (add, create, save, log in, register) | Ink fill, on-ink text. Hover as above. |
| Ghost (header) | `--tint-1`. |
| Square icon (add) | 44px, `--radius-lg`, primary. |
| Select (filters, statistic) | Default button with a chevron after the label. Long values are cut with an ellipsis. A multi-select (filters) opens a list of checkboxes under the button (`--color-panel`, `--radius-lg`, checkboxes in `--color-sheet`) and shows the number selected, e.g. "Tags (2)". |
| Small icon button | 30px, `--radius-sm`, `--glass-3` on a colored card, `--tint-2` on light surfaces; hover ink with on-ink icon. |
| Auth submit | Full width, 46px, `--radius-lg`. |

There is one primary action per area. No outlined or text-only buttons.

### 6.3 Form controls

- **Text input.** 44px, `--radius-lg`, field tone, padding 0 16px, no border. Placeholder `--color-ink-soft`. Focus: 2px `--color-focus` outline.
- **Input with a swatch** (new tag): the field has the tag color swatch (16px circle) inside at the left.
- **Invalid input.** 2px `--color-danger` outline, and the message under it: 16px danger icon plus ink text, 12.5px semibold. A whole-form error is a banner instead (`--color-danger-tint`, `--radius-lg`, danger icon, ink text).
- **Checkbox.** 16px, `--radius-xs`, field tone; checked = ink fill with an on-ink checkmark. In tables 17px with `--glass-4` instead of field tone.
- **Label.** 12.5px bold, soft ink, above the input.

### 6.4 Tags

Pill (`--radius-pill`), `--glass-3` on the card, 11.5px semibold, padding 3px 10px. The tag color shows in the tags dialog (swatch and row tint), not on the pill.

### 6.5 Course card (courses page)

The card is **filled with `--course-color`**, ink text, `--radius-card`, 168px high at least, padding 20px 18px 14px. A soft circle (`--glass-1`, 108px) hangs out of the top right corner, clipped by the card. Title 16px bold, tags under it, the two icon buttons (edit, delete) at the bottom right. Four cards per row, 16px gap.

**Edit state:** the card turns `--color-sheet-raised` with a 2px ink outline (inside the edge), the corner circle becomes a 24% tint of the course color, the title becomes a 36px input, the tags become checkbox rows, the buttons become save (primary) and cancel.

### 6.6 Dashboard cards

Per course: a heading (a dot in the course color and the name, 18px bold), then two cards side by side, as tall as the taller one. Both are filled with the course color; the second (Assignments) is `--mix-card-secondary`. Inside: title 16px bold; stats as label and value on one line (label in `--color-ink-on-accent`, value semibold, right aligned); the "not done yet" list in a `--glass-2` box with a `--radius-lg`, small caps heading, 6px ink dots. Empty states are plain text in `--color-ink-on-accent`.

### 6.7 Course page tables

- Columns: title column 168px, every other column 144px. Header row 44px, body rows 40px, 2px gap between cells, `--radius-sm` on every cell.
- **Header cells** are the full course color with ink text (11.5px bold). **Title column** is `--mix-table-title`, semibold. **Body** is `--mix-table-body`.
- Boolean cell: centered checkbox. Number cell: centered number, tabular figures.
- **Add bars:** a 20px bar on the right of the table and a 20px bar below it, 4px away from the table, field tone, soft ink `+`, hover `--color-hover`.
- **Hover tools:** on a column header (and a row title) two 18px circles appear at the right inside the cell (`--tint-3`): the edit circle (only on number columns) and the delete circle; on a row title only delete. Hover of a tool: ink fill.
- **In-place edit:** the cell holds an input (`--color-sheet-raised`, `--radius-sm`, 2px ink outline, semibold). A new column starts with a default label that is edited this way. Enter or leaving the field saves, Escape drops the change. A new row starts with the title "Default lecture." or "Default assignment." and a new column with "Default bool-col." or "Default num-col.", and the new title or label is edited at once.
- Tables sit side by side while they fit and wrap under each other when they do not.

### 6.8 Calendar

- Month header: a 32px icon button each side, the month centered (18px bold). Weekday names 12.5px semibold, soft ink.
- Grid: 7 columns, 3px gap, rows 96px. A day is `--color-cell`, `--radius-md`, number top left (11.5px bold, soft ink).
- **Entries:** pills in the course color, ink text, 10px bold, `--radius-xs`. A day shows the first four entries and cuts the rest.
- **States:** outside the month = `--color-cell-out`, no number; hover = `--color-field`; **selected** = field tone with a 2px ink outline; **today** = ink fill with an on-ink number (the strongest tone); today and selected together = the outline moves 1px outside.
- Day panel on the right (332px, no card): date as h2, two selects and a primary square button, then the entries: 11px circle in the course color, text, remove button.

### 6.9 Dialogs

A scrim (`--color-scrim`) over the whole page, a centered 460px panel: `--color-sheet`, `--radius-dialog`, padding 26px. Head: title (20px extrabold) and a close icon button. The page behind stays visible.

- **Tags dialog:** new tag input with swatch and a square add button, then rows (38px, `--radius-md`, `--mix-tag-row` tint of the tag color, swatch and name). Click a name to rename it in place; the delete circle (same as the table tools) appears on hover at the right of the row. The swatch is not clickable yet.
- **Column dialogs:** option panels (`--color-panel`, `--radius-xl`, padding 16px 18px) with the title and its control on one line, inputs below in `--color-sheet` (42px), the action button centered at the bottom.

### 6.10 Login and register

`--color-page` page under the plain header. A card 420px wide at most, `--color-sheet`, `--radius-dialog`, padding 36px 32px 28px, with a corner circle in a 20% tint of `--accent-default`. Centered title (24px). Login shows the error banner under the title; register shows the field error under the password input. Submit button full width. Below it the link to the other screen (bold, underlined).

## 7. States

| State | Look |
| ----- | ---- |
| Hover: buttons, `+` bars | `--color-hover` fill, `--color-on-ink` text. |
| Hover: small icon buttons | Ink fill with an on-ink icon on a colored card; `--color-hover` in the calendar and the edit card. |
| Hover: navigation entries, sub entries | `--tint-1`. |
| Hover: calendar day | `--color-field`. |
| Focus | 2px `--color-focus` outline, 2px offset. Inputs outline themselves. |
| Active navigation | Ink fill, on-ink text. |
| Selected (calendar day) | Field tone and a 2px ink outline. |
| Editing (card, cell) | Raised tone and a 2px ink outline. |
| Error | 2px `--color-danger` outline, danger icon, ink message. |
| Disabled | Not designed yet. |

## 8. Icons

Inline SVG, 24px grid, shown at 18px (11px inside the hover tools, 14px in the `+` bars), stroke only, `currentColor`, round caps and joins. Used: courses (book), dashboard (four squares), calendar, tag, log out, pencil, cross, check, plus, chevrons (down, left, right), arrow left, alert (circle with a mark). The brand mark is a filled four-point star.

## 9. Rules for new components

1. Take every value from a token. If one is missing, add a token, do not inline a number or a color.
2. Separate with tone, not lines. No borders, no shadows. An outline only means focus, selection, editing or error.
3. A colored surface uses a course or accent color, dark text, and white glass for what is inside it.
4. Fields are darker than the surface they sit on. Raised things (edit, in-place input) are lighter.
5. The bigger the surface the bigger the radius, and a child has a smaller radius than its parent.
6. One primary (ink) action per area. Everything else is a field-toned button.
7. Hover on buttons is `--color-hover` with `--color-on-ink`; navigation and list items get a light tint.
8. New text sizes come from the scale in section 4.
9. Check contrast: ink on the accent, secondary text on the accent, at least 4.5:1.

## 10. Screens

| Screen | Wireframe | Mock-up |
| ------ | --------- | ------- |
| Courses (with one card in edit state) | `courses.svg` | `courses.html` |
| Tags dialog | `courses-tags-overlay.svg` | `courses-tags-overlay.html` |
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

## 11. Open points

- **Choosing a course or tag color** is not part of the app yet. Until then everything uses `--accent-default`; the ten accents are ready for when it exists.
- **Font delivery.** The mock-ups load Manrope from Google Fonts; the app should serve it itself.
- **Disabled state** and **empty states** beyond the table and dashboard ones are not designed.
- **Narrow windows.** The design is made for about 1280px wide. Mobile is not designed.
- **Calendar entries** are 10px text; if that is too small in use, the day cells need to grow.
- **Dark theme** is not planned. It would be a second set of the tokens in section 3.
