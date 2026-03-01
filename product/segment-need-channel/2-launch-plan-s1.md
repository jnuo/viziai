# Launch Plan — Segment 1: Turkish Diaspora

**Last updated:** 2026-03-01

Organic-first. Zero budget. Test → learn → iterate. Spend money only after you know what works.

## What's Already Built

- PDF upload + AI extraction (gpt-5-mini) — working
- Family profiles + sharing/invites — working
- Multi-language UI (TR, EN, ES, DE, FR) — working
- Blood test tracking with charts — working
- Weight + BP tracking — working
- Metric normalization/aliases — working
- Blog infrastructure (locale-based) — working
- SEO (OG images, sitemap, meta tags) — working
- Google Analytics — working
- Hosted at viziai.app — live

The product exists. This plan is about finding people and getting them to try it.

---

## Phase 1: Inner Circle (Week 1)

**Goal:** 5-10 real users from your personal network. Find friction, fix it.

### Step 0: Test the empty product yourself

Before sending to anyone — sign up with a fresh Google account and go through the entire flow as a new user. You've never seen the empty state since day one.

- [ ] Create a new Google account
- [ ] Sign up at viziai.app
- [ ] See the empty dashboard — does it make sense? Is there guidance?
- [ ] Upload a PDF — is the flow clear for someone who's never seen it?
- [ ] Check mobile — most people will open your WhatsApp link on their phone
- [ ] Test the invite flow end-to-end: invite the fresh account from your main account, claim it, see what happens
- [ ] Fix anything broken or confusing before sending to others

**Invite flow already built:** email invite → access level (viewer/editor) → generates link → WhatsApp share button + copy link. Recipient clicks → Google sign-in → auto-claims access.

**Fix before Phase 1: make email optional on invites.** Current flow requires exact email match — if recipient signs in with a different Google account, they're blocked. Instead:

- Email provided → current behavior (auto-match, instant access)
- No email → anyone with the link can claim it
- Owner gets notified either way

This removes the "hangi email'in var?" friction. Just tap WhatsApp share, send the link, done. Add an approval step later if needed for strangers.

### Step 1: Sisters + spouses first (4-5 profiles)

- [ ] Send to sisters and ask them to use it with their own results and their spouses'
- [ ] One casual line about privacy: "Ben görmüyorum, kendi hesabında kalıyor. İstersen sonra profili silebilirsin."
- [ ] Profile delete is already built — remind them if needed

### Step 2: Close friends (Seyhmus, Baris, Selvihan, Selin & Fehmi)

- [ ] Send viziai.app with a personal message
- [ ] Ask them to upload a real PDF and try the dashboard

### Step 3: User research over WhatsApp

Don't send a form. Weave into conversation. Two rounds: before and after.

**Before they use it (understand current behavior):**

1. "En son ne zaman kan tahlili yaptirdin?"
2. "Sonuclari ne yaptin? Bir yere kaydettin mi?"
3. "Annemlerin/babanin tahlillerini takip ediyor musun? Nasil?"
4. "e-Nabız kullanıyor musun? İşine yarıyor mu? Türkiye'de ve Hollanda'da yaptırdığın testleri nasıl takip ediyorsun, veya doktora gösteriyorsun?"

**Then send the app:**

> "Babam icin yaptigim uygulamayi dene bi — viziai.app. Elinde bir tahlil PDF'i varsa yukle, nasil calistigini gor."

**After they try it (24-48 hours later):**

1. "Nasıl gitti? PDF yükleme çalıştı mı?"
2. "Bir şey karışık geldiyse söyle"
3. "Grafikleri gördün mü? İşine yarıyor mu?"
4. "Ailenle paylaşmayı denedin mi?"
5. "Tekrar kullanır mısın? Bir sonraki tahlilde aklına gelir mi?"

**The killer question (only if conversation flows naturally):**

"Bunu ailen/arkadaşların kullanır mı sence? Kime gönderirdin?"

If they name someone specific → strong signal. "Bilmem, belki" → polite no.

### Track results

| Person | Had PDF? | Uploaded? | Shared? | Friction point? | Would use again? | Would refer to who? |
| ------ | -------- | --------- | ------- | --------------- | ---------------- | ------------------- |

- [ ] Fix top 3 friction points before Phase 2

**Success:** 5 people upload a real PDF. 2 share a profile. You know what's broken.

### Open questions to answer during Phase 1

These are the unknowns. Don't assume — listen and observe.

**Product:**

- Do people open the link on mobile or desktop? Do we need a native app, or is mobile web enough?
- Do people have PDFs, or do they only have paper/photos? Do we need image/camera scan?
- How many PDFs does someone need to upload before they see value? (1 = interpretation, 2+ = trends)
- What's the minimum number of uploads that creates a "I'll come back next time" habit?
- Does the empty state make sense? Do people know what to do on first visit?

**Retention:**

- After uploading, do they come back? When? What triggers a return visit?
- Does sharing a profile with family create stickiness — or is it a one-time action?

