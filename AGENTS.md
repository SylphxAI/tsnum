# tsnum — local agent notes only

Doctrine and fleet delivery law live in the **host always-on constitution**
(`~/.grok/AGENTS.md` / Doctrine template). This file must **not** restate,
weaken, or fork that law (including PR-vs-direct-trunk delivery).

Local truth: `PROJECT.md`, `.doctrine/project.json` when present.

## Boundary hazards

- Never commit secrets, tokens, `.env` files, or credentials.

## Local commands

```bash
git diff --check
node --test test/project-control.node-test.mjs
```

## Validation notes

- Prefer the **narrowest** affected check before full workspace runs.
- Report layers honestly: local diff · trunk FF · deploy · prod proof (do not collapse).

## GroundAtlas

Retired as product dependency (Control Plane ADR-0014). Do not re-add package dogfood.
