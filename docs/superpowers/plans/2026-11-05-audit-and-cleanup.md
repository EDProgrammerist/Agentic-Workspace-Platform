# Audit and cleanup implementation plan

**Goal:** Fix reproducible errors while preserving existing features, styling, data, and integrations.
**Architecture:** Keep the current Next.js routes and services. Share a small tested autosave scheduler between the two editors; validate agent requests before accessing a workspace or starting inference.
**Tech stack:** Next.js 16.3.4, React 19, Prisma, Clerk, tldraw, BlockNote/Yjs, Node test runner with existing tsx.
**Spec:** User request in this session: audit, fix bugs without affecting existing functionality, then remove verified unused code/files/folders.

## Constraints
- Preserve the nine existing branding image modifications, README, environment values, and database schema/data.
- No deployment, commits, paid AI calls, or external-service configuration changes.
- Delete only artifacts proven unused; framework entry points, migrations, source artwork, and the separate sync worker are not dead code.

## Tasks
- [ ] Add regression tests for autosave debounce, ordered writes, failure recovery, unmount flushing, IME submission, and malformed/valid agent requests.
- [ ] Fix editor autosave lifecycle and surface save errors; retain existing debounce and collaboration semantics.
- [ ] Guard duplicate mutations, prevent invalid Enter submissions, retain delete dialogs on failure, revert failed renames, and handle clipboard failures.
- [ ] Validate agent request JSON/messages before database access or model conversion.
- [ ] Make first-login user creation safe under concurrent requests.
- [ ] Remove unused mutation-hook state, verify module/asset references, and keep anything required indirectly.
- [ ] Run regression tests, lint, strict unused-symbol/type checks, production build, and local HTTP smoke checks.

## Review focus / known boundaries
- Autosave cleanup must capture data before an editor is disposed and must not run another delayed timer afterward.
- Failed writes must not poison the queue for later edits.
- A mutation returning void must still distinguish success from a swallowed exception.
- Agent follow-ups containing tool outputs must continue to validate.
- External realtime authorization and atomic quota accounting are architectural risks requiring separate coordinated work; document them honestly.

## Baseline
- ESLint and TypeScript pass, including noUnusedLocals/noUnusedParameters.
- Production build passes with a metadataBase warning.
- Import analysis finds no orphan source modules. y-prosemirror is required transitively by BlockNote.
