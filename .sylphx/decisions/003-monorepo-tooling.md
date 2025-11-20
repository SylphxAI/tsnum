# 003. Bun + Turbo + Biome Stack

**Status:** ✅ Accepted
**Date:** 2025-01-XX

## Context
Need fast dev tools for monorepo. Options: npm+eslint+prettier, pnpm+nx, bun+turbo+biome.

## Decision
Use Bun (package manager, test runner), Turbo (build orchestration), Biome (lint+format).

## Rationale
- **Bun:** Fastest package manager, native TS test runner, no jest config
- **Turbo:** Simple caching, pipeline parallelization, works with Bun
- **Biome:** Single tool for lint+format (faster than ESLint+Prettier), 20x faster

## Consequences
**Positive:**
- ~10x faster installs (Bun vs npm)
- Zero config test runner (Bun)
- Single linter (Biome vs ESLint+Prettier)
- Incremental builds (Turbo)

**Negative:**
- Bun still maturing (less ecosystem than npm)
- Biome plugin ecosystem smaller than ESLint
- Team needs to learn new tools

## References
- Config: `package.json` (packageManager: bun@1.1.42), `turbo.json`, `biome.json`
- Scripts: `bun test`, `bun run build`
