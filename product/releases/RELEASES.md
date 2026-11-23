# Release Notes

## v0.2.0 (build 1) — 2026-11-23

### Features

- Dashboard shows only the values you choose ("Ana ekran"), as cards you can drag to reorder; charts follow the same order (#158)
- "Tüm değerler" picker: always-visible search with abbreviations (Hb, PLT, WBC…), category groups, sort, filters, add/remove with undo (#158)
- Charts fit the person's own values instead of always including the reference range; the normal range shows as a step band or an edge strip (#157)
- Value and change labels on points, time-scaled x-axis, per-point status colours, neutral grey for metrics without a range (#157)
- Görünüm settings: normal range, personal range, point labels, 1/2/3 columns, chart height (#159)
- Grafik / Tablo switch with one combined table, and a date pin synced across all charts and the table (#159)
- Date ranges: 2 hafta, 1 ay, 3 ay, 6 ay, 1 yıl, Tümü and a custom range; smart automatic default anchored to the latest test (#159)

### Bug Fixes

- Viewers on a shared profile can no longer change the card order or the Ana ekran (owner/editor only) (#158)
- Order saves are one batched upsert and no longer silently drop metrics without a preferences row (#158)
- Metrics without a reference range are no longer shown as "normal" (green) (#157)

### Other

- Migration `20261121_ana_ekran_seed.sql`: seeds the Ana ekran for profiles with a customised order (idempotent)
- Chart and range logic extracted to `web/src/lib/chart/` with unit tests; `version.json` + `scripts/bump-version.sh` added
