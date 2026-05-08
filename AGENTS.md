# AI Agent Instructions

These rules are the baseline for any AI code agent working in this repo. They combine Cursor setup expectations with repo-specific dev and style guidance.

## Operating Rules (Cursor Settings Baseline)
- Use repo tools for file operations: prefer `ReadFile`, `LS`, and `rg` over shell `cat`, `ls`, or `grep`.
- Prefer `ApplyPatch` for single-file edits; avoid bulk or destructive edits unless explicitly asked.
- Do not run destructive git commands (no hard resets, force checkouts, or forced pushes) unless explicitly requested.
- Do not amend commits unless explicitly requested.
- Do not create commits unless explicitly requested.
- When adding dependencies, use the project package manager and do not invent versions.

## Repo Workflow Expectations
- Branch names:
  - `feature/{JiraId}-{ticket-name}` for features/spikes
  - `bugfix/{JiraId}-{ticket-name}` for bug fixes
- Commit message format: `EPMRPP-{JiraId} || {Ticket name}` (exclude labels like `[UI]`, `[QA]`, etc.).
- Before any commit, run:
  - `npm run type-check`
  - `npm run format`
  - `npm run build`

## Dev Setup Tips
- Recommended Node.js version is 20+.
- Local dev flow:
  - `cd app`
  - `npm install`
  - Optional proxy in `app/.env`:
    - `PROXY_PATH=http://your_server:port/`
  - `npm run dev` (defaults to `http://localhost:3000`)

## Tech Stack Quick Map
- React, Redux, redux-saga, redux-form, redux-first-router.
- Localization: `react-intl`.
- UI kit: `@reportportal/ui-kit`.
- Charts: `c3js`, `chart.js`.
- HTTP: `axios`.

## File Structure Pointers
- `app/src/common/` - shared constants, css, utils, hooks, etc.
- `app/src/components/` - shared components not in UI kit.
- `app/src/controllers/` - Redux reducers/sagas/actions/selectors.
- `app/src/pages/` - main feature pages.
- `app/src/routes/` - routing config.
- `app/src/store/` - Redux store config.
- Common component folder structure:
  - `componentName/componentName.jsx`
  - `componentName/componentName.scss`
  - `componentName/index.js`
  - `componentName/constants.ts` (optional)
  - `componentName/utils.js` (optional)

## Naming Conventions
- `camelCase` for general names.
- `PascalCase` for React components.
- `UPPER_SNAKE_CASE` for constants.
- `kebab-case` for CSS classes.
- Redux: `*Action`, `*Selector`, `*Reducer` suffixes.
- Files are `camelCase` (except icons).
- SVG icons: dash-case with `-inline` for JSX usage (e.g. `arrow-down-inline.svg`).

## CSS / Styling Rules
- Use SCSS + CSS Modules.
- Avoid selector nesting (except pseudo/state selectors).
- Class name should match component name in `kebab-case`.
- Use UI-kit CSS Custom Properties for colors where possible.
- Do not use hex colors directly; use global variables.
- Do not use `font-weight`; use global font variables.
- Do not add/edit global CSS variables without UI team + UX approval.
- Property order: positioning → display/box model → color → text → other.

## Localization Rules
- All user-facing text must be localized with `react-intl`.
- Message id format: `ComponentName.elementName`.
- Workflow:
  1. Use `intl.formatMessage` or `<FormattedMessage>` with English defaults (`intl.formatMessage` is preferable).
  2. Run `npm run manage:translations`.
  3. Update `localization/translated/{be,ru,uk}.json` only for your keys.
  4. If unrelated keys changed/removed, discuss with UI lead.

## Design Constraints
- Follow the existing style guide (colors/fonts in `app/src/common/css/`).
- Do not introduce colors or fonts outside the style guide.
- Verify UI against both Figma and the running app; resolve conflicts with UX.

## Pull Request Workflow (GitFlow)
- Base work on `develop`; releases use `rc/{version}` or `hotfix/{version}`, and `master` is release.
- Keep branches rebased on `upstream/develop` (or `report-portal/develop` if that is the upstream remote).
- Prefer a single main commit per feature.
- PR name should match the main commit name.
- At least one UI team member must review.

## TypeScript Migration Guide Highlights
- `.jsx` and `.tsx` can coexist; migrate incrementally.
- Avoid `React.FC` / `FC` for components; use explicit prop typing.
- Prefer type inference for component returns; add explicit return types only when needed.
- Use destructured default props instead of `defaultProps`.
- Avoid `any`; use unions or specific types.
- Leverage TypeScript utility types (`Pick`, `Partial`, `Required`, etc.).
- Add comments for complex type definitions.

## Routing (Redux First Router)
To add a new route, update:
- `app/src/controllers/pages/constants.ts` (constant + `pageNames`)
- `app/src/controllers/pages/index.js` (export)
- `app/src/routes/routesMap.js` (path mapping)
- `app/src/routes/constants.ts` (component/layout/access)
- `app/src/pages/inside/<yourPage>/` (page component)
