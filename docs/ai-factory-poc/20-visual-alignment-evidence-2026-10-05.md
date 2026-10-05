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
| Pipelines list | Authenticated localhost mock catalog with both generation and automation groups | Fixed: iteration cards use the application's white surface/shadow treatment and 4 px radius; group disclosure uses the standard compact chevron (down when open, right when closed); Ready/running/failed outcomes use the existing status palette; Requirement, Trigger, Model, counts, score, cost, and start time are readable key/value pairs; attribute keys and values have separate emphasis; stage steps keep status dots and expose available case/score/ready metrics. The standard always-expanded `SearchField` now sits in a dedicated content toolbar below the page title, left-aligned opposite Compare/Reset/Refresh actions like the supplied mock, and was browser-tested by filtering for `US-TMS-BLK-001`. |
| Iteration details | Running iteration 103, in-review iteration 102, and failed iteration 104 | Fixed: the summary is now one application surface rather than disconnected tiles/tags, with a Pipeline-card-style key/value hierarchy, colored attribute keys/values, integrated KPIs, icon-enhanced status badge, and mock-aligned actions. Compare, Re-run, Pipeline settings, and Refresh use UI-kit action icons. Re-run opens the application-standard modal with source requirement/iteration and mock-provided Model/Environment choices; its final command stays disabled until the US-020 CI command, permission, and idempotency contract is accepted, and the modal explicitly states that LP6 ingestion is not called. The banner uses a compact striped status treatment. Stages form one horizontal flow with status colors, per-stage metrics, duration/cost, Grade score progress, failure reason, and a visible Retry Upload affordance. The failed Upload panel now follows the prototype hierarchy: rollback warning, attempt/status/CI-job/reason table, contract-gated Retry Upload button with explanatory text, then full-width Stage details and Token usage. Grade exposes the complete six-criterion Suite score table, legend, stage details, and token usage. The failed Upload rollback scenario does not claim that Draft cases were created. The grade disclosure column remains fixed at 48 px, and an expanded grade row remained open after a 2.2-second wait. |
| Compare iterations | Default comparison for iterations 102/103 | Fixed: the different-requirements notice is a compact 44 px warning surface with both requirement IDs, a warning-tinted background, and a 3 px accent line; breadcrumbs now expose Project → Pipelines → selected pipeline → Compare iterations navigation; the Metrics table uses a white application surface with the shared 4 px border treatment. Selectors, stage grid, typography, and wrapping remain consistent with the application. |
| Test Case Library shell | Authenticated Library list with AI-only filter and TC102 side panel | Fixed: the existing application component/layout is retained; no replacement search or custom page chrome was introduced. AI quality now has 8 px block padding and vertically centered wrapped content, so the score is not pressed against the card edge. The side-panel Ready, AI and score badges remain on one line; a scoped override prevents the UI-kit tooltip wrapper from occupying the full 515 px row. Browser geometry confirmed an 8 px table inset and a single 20 px-high badge row. |
| Test Case AI details, review, cost, lifecycle, automation | Authenticated real TMS aliases TC104 and TC106 | Fixed and browser-validated. AI evaluation now follows the prototype hierarchy: a large total out of 100, evaluated/obsolete badge, source iteration/fix-round/time before the rubric, then six compact criterion bars whose inline caret expands concrete mock reasons. Pipeline shows `Test case generation · Iteration #N`, the originating requirement, and Review fix-round links when present. The Draft review strip now distinguishes `AI review`, reports the two seeded TC106 comments, and exposes `Push to agent · 2`. TC106 renders the pending precondition thread and a one-line composer without squeezing the real scenario/attachments columns; TC104 renders independent, initially visible composers for both Text-template Precondition and Instructions/Expected Result. The existing lifecycle, cost, automation, History, route, collapsible sections, UI-kit actions, and application typography remain authoritative. |

## Validation

- Node 20.19.1 dev compilation: PASS.
- Focused visual Jest: 3 suites / 30 tests: PASS.
- Pipeline reducer and grade disclosure Jest: 2 suites / 33 tests: PASS.
- Pipeline card/search follow-up Jest: 2 suites / 50 tests: PASS.
- Compare iterations visual/navigation Jest: 2 suites / 23 tests: PASS.
- Test Library AI-quality/sidebar follow-up Jest: 2 suites / 16 tests: PASS.
- Iteration-details visual, Re-run modal, status-icon, and mock regression Jest: 11 suites / 116 tests: PASS.
- Test Case evaluation/Pipeline/review/mock focused Jest: 5 suites / 32 tests: PASS.
- Full AI Factory page/controller regression: 68 suites / 726 tests: PASS.
- TypeScript `tsc --noEmit`: PASS.
- Focused ESLint: PASS with one existing `react-hooks/set-state-in-effect` warning and no errors.
- Stylelint: exit 0 with the repository's existing 199 warnings and no errors.
- `git diff --check`: PASS.
- Authenticated desktop browser after the change: PASS for Pipelines and Test Case details (TC104/TC106).
- Explicit 360 px override: **not evidenced in this run**. The connected Chrome extension continued to report
  a 1920 px client width even for a fresh tab after requesting 360 px. The new mobile rules are bounded to the
  iteration-card layout and keep a single-column stage flow, but no 360 px visual claim is made here.

No demo Reset, Push, lifecycle, automation, or remote write operation was used. Browser-local demo data and
the supplied HTML prototype were not modified.

## Addendum — Iteration #4 failed-design scenario

The mock database now includes generation Iteration #4 at
`/pipelines/1/iterations/104`: requirement `US-TMS-EXP-002`, three graded cases, Suite score 90/100,
and an Upload failure caused by an HTTP 503 rollback. The three generated cases remain available to the
iteration Grade panel but are deliberately excluded from the Test Case Library overlay because Upload wrote
nothing. Bumping the browser-local mock schema key loads this scenario without deleting unrelated storage.

Authenticated browser validation confirmed the full summary, failed banner, four-card stage flow, Grade rubric
scores 96/85/88, Stage details, token usage, and failed Upload presentation. The Upload panel renders the HTTP
503 rollback warning, attempt #1 with failed status and CI job `#8930412`, the visible contract-gated Retry Upload
button, `$0.01` stage cost, and its token ledger; it does not render successful upload results. Browser geometry
confirmed that the attempt table and the Stage details section both use the full panel width. The temporary
viewport override was reset after validation.

### Re-run modal and title/action icons

The Iteration title status badge now supports an optional status-specific UI-kit icon without changing compact
badges elsewhere. Header actions use the existing `CycleArrowsIcon`, `RerunIcon`, `ConfigurationIcon`, and
`RefreshIcon`. The mock Pipeline response supplies the prototype's three models and three environments so the
modal can exercise its selection layout without hardcoding those choices in the component.

Browser evidence on failed Iteration #4 confirmed one SVG icon in each Compare, Re-run, Pipeline settings, and
title-status control; the Re-run modal displayed `US-TMS-EXP-002`, `Iteration #4`, `auto (default)`, and `beta5`.
The modal confirmation remained disabled and no mutation/request was sent. This is a visual/interaction shell,
not completion of T4.4 or evidence that LP6 is a browser Re-run command.

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