**Pricing:**

- Would they pay for this? How much feels reasonable?
- What feels too cheap (not trustworthy for health data)? What feels too expensive?
- Per month? Per year? One-time? Family plan?
- Use Van Westendorp if conversation allows: "Bu uygulama icin ayda ne kadar odersin?"

**Trust & security:**

- Does "Google ile giris yap" feel safe enough for health data?
- Do they worry about where their data is stored?
- Does the privacy line ("ben görmüyorum") actually reassure, or do they need more?
- Would they want end-to-end encryption, data export, KVKK/GDPR badge?

**Other:**

- What language do they expect the app to be in? (Turkish UI but German PDF?)
- Do they want notifications/reminders? ("6 aydir tahlil yuklemadin")
- Do they want to share results with their doctor? How?
- What feature do they ask for that we don't have?

---

## Phase 2: Community Seeding (Weeks 2-3)

**Goal:** First strangers use the product. Test the message.

- [ ] Find 5-10 active Turkish Facebook groups in Germany/Netherlands/Belgium (search: "Almanya'da Turkler", "Hollanda Turkleri", "Belcika Turk Toplumu")
- [ ] Post authentically — not promotional. Story format:
  > "Babamin tahlil sonuclarini takip etmek icin bir uygulama yaptim. PDF'i yukluyorsun, grafikleri goruyor, aileyle paylasabiliyorsun. Deneyip fikir verebilecek var mi?"
- [ ] Engage with every comment and DM
- [ ] Offer to process people's PDFs personally if they're hesitant
- [ ] Collect: what resonated, what confused, what words they use

**Also try:**

- [ ] Post in 1-2 Turkish subreddits (r/Turkey, r/KGBTR if appropriate)
- [ ] Turkish WhatsApp groups you're already in — share casually

**Success:** 20 signups from strangers. 10 uploads. Qualitative feedback on what clicks.

---

## Phase 3: Content & SEO — Turkish (Weeks 3-5)

**Goal:** Organic discovery. People searching in Turkish find you.

Write 3-5 blog posts targeting diaspora-specific pain:

- [ ] "Almanya'da kan tahlili sonuclarini nasil takip ederim?"
- [ ] "e-Nabiz'da gorünmeyen tahliller — ne yapabilirsiniz?"
- [ ] "Yurtdisindan ailenizin saglik verilerini nasil takip edersiniz?"
- [ ] "Kan tahlili sonuclarini PDF'den otomatik okuma"
- [ ] "[Metric] degeri nedir, normal araligi ne?" (start with top 5: Vitamin D, Demir, TSH, Kolesterol, Kreatinin)

**SEO basics:**

- [ ] Each post targets 1 primary keyword
- [ ] Turkish hreflang tags already set up
- [ ] Internal links to app signup
- [ ] Publish on viziai.app/tr/blog

**Success:** Posts indexed. First organic clicks within 4-6 weeks.

---

## Phase 4: Referral Loop (Weeks 4-6)

**Goal:** Users bring users. The product's sharing feature IS the growth hack.

The natural loop: user uploads PDF → shares profile with parent/sibling → they sign up → they upload their own → they share with their family.

- [ ] Track: how many users came from profile share invites?
- [ ] Make the share flow frictionless — is the invite email clear? Does it work on mobile?
- [ ] Add a nudge after first upload: "Ailenizle paylasin — onlar da tahlillerini yukleyebilir"
- [ ] Test: does the invite email need to be in Turkish? (probably yes)

**Success:** 20%+ of new users come from invites.

---

## Phase 5: Content & SEO — German (Weeks 5-8)

**Goal:** Catch Turks in Germany searching in German.

- [ ] "Blutwerte verfolgen — die beste App fur Laborergebnisse"
- [ ] "Blutwerte aus der Turkei und Deutschland vergleichen"
- [ ] "Laborergebnisse als PDF hochladen und Trends sehen"

**Why German:** 3M+ Turks in Germany. Many search in German, not Turkish. DE locale already exists.

**Success:** German blog posts ranking. Traffic from .de searches.

---

## Phase 6: Measure & Decide (Week 8)

**Goal:** Look at the data. What worked?

- [ ] How many users total?
- [ ] Where did they come from? (Facebook groups, SEO, invites, direct)
- [ ] How many uploaded a PDF?
- [ ] How many shared a profile?
- [ ] What's the invite-to-signup conversion rate?
- [ ] What feedback keeps repeating?

**Decision:**

- If invite loop works → double down on share flow, make it smoother
- If Facebook groups worked → find more groups, post more stories
- If SEO is getting traction → write more content, expand keywords
- If nothing worked → revisit messaging, talk to users, ask why not

**Only after this:** consider spending money (Google Ads for Turkish health keywords, Facebook ads targeting Turks in Germany).

---

## Not Now

- Paid ads (test organic first)
- Product Hunt (not this segment)
- Indie Hackers (English-first audience)
- New features (the product works — find users first)
- Native mobile app (web works, validate demand first)
