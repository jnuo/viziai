#!/usr/bin/env python3
"""
Audit report metrics against metric_definitions, translations, and aliases.

Multi-pass matching algorithm:
  Pass 1: Exact alias match (case-insensitive) → EXACT_ALIAS
  Pass 2: Exact translation display_name match → EXACT_TRANSLATION
  Pass 3: Normalized match (strip parens, Turkish chars) → NORMALIZED
  Pass 4: Abbreviation extraction from parens → ABBREVIATION
  Pass 5: Token overlap (>=70%) + unit/ref similarity → POTENTIAL

Usage:
  python scripts/audit-report-metrics.py              # all reports
  python scripts/audit-report-metrics.py <report_id>  # single report
"""

import os
import re
import sys
from collections import Counter
from difflib import SequenceMatcher

import psycopg2
from psycopg2.extras import RealDictCursor

# --- Config ---
DB_URL = os.environ.get("NEON_DATABASE_URL")
if not DB_URL:
    env_path = os.path.join(os.path.dirname(__file__), "..", "web", ".env.local")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("NEON_DATABASE_URL="):
                    DB_URL = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

if not DB_URL:
    print("ERROR: NEON_DATABASE_URL not found")
    sys.exit(1)

# --- Turkish character normalization map ---
TURKISH_CHAR_MAP = str.maketrans({
    "\u0130": "I",   # İ → I
    "\u0131": "i",   # ı → i
    "\u011f": "g",   # ğ → g
    "\u011e": "G",   # Ğ → G
    "\u00fc": "u",   # ü → u
    "\u00dc": "U",   # Ü → U
    "\u015f": "s",   # ş → s
    "\u015e": "S",   # Ş → S
    "\u00f6": "o",   # ö → o
    "\u00d6": "O",   # Ö → O
    "\u00e7": "c",   # ç → c
    "\u00c7": "C",   # Ç → C
})


def turkish_normalize(text):
    """Normalize Turkish characters to ASCII equivalents, lowercase, and strip."""
    return text.translate(TURKISH_CHAR_MAP).lower().strip()


def normalize_name(name):
    """Strip parenthetical method names, commas, Turkish chars; lowercase + trim."""
    # Remove parenthetical content: (Turbidimetrik), (SERUM/PLAZMA), (acil)
    cleaned = re.sub(r'\([^)]*\)', '', name)
    # Replace commas/semicolons with spaces
    cleaned = re.sub(r'[,;]', ' ', cleaned)
    # Collapse whitespace
    cleaned = ' '.join(cleaned.split()).strip()
    # Turkish normalization + lowercase
    cleaned = turkish_normalize(cleaned)
    return cleaned


def extract_abbreviation(name):
    """Extract uppercase abbreviation from parentheses.

    'Alanin aminotransferaz (ALT)' → 'ALT'
    'Tiroid stimulan hormon (TSH)' → 'TSH'
    """
    match = re.search(r'\(([A-Z][A-Z0-9]{1,10})\)', name)
    if match:
        return match.group(1)
    return None


def tokenize(text):
    """Split text into lowercase word tokens."""
    return set(re.findall(r'[a-z0-9]+', turkish_normalize(text)))


def token_overlap(tokens_a, tokens_b):
    """Fraction of tokens_a that appear in tokens_b (Jaccard-like)."""
    if not tokens_a or not tokens_b:
        return 0.0
    intersection = tokens_a & tokens_b
    union = tokens_a | tokens_b
    return len(intersection) / len(union) if union else 0.0


