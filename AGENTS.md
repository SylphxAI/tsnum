# Repository Instructions

Start with `PROJECT.md`, `project.manifest.json`, and `.doctrine/project.json` before changing this
repository. They define the project goal, lifecycle, boundaries, public
surfaces, delivery model, and adoption gaps.

Use `SylphxAI/doctrine` for enterprise standards. Keep `@sylphx/numpy`
consumer-neutral while treating `tsnum` as repository history:
product-specific numerical behavior, benchmark claims, and downstream usage
policy belong in documented APIs, tests, benchmarks, or consuming products, not
hidden package behavior.

For control-plane-only changes, validate with:

```bash
git diff --check
node --test test/project-control.node-test.mjs
npm exec --yes --package groundatlas@0.1.2 -- ga update --out .groundatlas-pilot
npm exec --yes --package groundatlas@0.1.2 -- ga audit --out .groundatlas-pilot
npm run --silent groundatlas:fleet
```

For package changes, also run the relevant Bun/Turbo, TypeScript, test, and
benchmark commands for the touched packages before claiming release readiness.

Generated `.groundatlas*` reports are evidence/navigation only. Do not treat them as source of truth.
