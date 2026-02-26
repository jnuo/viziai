---
status: pending
priority: p1
issue_id: "002"
tags: [code-review, i18n, quality, translation]
dependencies: []
---

# Missing diacritics in es.json Spanish translations

## Problem Statement

The entire `web/messages/es.json` file (379 lines) contains zero diacritical characters. Every Spanish word that needs an accent, tilde, or special character is written without one. This affects ~80+ strings and makes the Spanish UI look unprofessional.

## Examples

- "analisis" should be "analisis" (accent)
- "sesion" should be "sesion" (accent)
- "Anadir" should be "Anadir" (tilde on n)
- "direccion" should be "direccion" (accent)
- "Sistolica" should be "Sistolica" (accent)
- "medicion" should be "medicion" (accent)
- "busqueda" should be "busqueda" (accent)

## Fix

Go through all 379 lines and add proper Spanish diacritics (accents, tildes).

## Acceptance Criteria

- [ ] All Spanish strings use proper diacritical marks
- [ ] No ASCII-only approximations remain for accented words