def similarity(a, b):
    """String similarity ratio (0-1)."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def ref_range_similar(r1_low, r1_high, r2_low, r2_high, tolerance=0.3):
    """Check if two reference ranges are similar (within tolerance ratio)."""
    if r1_low is None or r1_high is None or r2_low is None or r2_high is None:
        return None  # Can't compare

    try:
        r1_low, r1_high = float(r1_low), float(r1_high)
        r2_low, r2_high = float(r2_low), float(r2_high)
    except (ValueError, TypeError):
        return None

    if r1_high == 0 or r2_high == 0:
        return None

    low_ratio = abs(r1_low - r2_low) / max(abs(r1_high), 1)
    high_ratio = abs(r1_high - r2_high) / max(abs(r2_high), 1)

    return low_ratio <= tolerance and high_ratio <= tolerance


def load_definitions(cur):
    """Load all metric definitions with their Turkish translations and default ref ranges."""
    cur.execute("""
        SELECT md.id, md.key, md.canonical_unit,
               mt.display_name,
               rr.ref_low, rr.ref_high
        FROM metric_definitions md
        LEFT JOIN metric_translations mt
            ON mt.metric_definition_id = md.id AND mt.locale = 'tr'
        LEFT JOIN metric_ref_ranges rr
            ON rr.metric_definition_id = md.id
            AND rr.sex IS NULL AND rr.age_min IS NULL AND rr.age_max IS NULL
    """)
    rows = cur.fetchall()

    definitions = {}
    for row in rows:
        definitions[str(row['id'])] = {
            "key": row['key'],
            "canonical_unit": row['canonical_unit'],
            "display_name": row['display_name'],
            "ref_low": float(row['ref_low']) if row['ref_low'] is not None else None,
            "ref_high": float(row['ref_high']) if row['ref_high'] is not None else None,
        }
    return definitions


def load_aliases(cur):
    """Load alias → canonical_name mapping, plus metric_definition_id linkage."""
    cur.execute("SELECT alias, canonical_name, metric_definition_id FROM metric_aliases")
    rows = cur.fetchall()

    aliases = {}
    for row in rows:
        aliases[row['alias']] = {
            "canonical_name": row['canonical_name'],
            "definition_id": str(row['metric_definition_id']) if row['metric_definition_id'] else None,
        }
    return aliases


def build_lookup_tables(definitions, aliases):
    """Build various lookup structures for multi-pass matching."""

    # Alias lookup: lowercase alias text → (canonical_name, definition_id)
    alias_lower = {}
    for alias_text, info in aliases.items():
        alias_lower[alias_text.lower()] = info

    # Translation display_name lookup: lowercase display_name → definition_id
    display_name_lower = {}
    for def_id, defn in definitions.items():
        if defn['display_name']:
            display_name_lower[defn['display_name'].lower()] = def_id

    # Normalized alias lookup
    alias_normalized = {}
    for alias_text, info in aliases.items():
        norm = normalize_name(alias_text)
        if norm:
            alias_normalized[norm] = info

    # Normalized display_name lookup
    display_name_normalized = {}
    for def_id, defn in definitions.items():
        if defn['display_name']:
            norm = normalize_name(defn['display_name'])
            if norm:
                display_name_normalized[norm] = def_id

    return alias_lower, display_name_lower, alias_normalized, display_name_normalized


def classify_metric(name, unit, ref_low, ref_high,
                    definitions, aliases,
                    alias_lower, display_name_lower,
                    alias_normalized, display_name_normalized):
    """Run multi-pass matching for a single metric name.

    Returns (match_type, matched_canonical, matched_definition_id, details).
    """
    name_lower = name.lower()
    name_norm = normalize_name(name)

    # --- Pass 1: Exact alias match (case-insensitive) ---
    if name_lower in alias_lower:
        info = alias_lower[name_lower]
        return ("EXACT_ALIAS", info['canonical_name'], info['definition_id'],
                {"alias": name})

    # --- Pass 2: Exact translation display_name match ---
    if name_lower in display_name_lower:
        def_id = display_name_lower[name_lower]
        defn = definitions[def_id]
        return ("EXACT_TRANSLATION", defn['display_name'], def_id,
                {"display_name": defn['display_name']})

    # --- Pass 3: Normalized match ---
    if name_norm in alias_normalized:
        info = alias_normalized[name_norm]
        return ("NORMALIZED", info['canonical_name'], info['definition_id'],
                {"original": name, "normalized_to": name_norm, "via": "alias"})

    if name_norm in display_name_normalized:
        def_id = display_name_normalized[name_norm]
        defn = definitions[def_id]
        return ("NORMALIZED", defn['display_name'], def_id,
                {"original": name, "normalized_to": name_norm, "via": "display_name"})

    # --- Pass 4: Abbreviation extraction ---
    abbrev = extract_abbreviation(name)
    if abbrev:
        abbrev_lower = abbrev.lower()
        if abbrev_lower in alias_lower:
            info = alias_lower[abbrev_lower]
            return ("ABBREVIATION", info['canonical_name'], info['definition_id'],
                    {"original": name, "abbreviation": abbrev})

        if abbrev_lower in display_name_lower:
            def_id = display_name_lower[abbrev_lower]
            defn = definitions[def_id]
            return ("ABBREVIATION", defn['display_name'], def_id,
                    {"original": name, "abbreviation": abbrev})

    # --- Pass 5: Token overlap ---
    name_tokens = tokenize(name)
    best_overlap = 0.0
    best_candidate = None
    best_def_id = None
    best_via = None

    # Check against aliases
    for alias_text, info in aliases.items():
        alias_tokens = tokenize(alias_text)
        overlap = token_overlap(name_tokens, alias_tokens)
        if overlap > best_overlap:
            best_overlap = overlap
            best_candidate = info['canonical_name']
            best_def_id = info['definition_id']
            best_via = f"alias: {alias_text}"

    # Check against display_names
    for def_id, defn in definitions.items():
        if not defn['display_name']:
            continue
        dn_tokens = tokenize(defn['display_name'])
        overlap = token_overlap(name_tokens, dn_tokens)
        if overlap > best_overlap:
            best_overlap = overlap
            best_candidate = defn['display_name']
            best_def_id = def_id
            best_via = f"display_name: {defn['display_name']}"

    if best_overlap >= 0.7 and best_candidate:
        # Additional confidence: check unit or ref range similarity
        defn = definitions.get(best_def_id) if best_def_id else None
        unit_match = False
        ref_match = None
        if defn:
            if unit and defn['canonical_unit']:
                unit_match = unit.lower().strip() == defn['canonical_unit'].lower().strip()
            ref_match = ref_range_similar(ref_low, ref_high,
                                          defn.get('ref_low'), defn.get('ref_high'))

        if unit_match or ref_match is True:
            return ("POTENTIAL", best_candidate, best_def_id, {
                "original": name,
                "token_overlap": round(best_overlap, 2),
                "unit_match": unit_match,
                "ref_match": ref_match,
                "via": best_via,
            })

    # --- No match ---
    return ("UNKNOWN", None, None, {
        "best_fuzzy": best_candidate,
        "best_overlap": round(best_overlap, 2) if best_candidate else 0,
    })


def audit_report(cur, report_id, definitions, aliases, lookups):
    """Audit metrics for a single report. Returns list of (metric, match_type, details)."""
    alias_lower, display_name_lower, alias_normalized, display_name_normalized = lookups

    cur.execute("""
        SELECT name, unit, ref_low, ref_high, value
        FROM metrics
        WHERE report_id = %s
        ORDER BY name
    """, (report_id,))
    metrics = cur.fetchall()

    results = []
    for m in metrics:
        match_type, canonical, def_id, details = classify_metric(
            m['name'], m['unit'] or '', m['ref_low'], m['ref_high'],
            definitions, aliases,
            alias_lower, display_name_lower,
            alias_normalized, display_name_normalized,
        )
        results.append({
            "name": m['name'],
            "unit": m['unit'] or '',
            "ref_low": m['ref_low'],
            "ref_high": m['ref_high'],
            "value": float(m['value']) if m['value'] else None,
            "match_type": match_type,
            "canonical": canonical,
            "definition_id": def_id,
            "details": details,
        })

    return results


def print_report_results(report, results):
    """Print detailed results for a single report."""
    print(f"\n{'='*80}")
    print(f"REPORT: {report['file_name']}")
    print(f"DATE:   {report['sample_date']}")
    print(f"{'='*80}\n")

    # Group by match type
    grouped = {}
    for r in results:
        grouped.setdefault(r['match_type'], []).append(r)

    # EXACT_ALIAS
    items = grouped.get("EXACT_ALIAS", [])
    print(f"EXACT ALIAS MATCHES ({len(items)})")
    print("-" * 60)
    for r in items:
        print(f"  v {r['name']} -> {r['canonical']}")

    # EXACT_TRANSLATION
    items = grouped.get("EXACT_TRANSLATION", [])
    print(f"\nEXACT TRANSLATION MATCHES ({len(items)})")
    print("-" * 60)
    for r in items:
        print(f"  v {r['name']} -> {r['canonical']}")

    # NORMALIZED
    items = grouped.get("NORMALIZED", [])
    print(f"\nNORMALIZED MATCHES ({len(items)})")
    print("-" * 60)
    for r in items:
        via = r['details'].get('via', '')
        print(f"  ~ {r['name']} -> {r['canonical']}  (via {via})")

    # ABBREVIATION
    items = grouped.get("ABBREVIATION", [])
    print(f"\nABBREVIATION MATCHES ({len(items)})")
    print("-" * 60)
    for r in items:
        abbrev = r['details'].get('abbreviation', '')
        print(f"  ~ {r['name']} -> {r['canonical']}  (abbrev: {abbrev})")

    # POTENTIAL
    items = grouped.get("POTENTIAL", [])
    print(f"\n{'!'*60}")
    print(f"POTENTIAL MATCHES -- NEEDS REVIEW ({len(items)})")
    print(f"{'!'*60}")
    for r in items:
        d = r['details']
        print(f"\n  ? {r['name']}")
        print(f"    -> Best match: {r['canonical']}")
        print(f"    Token overlap: {d.get('token_overlap', '?')}")
        print(f"    Unit match: {d.get('unit_match', '?')}")
        ref_str = "unknown"
        if d.get('ref_match') is True:
            ref_str = "SIMILAR"
        elif d.get('ref_match') is False:
            ref_str = "DIFFERENT"
        print(f"    Ref range: {ref_str}")
        print(f"    Via: {d.get('via', '?')}")

    # UNKNOWN
    items = grouped.get("UNKNOWN", [])
    print(f"\nUNKNOWN -- NO MATCH ({len(items)})")
    print("-" * 60)
    for r in items:
        d = r['details']
        fuzzy = f" (closest: {d['best_fuzzy']} @ {d['best_overlap']})" if d.get('best_fuzzy') else ""
        print(f"  x {r['name']} [{r['unit'] or '-'}] ref={r['ref_low']}-{r['ref_high']}{fuzzy}")

    # Summary
    total = len(results)
    if total == 0:
        print("\n  (no metrics found)")
        return

    matched = sum(1 for r in results if r['match_type'] in
                  ("EXACT_ALIAS", "EXACT_TRANSLATION", "NORMALIZED", "ABBREVIATION"))
    potential = sum(1 for r in results if r['match_type'] == "POTENTIAL")
    unknown = sum(1 for r in results if r['match_type'] == "UNKNOWN")

    print(f"\n{'='*60}")
    print(f"SUMMARY: {total} metrics total")
    print(f"  Matched:    {matched:>3} ({matched*100//total}%)")
    print(f"  Potential:  {potential:>3} -- needs review")
    print(f"  Unknown:    {unknown:>3} -- no match")
    print(f"{'='*60}\n")


def print_all_reports_summary(all_results):
    """Print aggregate summary across all reports."""
    total = len(all_results)
    if total == 0:
        print("\nNo metrics found across any reports.")
        return

    # Count by match type
    type_counts = Counter(r['match_type'] for r in all_results)
    matched = sum(type_counts.get(t, 0) for t in
                  ("EXACT_ALIAS", "EXACT_TRANSLATION", "NORMALIZED", "ABBREVIATION"))
    potential = type_counts.get("POTENTIAL", 0)
    unknown = type_counts.get("UNKNOWN", 0)

    # Distinct metric names
    distinct_names = set(r['name'] for r in all_results)

    # Unknown names by frequency
    unknown_names = Counter(
        r['name'] for r in all_results if r['match_type'] == "UNKNOWN"
    )

    print(f"\n{'='*80}")
    print(f"AGGREGATE SUMMARY ACROSS ALL REPORTS")
    print(f"{'='*80}")
    print(f"\n  Total metric rows:        {total}")
    print(f"  Distinct metric names:    {len(distinct_names)}")
    print(f"\n  Breakdown by match type:")
    print(f"    EXACT_ALIAS:       {type_counts.get('EXACT_ALIAS', 0):>5}")
    print(f"    EXACT_TRANSLATION: {type_counts.get('EXACT_TRANSLATION', 0):>5}")
    print(f"    NORMALIZED:        {type_counts.get('NORMALIZED', 0):>5}")
    print(f"    ABBREVIATION:      {type_counts.get('ABBREVIATION', 0):>5}")
    print(f"    POTENTIAL:         {potential:>5}")
    print(f"    UNKNOWN:           {unknown:>5}")
    print(f"\n  Matched:  {matched:>5} / {total} ({matched*100//total}%)")
    print(f"  Potential: {potential:>4}")
    print(f"  Unknown:   {unknown:>4}")

    if unknown_names:
        print(f"\n  Top {min(20, len(unknown_names))} unknown metric names by frequency:")
        print(f"  {'-'*50}")
        for name, count in unknown_names.most_common(20):
            print(f"    {count:>4}x  {name}")

    print(f"\n{'='*80}\n")


def main():
    report_id = sys.argv[1] if len(sys.argv) > 1 else None

    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Load definitions and aliases from DB
    definitions = load_definitions(cur)
    aliases = load_aliases(cur)
    lookups = build_lookup_tables(definitions, aliases)

    print(f"\nLoaded {len(definitions)} metric definitions, {len(aliases)} aliases")

    if report_id:
        # --- Single report mode ---
        cur.execute("SELECT id, file_name, sample_date FROM reports WHERE id = %s", (report_id,))
        report = cur.fetchone()
        if not report:
            print(f"Report {report_id} not found")
            sys.exit(1)

        results = audit_report(cur, report_id, definitions, aliases, lookups)
        print_report_results(report, results)

    else:
        # --- All reports mode ---
        cur.execute("SELECT id, file_name, sample_date FROM reports ORDER BY sample_date DESC")
        reports = cur.fetchall()
        print(f"Auditing {len(reports)} reports...\n")

        all_results = []
        for report in reports:
            results = audit_report(cur, report['id'], definitions, aliases, lookups)
            all_results.extend(results)

            # Print per-report one-liner
            matched = sum(1 for r in results if r['match_type'] in
                          ("EXACT_ALIAS", "EXACT_TRANSLATION", "NORMALIZED", "ABBREVIATION"))
            potential = sum(1 for r in results if r['match_type'] == "POTENTIAL")
            unknown = sum(1 for r in results if r['match_type'] == "UNKNOWN")
            total = len(results)
            pct = (matched * 100 // total) if total > 0 else 0
            print(f"  {report['sample_date']}  {report['file_name'][:40]:<40}  "
                  f"{total:>3} metrics  {matched:>3} matched ({pct}%)  "
                  f"{potential} potential  {unknown} unknown")

        print_all_reports_summary(all_results)

    conn.close()


if __name__ == "__main__":
    main()
