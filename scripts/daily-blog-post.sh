#!/bin/bash
# Daily metric explainer blog post generator
# Runs via crontab at 8:00 AM local time
# Writes TR + EN blog posts with separate keyword research per language

set -euo pipefail

VIZIAI_DIR="/Users/onurovali/Documents/code/viziai"
CLAUDE="/Users/onurovali/.local/bin/claude"
LOG_DIR="$VIZIAI_DIR/scripts/logs"
LOG_FILE="$LOG_DIR/daily-blog-$(date +%Y-%m-%d).log"

mkdir -p "$LOG_DIR"

echo "=== Daily Blog Post: $(date) ===" >> "$LOG_FILE"

cd "$VIZIAI_DIR"

$CLAUDE -p --dangerously-skip-permissions --max-budget-usd 5 <<'PROMPT' >> "$LOG_FILE" 2>&1
You are writing the next metric explainer blog post for ViziAI. This is an automated daily task.

## Step 1: Pick the next metric

Check which posts already exist:
- Run: ls web/content/blog/tr/ and ls web/content/blog/en/

Pick the NEXT metric from this list that does NOT have a blog post yet:

1. ferritin — TR keyword: "ferritin düşüklüğü", EN keyword: "ferritin levels"
2. b12 — TR: "b12 eksikliği belirtileri", EN: "vitamin b12 deficiency"
3. hemogram — TR: "hemogram ne demek", EN: "complete blood count CBC"
4. tsh — TR: "tsh yüksekliği", EN: "TSH levels thyroid"
5. kolesterol — TR: "kolesterol kaç olmalı", EN: "cholesterol levels"
6. crp — TR: "crp nedir", EN: "CRP levels meaning"
7. d-vitamini — TR: "d vitamini eksikliği", EN: "vitamin D deficiency"
8. demir — TR: "demir eksikliği belirtileri", EN: "iron deficiency symptoms"

If ALL 8 are done, output "ALL METRICS COVERED" and stop.

## Step 2: Turkish version — keyword research + write

Run keyword research for TURKISH separately:
```bash
cd ~/Documents/code/ai-agent-tools && source .venv/bin/activate
aitools seo autocomplete "{turkish_keyword}" --lang tr --country TR --json
aitools seo autocomplete "{turkish_keyword} nedir" --lang tr --country TR --json
aitools seo autocomplete "{turkish_keyword} belirtileri" --lang tr --country TR --json
aitools seo autocomplete "{turkish_keyword} nedenleri" --lang tr --country TR --json
aitools seo serper "{turkish_keyword}" --country tr --lang tr --num 10 --json
```

Then write the Turkish MDX file at web/content/blog/tr/{slug}.mdx

## Step 3: English version — keyword research + write

Run keyword research for ENGLISH separately:
```bash
cd ~/Documents/code/ai-agent-tools && source .venv/bin/activate
aitools seo autocomplete "{english_keyword}" --lang en --country US --json
aitools seo autocomplete "{english_keyword} symptoms" --lang en --country US --json
aitools seo autocomplete "{english_keyword} normal range" --lang en --country US --json
aitools seo serper "{english_keyword}" --country us --lang en --num 10 --json
```

Then write the English MDX file at web/content/blog/en/{slug}.mdx

## Content structure (BOTH languages)

- What is [metric]? (definition, what it measures)
- Normal reference ranges (by age/gender when applicable — use real medical reference data)
- What does high/low mean? (causes, symptoms)
- When should you get tested?
- How to track over time (natural ViziAI CTA with link to /login)
- FAQ section (5 questions based on PAA/autocomplete research)

## MDX frontmatter format

Turkish:
```yaml
---
title: "{Turkish title with primary keyword}"
description: "{Under 155 chars, contains primary keyword}"
locale: "tr"
slug: "{metric-slug-tr}"
publishedAt: "{today's date YYYY-MM-DD}"
tags: ["kan tahlili", "{metric Turkish name}"]
hreflangGroup: "metric-{metric-name}"
author:
  name: "Elif K."
  email: "elif@viziai.app"
---
```

English:
```yaml
---
title: "{English title with primary keyword}"
description: "{Under 155 chars, contains primary keyword}"
locale: "en"
slug: "{metric-slug-en}"
publishedAt: "{today's date YYYY-MM-DD}"
tags: ["blood test", "{metric English name}"]
hreflangGroup: "metric-{metric-name}"
author:
  name: "Elif K."
  email: "elif@viziai.app"
---
```

