# AI Factory visual alignment evidence — 2026-10-05

## Result

**PASS WITH WARNINGS** for the implemented Pipeline surfaces. The authenticated browser comparison covered
Pipelines, iteration details, Compare iterations, and the shared Test Case Library shell against both the
supplied `ai-factory-bootcamp-poc-prototype-en.html` and the current ReportPortal application patterns.

The existing ReportPortal design system remains authoritative when the standalone prototype differs: UI-kit
controls, application typography, page-header spacing, CSS custom properties, and the existing Library search
interaction are retained.

A source-level pass also covered every AI Factory stylesheet and its host wiring: lifecycle/evaluation/cost,
review comments, automation, backlinks, approval/gates, Library cells/filters/side panel, Pipeline settings,
iteration panels, and Compare. These surfaces already use the application font, UI-kit custom properties,
shared collapsible sections/buttons/badges, and the established 13 px / 20 px or 12 px / 18 px text rhythm;
no prototype-only hardcoded palette or replacement page component was introduced.

## Traceability and findings

| Surface | Browser evidence | Result |
|---------|------------------|--------|
| Project sidebar | Authenticated localhost sidebar with Pipelines active | Fixed: the Pipelines glyph geometry is centered in the shared 48 x 40 px icon canvas, matching the alignment of the surrounding application navigation icons. |
| Pipelines list | Authenticated localhost mock catalog with both generation and automation groups | Fixed: iteration cards now use the application's white surface/shadow treatment, 4 px radius, stronger header/outcome hierarchy, wrapping metadata, equal-width stage steps with explicit flow arrows, and compact rectangular attribute tags. Existing `SearchField`, buttons, status badges, and status dots remain reused. |
| Iteration details | Running iteration 103 and in-review iteration 102 | Fixed: header/body alignment, KPI tiles, banner, equal stage-card widths, tables, token-usage line height, and panel surfaces follow application patterns. The shared card radius was normalized from 8 px to 4 px, the grade disclosure column is fixed at 48 px, and an expanded grade row remained open across the next 5-second background poll. |
| Compare iterations | Default comparison for iterations 102/103 | Pass: selectors, warning, stage grid, metrics table, typography, and wrapping are consistent. Card/table radius was normalized to the same 4 px application value. |
| Test Case Library shell | Authenticated Library list with expandable icon search and AI quick filters | Pass: the existing application component/layout is retained; no replacement search or custom page chrome was introduced. |
| Test Case AI details, review, cost, lifecycle, automation | Pipeline case links for demo IDs 1005–1008 | Not visually revalidated: the mock iteration links target local demo IDs that do not exist as real TMS cases in `superadmin-personal`, so the Library redirects with its standard missing-item alert. The overlay intentionally enriches matching real `TC101`–`TC108` display IDs and does not seed them. This is the existing Q-ORG-07/runtime-fixture boundary, not hidden by this visual change. |

## Validation

- Node 20.19.1 dev compilation: PASS.
- Focused visual Jest: 3 suites / 30 tests: PASS.
- Pipeline reducer and grade disclosure Jest: 2 suites / 33 tests: PASS.
- TypeScript `tsc --noEmit`: PASS.
- Focused ESLint: PASS.
- Stylelint: exit 0 with the repository's existing 199 warnings and no errors.
- `git diff --check`: PASS.
- Authenticated desktop browser after the change: PASS for Pipelines.
- Explicit 360 px override: **not evidenced in this run**. The connected Chrome extension continued to report
  a 1920 px client width even for a fresh tab after requesting 360 px. The new mobile rules are bounded to the
  iteration-card layout and keep a single-column stage flow, but no 360 px visual claim is made here.

No demo Reset, Push, lifecycle, automation, or remote write operation was used. Browser-local demo data and
the supplied HTML prototype were not modified.

## Addendum — deeper source-level pass

A follow-up pass read every remaining AI Factory `.tsx`/`.scss` file not yet individually inspected above
(stage-panel content components, the Iteration details/Compare page orchestrators, evaluation, review,
automation, lifecycle, approval, ready-only-gate and backlink surfaces, and every shared `common/*` atom) and
found two further concrete defects beyond the row above:

- **Stage-panel table first column.** The shared `stagePanels.scss` applied its 48 px/centered icon-column
  rule to every stage table's first `<th>`/`<td>` via a bare `:first-child` selector, not only `GradePanel`'s
  disclosure-toggle column. `CreatePanel`, `UploadPanel`, `ReviewPanel`, and `AutomationPerCasePanel` all put
  the Test Case name/link in that same first column, so their case names were being squeezed into a fixed
  48 px centered cell instead of a normal left-aligned text column (and the rule's higher selector specificity
  silently beat `AutomationPerCasePanel`'s intended 33.333 % equal-column layout). Fixed by scoping the rule to
  a new `.iconCell` class applied only to `GradePanel`'s icon column.
- **Native `window.confirm` in the review strip.** `ReviewStrip`'s "Discard comments" action used the browser's
  unstyled native `confirm()` dialog — the only such usage anywhere in the app (repo-wide grep confirmed zero
  others) — instead of the application's shared `ConfirmationModal` (`showModalAction({ id: 'confirmationModal', ... })`),
  which the sibling `pipelinesPageContent.tsx` "reset demo" action in this same module already uses correctly.
  Replaced it with that exact pattern.

Both fixes were validated with their own Jest suites plus the full AI Factory suite (54 suites / 451 tests
PASS), `tsc --noEmit`, ESLint, and Stylelint, all clean on the touched files.
