# Repository Instructions

Start with `PROJECT.md` and `.doctrine/project.json` before changing this
repository. They define the project goal, lifecycle, boundaries, public
surfaces, delivery model, and adoption gaps.

Use `SylphxAI/doctrine` for enterprise standards. Keep tsnum consumer-neutral:
product-specific numerical behavior, benchmark claims, and downstream usage
policy belong in documented APIs, tests, benchmarks, or consuming products, not
hidden package behavior.

For control-plane-only changes, validate with:

```bash
python3 /Users/kyle/.doctrine/scripts/project-control-plane-audit.py --local . --fail-on-drift --json
git diff --check
```

For package changes, also run the relevant Bun/Turbo, TypeScript, test, and
benchmark commands for the touched packages before claiming release readiness.