Use matching hreflangGroup so the blog system links them together.

## MANDATORY citability rules

- **Bold key terms** on first use (2-3 per H2 section)
- At least **1 real statistic** per H2 section (medical guidelines, WHO data, prevalence rates)
- FAQ answers **100-150 words** each with at least 1 concrete number
- Self-contained passages — each section quotable in isolation
- Medical disclaimer at the end: *Bu içerik tıbbi tavsiye değildir.* / *This content is not medical advice.*
- Internal links: /login for CTA, cross-link to other metric posts if they exist

## MANDATORY anti-slop rules

Never use: pivotal, crucial, transformative, groundbreaking, delve, underscore, showcase, leverage, facilitate, vibrant, robust, seamless, innovative, comprehensive, holistic
Vary sentence length. Lead with specifics, then generalize. No forced CTAs.

## Ship

1. Create branch: git checkout -b feature/blog-metric-{name}
2. Commit both TR and EN files
3. Push to remote
4. Open PR with: gh pr create --title "Blog: {metric name} explainer (TR+EN)" --body "..."
5. Deploy to staging: merge the feature branch into the staging branch so it deploys to staging.viziai.app
   ```bash
   git checkout staging && git pull origin staging && git merge feature/blog-metric-{name} --no-edit && git push origin staging && git checkout feature/blog-metric-{name}
   ```
6. Do NOT merge the PR to main — Onur will review on staging and merge manually

## Step 4: Wait for Vercel deploy, then verify

After pushing to staging, wait for the Vercel deployment to complete:
```bash
# Check deployment status — poll until done (max 5 minutes)
for i in $(seq 1 30); do
  STATUS=$(gh api repos/jnuo/viziai/commits/staging/status --jq '.state' 2>/dev/null || echo "pending")
  if [ "$STATUS" = "success" ]; then break; fi
  sleep 10
done
```

Then verify both articles are accessible on staging:
- Fetch https://staging.viziai.app/tr/blog/{tr-slug} — must return 200, not 404
- Fetch https://staging.viziai.app/en/blog/{en-slug} — must return 200, not 404
- Check both blog listing pages show the new posts

If either returns 404, report the error and stop.

## Step 5: SEO audit on both staging URLs

For EACH language version, run these checks:

### On-page SEO (fetch HTML with curl or WebFetch)
- Title tag exists, under 60 chars, contains primary keyword
- Meta description exists, under 155 chars, contains keyword
- Single H1 with keyword
- Canonical URL points to www.viziai.app (production, not staging)
- OG tags present (og:title, og:description, og:image)
- Twitter card present

### JSON-LD structured data
- BlogPosting schema with headline, datePublished, author (Person), speakable
- BreadcrumbList with correct Home > Blog > Article items
- FAQPage with all 5 Q&As

### Hreflang cross-linking
- TR version has hreflang pointing to EN version
- EN version has hreflang pointing to TR version
- Both use matching hreflangGroup in frontmatter

### Sitemap
- Both URLs appear in the sitemap

### Citability scoring
Run the citability scorer on both URLs:
```bash
cd ~/Documents/code/ai-agent-tools && source .venv/bin/activate
python3 ~/.claude/skills/jpm-seo/scripts/citability_scorer.py https://staging.viziai.app/tr/blog/{tr-slug}
python3 ~/.claude/skills/jpm-seo/scripts/citability_scorer.py https://staging.viziai.app/en/blog/{en-slug}
```

### Report
Output a summary at the end:
```
=== SEO AUDIT RESULTS ===
TR Post: {slug}
  On-page: {PASS/FAIL with details}
  JSON-LD: {PASS/FAIL — BlogPosting, BreadcrumbList, FAQPage}
  Hreflang: {PASS/FAIL}
  Sitemap: {PASS/FAIL}
  Citability: {score}/100

EN Post: {slug}
  On-page: {PASS/FAIL with details}
  JSON-LD: {PASS/FAIL — BlogPosting, BreadcrumbList, FAQPage}
  Hreflang: {PASS/FAIL}
  Sitemap: {PASS/FAIL}
  Citability: {score}/100

Issues to fix: {list any FAILs}
```

## Important
- NEVER commit to main
- Use real medical data only — cite WHO, ADA, medical textbooks
- Check web/content/blog/ for existing post format reference
PROMPT

echo "=== Done: $(date) ===" >> "$LOG_FILE"
