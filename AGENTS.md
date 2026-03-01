# AGENTS.md - Coding Agent Guidelines

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 3. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 4. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 5. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to plan `tasks/todo.md` 
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

---

## Project Context

**Typing Maniac** - Phaser 3 + TypeScript browser game. See `docs/DESIGN.md` for game mechanics and UI specs.

### Themes

The game supports multiple visual themes:
- **default** - Cyberpunk/neon theme with matrix-style effects
- **alchemist** - Magical library theme with wizard character

Theme files are in `src/themes/` and include colors, fonts, and visual settings.

### Key Services

- `WizardRenderer` - Renders the alchemist wizard character with staff, desk, scroll, quill
- `BackgroundRenderer` - Theme-specific backgrounds with animated elements
- `ThemeService` - Manages theme switching and color access
- `AudioService` - Sound effects for typing, errors, power-ups, game events
- `GameConfigService` - Loads game parameters from JSON config

### Word Mechanics

- Words fall from top to bottom
- Typing matches word prefix to highlight
- Wrong submission (Enter) speeds up the target word by 50%
- Word hitting red line increases LIMIT bar

## Build Commands

```bash
npm run dev     # Start development server (hot reload)
npm run build   # Production build to dist/
npm run preview # Preview production build
```

## Pre-Commit

Always run: `npx tsc --noEmit` to check for TypeScript errors.
