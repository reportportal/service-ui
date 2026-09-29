# AGENTS.md

## Project

ReportPortal Service UI is the React 18 frontend for the ReportPortal test-automation reporting platform. Application code, its Node manifest, and its build configuration live in `app/`; the root contains container and CI/release configuration.

## Working agreements

- Inspect `git status` before editing and preserve unrelated local work. Do not remove or regenerate untracked dependency or lockfile artifacts unless explicitly asked.
- Do not commit, push, publish, deploy, build container images, or mutate external systems unless requested.
- Follow the existing repository guidance in `.claude/CLAUDE.md` and `.cursor/rules/servie-ui-cursorrules.mdc`.
- Keep changes scoped to the requested feature or defect; use the existing public module APIs and route/state patterns.

## Commands

GitHub Actions uses Node 20. All application commands run from `app/` (or with `npm --prefix app`). Dependency installation requires `--legacy-peer-deps`.

These commands are defined by the manifest and CI but were not run locally during this bootstrap:

- Install: `npm --prefix app ci --legacy-peer-deps`
- Type check: `npm --prefix app run type-check`
- Lint: `npm --prefix app run lint`
- Test with coverage: `npm --prefix app run test:coverage`
- Build: `npm --prefix app run build`
- Focused test: `npm --prefix app exec jest path/to/file.test.js`

## Conventions

- Write new components as `.tsx` and new utilities/hooks/services as `.ts`; type component props with a `ComponentNameProps` interface and avoid unjustified `any`.
- Localize user-facing text with `react-intl` and a colocated `messages.ts`; do not place UI text in constants files.
- Use CSS Modules, BEM-style kebab-case class names, `classNames.bind`, and UI-kit CSS custom properties instead of hardcoded colors.
- Keep imports ordered as React, third-party packages, internal modules, utilities/constants, messages, then styles last.
- Use the configured path aliases (such as `components/*`, `controllers/*`, `common/*`, and `pages/*`) rather than unnecessary relative traversal.

## Architecture

- Redux domain controllers under `app/src/controllers/` own actions, reducers, selectors, and Redux-Saga side effects.
- Routing uses `redux-first-router`: route definitions are in `app/src/routes/routesMap.js` and rendering is selected by `app/src/routes/pageSwitcher.jsx`.
- Reusable UI belongs in `app/src/components/` or `app/src/componentLibrary/`; route-level screens belong in `app/src/pages/`; shared utilities and hooks belong in `app/src/common/` and `app/src/hooks/`.
- Webpack Module Federation supports the runtime plugin system; preserve its configuration boundaries in `app/webpack/`.
