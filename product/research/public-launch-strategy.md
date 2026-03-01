# ViziAI Public Launch Strategy

**Last updated:** 2026-02-27

---

## Vision

The easiest way to track blood test results across countries, languages, and family members. Built by a son tracking his dad's health.

---

## Growth Strategy: SEO-First, Multi-Country

### Core Thesis

People google health questions in their own language. We rank for those queries in every target market, in their language. The product is the answer.

### Target Markets (by language)

| Language | Markets                       | Priority                 |
| -------- | ----------------------------- | ------------------------ |
| Spanish  | Spain, Latin America          | High (already supported) |
| English  | Australia, Nordics, UK, US    | High                     |
| French   | France, Belgium, Switzerland  | Medium                   |
| German   | Germany, Austria, Switzerland | Medium                   |
| Turkish  | Turkey, diaspora              | Already live             |

### Content Engine

**Blog structure per country/language:**

- "How to read your blood test results in [country]"
- "How to track health records across multiple countries"
- "How to manage your parents' medical records from abroad"
- "What is [metric name] and what does it mean?"
- "Normal [metric] levels — when to worry"
- Country-specific: lab providers, health system quirks, common tests

**Distribution:**

- SEO (primary — long-term compounding)
- Reddit: r/biohacking, r/longevity, r/health, country-specific subs, expat subs
- Local forums per market
- YouTube: short explainer videos on reading blood tests
- Post as Onur, the builder — authentic, not corporate

**Builder-led marketing:**

- Indie Hackers build log
- X/Twitter building in public
- "I built this to track my dad's health" story angle
- Comment in relevant threads with genuine value + link

---

## Product Gaps for Launch

### 1. Multi-Language Support

- [ ] Spanish, French, German, English UI (Turkish already live)
- [ ] Locale-aware metric names and reference ranges
- [ ] Blog/content infrastructure per language

### 2. Native Mobile Apps

- [ ] iOS app (Swift/React Native — TBD)
- [ ] Android app
- [ ] Tablet-friendly layouts
- [ ] Camera upload — snap a lab report, extract instantly
- [ ] Push notifications for tracking reminders

### 3. Own Domain & Brand

- [ ] Custom domain (viziai.com? getvizi.ai? TBD)
- [ ] Landing page optimized for conversion per market
- [ ] SEO-ready blog infrastructure

### 4. Security as a Feature

- [ ] End-to-end encryption for stored health data
- [ ] "Your data is encrypted" badge on every relevant screen
- [ ] Security page explaining what we encrypt and how
- [ ] SOC2 / HIPAA awareness (even if not certified, show we care)
- [ ] GDPR compliance (required for EU markets anyway)
- [ ] Data export / delete account flow

### 5. Paid Tiers & Payments

- [ ] Stripe integration
- [ ] Free tier: limited uploads, 1 profile
- [ ] Pro tier: unlimited uploads, multiple profiles
- [ ] Family tier: sharing + many profiles
- [ ] Business entity setup (see [legal-business-setup.md](./legal-business-setup.md))

### 6. Marketing Automation

- [ ] Research: which ad channels work for health/wellness SaaS?
- [ ] Google Ads for high-intent health queries
- [ ] Facebook/Instagram ads targeting health-conscious demographics
- [ ] Retargeting for visitors who didn't sign up
- [ ] Email sequences for onboarding + re-engagement
- [ ] Attribution tracking — which channel brings paying users?

---

## Review Notes

_Add notes while reviewing research and refining strategy._

### Open Questions

- Which markets to launch first after Turkish + Spanish?
- Native apps vs PWA — what's the right first step?
- Domain name — what's available?
- Ad budget — how much to test with?

### Decisions Made

- **2026-02-27:** Switch extraction model to gpt-5-mini (90% cost savings, eval-validated)
- **2026-02-27:** SEO-first growth strategy, multi-country/multi-language
- **2026-02-27:** Legal setup moved to separate doc, not blocking launch planning

### Ideas / Parking Lot

- Referral program ("invite your doctor")
- API for clinics / labs to integrate
- White-label for health clinics
- Wearable data integration (Apple Health, Google Fit)

---

## Action Items

### Now

1. [ ] Finalize target market priority order
2. [ ] Research domain availability
3. [ ] Add remaining languages to the app (French, German, English content)

### Next (Pre-Launch)

1. [ ] Build blog infrastructure (per-language SEO pages)
2. [ ] Write first 5 SEO articles (start with Spanish + English)
3. [ ] Set up Stripe + paywall
4. [ ] Start Indie Hackers build log
5. [ ] Create X/Twitter account for ViziAI

### Later (Post-Launch)

1. [ ] Native iOS/Android apps
2. [ ] Marketing automation + ad experiments
3. [ ] Security audit + encryption + compliance page
4. [ ] Product Hunt launch
5. [ ] YouTube content

---

## Related Docs

- [Legal & Business Setup](./legal-business-setup.md) — Autónomo, Estonia e-Residency, company options
- [Evals](../evals/README.md) — AI extraction quality tracking
- [Brand Guidelines](../brand-guidelines/BRAND.md) — Colors, typography, tone
