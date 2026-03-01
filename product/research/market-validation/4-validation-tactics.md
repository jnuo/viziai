# Creative Validation Tactics

**Date:** 2026-02-22

> Growth hacker approaches to test demand before building more: landing pages, surveys, Reddit posts, fake door tests, waitlists. Concrete playbook to learn from real audiences fast.

**Status:** Complete

---

### Foundational Principle: The Mom Test

Before running any of these tactics, internalize Rob Fitzpatrick's "The Mom Test" rules. People will lie to you if they think it is what you want to hear. Friends, family, and even strangers in surveys will give you false positives out of politeness.

**The three rules:**

1. **Talk about their life, not your idea.** Do not say "Would you use an app that..." Instead ask "How do you currently track your blood test results?"
2. **Ask about specifics in the past, not hypotheticals about the future.** "Tell me about the last time you got blood work done" beats "Would you pay for this?"
3. **Talk less, listen more.** If you are doing more than 30% of the talking, you are pitching, not learning.

**Three types of bad data to watch for:**

- **Compliments** ("That sounds really cool!") -- worthless
- **Hypothetical fluff** ("I would definitely use that") -- worthless
- **Wishlists** ("It would be great if it also did X, Y, Z") -- often misleading

**What counts as real signal:**

- They describe a specific problem they had recently
- They have already tried to solve it (spreadsheets, apps, asking their doctor)
- They pull out their phone to show you something
- They ask when they can use it
- They offer to pay or pre-order without being asked

---

### Tactic 1: Validation Landing Page

**What to do (step-by-step):**

1. Build a single-page site with a clear value proposition headline: "Upload your blood test PDF. Get visual health trends in seconds."
2. Include 3-4 bullet points on what ViziAI does (PDF parsing, trend visualization, reference range context)
3. Add a primary CTA: email signup for early access / waitlist
4. Add a secondary CTA: "See pricing" button (tracks clicks even if pricing page is just a waitlist)
5. Include a short explainer visual or mockup screenshot (use the existing app)
6. Add social proof elements as they accumulate ("Join 47 early subscribers")
7. Add privacy reassurance: "No spam. Unsubscribe anytime."
8. Include a timeline: "Beta launching Q2 2026"

**Tool options:**

- **Carrd** ($19/year Pro): fastest option, 1-2 hours to build, supports custom domains, email collection via Mailchimp/ConvertKit/ButtonDown integration. Best for speed.
- **Framer** (free tier works): more design control, animations, built-in waitlist components. Better if you want it to feel polished.
- **Next.js on Vercel** (free): since ViziAI is already Next.js, you could build a `/launch` or separate subdomain page. Most control, but takes longer.
- **Email collection**: ButtonDown (free up to 100 subscribers), ConvertKit (free up to 10k), or just a Google Form if you want zero setup.

**What to measure:**

- Email signup conversion rate (visitors to signups)
- "See pricing" click-through rate
- Traffic source breakdown (which channel sends the best-converting visitors)
- Bounce rate and time-on-page

**What "success" looks like:**

- **Median landing page conversion rate** across all industries: 6.6% (Unbounce Q4 2024 data, 41,000 pages analyzed)
- **Health/wellness specifically**: 4-8% is typical
- **For a validation page** (warmer traffic from communities you post in): aim for 10-15%+
- **Below 3%**: the positioning or audience is off, iterate the copy
- **Above 15%**: strong signal, especially if traffic is cold
- **Email traffic** (from newsletters, communities) converts at ~19% -- highest of all channels
- **Target**: 100+ email signups in the first 2 weeks = meaningful signal

**Time investment:** 2-4 hours to build, then ongoing traffic driving

**Cost:** $0-19 (Carrd Pro) or $0 (Framer free / Next.js on Vercel)

**Examples:**

- Buffer famously validated with a 2-page landing page (value prop -> pricing -> email) before writing a single line of product code
- Dropbox used an explainer video on a landing page, getting 75,000 signups overnight
- Many indie hackers on Indie Hackers report using Carrd pages to test ideas in 48 hours

---

### Tactic 2: Validation Survey (5-7 Questions)

**What to do (step-by-step):**

1. Create a short survey (5-7 questions max, under 3 minutes to complete)
2. Distribute through Reddit, X, health communities, and the waitlist
3. Analyze responses for behavioral signals, not just stated preferences

**Survey tool options:**

- **Tally** (free, unlimited forms, logic jumps, unlimited submissions): best value
- **Typeform** (free up to 10 responses/month, $25/mo for 100): best UX, conversational one-question-at-a-time format boosts completion rates
- **Google Forms** (free): zero cost, but less engaging

**Recommended 7-question survey for ViziAI:**

1. **"How often do you get blood tests done?"** (Multiple choice: yearly, every 6 months, quarterly, rarely/never)
   - _Why:_ Filters for actual users vs. curious bystanders

2. **"After getting your results, what do you do with them?"** (Open text)
   - _Why:_ Reveals current behavior -- if they say "nothing" or "file it away," there is an opportunity. If they describe elaborate tracking, they are a power user.

3. **"What is the most frustrating thing about understanding your blood test results?"** (Open text)
   - _Why:_ Mom Test-compliant. Asks about real past frustration, not hypothetical interest.

4. **"Have you ever used any app or tool to track your blood test results? If yes, which one?"** (Open text)
   - _Why:_ Reveals competitive landscape and whether they have actively sought a solution (strong signal).

5. **"If a tool could instantly extract your blood test results from a PDF and show you trends over time, how useful would that be?"** (1-5 scale: Not useful to Extremely useful)
   - _Why:_ Tests the core value proposition.

6. **Van Westendorp pricing question (simplified):** "What would you expect to pay per month for an app that automatically reads your blood test PDFs and tracks your health trends over time?" (Open text / number field)
   - _Why:_ Open-ended pricing reveals willingness to pay without anchoring bias. Watch for $0 answers (they would not pay) vs. $5-15 range (consumer sweet spot).

7. **"Would you like to be notified when this tool launches?"** (Yes + email field / No)
   - _Why:_ The ultimate conversion question. Giving their email = real intent.

**Distribution channels:**

- Reddit: r/biohacking, r/quantifiedself, r/longevity, r/health (see Tactic 3)
- X/Twitter: post the survey with a hook thread
- Quantified Self Forum (forum.quantifiedself.com) -- very engaged niche audience
- Facebook groups for health optimization, chronic illness management
- Hacker News "Show HN" or "Ask HN" (if framed as a question, not promo)

**What "success" looks like:**

- **Minimum meaningful responses:** 50-100 for directional insights. 100+ for confidence.
- **Statistical significance:** 100 responses at 95% confidence level gives you +-10% margin of error. Good enough for validation (you are not publishing a paper).
- **Strong signal indicators:**
  - 60%+ rate question 5 as "Very useful" or "Extremely useful"
  - 30%+ leave their email in question 7
  - Pricing answers cluster around $5-15/month (not $0)
  - Open text responses describe specific pain points with emotional language
- **Weak signal indicators:**
  - Most people say "Not very useful" or skip questions
  - Pricing answers are mostly $0 or "free"
  - Open text responses are vague one-word answers

**Time investment:** 1-2 hours to design, 1-2 hours to distribute, ongoing analysis

**Cost:** $0 (Tally or Google Forms)

---

### Tactic 3: Reddit / Community Validation

**What to do (step-by-step):**

1. **Lurk first** (1-2 days): Read recent posts in target subreddits. Understand the culture, what gets upvoted, what gets deleted.
2. **Post a genuine question** (not promotional): Frame it as seeking advice or sharing your own frustration.
3. **Engage in comments**: Reply to every response, ask follow-up questions. This is research, not marketing.
4. **Post your survey** (if allowed): Some subs allow survey posts, others do not. Check rules first.

**Target subreddits (ranked by relevance):**

| Subreddit                     | Members  | Why                                                            |
| ----------------------------- | -------- | -------------------------------------------------------------- |
| r/biohacking                  | ~700k    | Core audience: people who actively optimize health with data   |
| r/quantifiedself              | ~80k     | Smaller but deeply engaged; they track everything              |
| r/longevity                   | ~200k+   | Interested in biomarkers as aging indicators                   |
| r/health                      | ~3M+     | Broad audience, good for general interest signal               |
| r/Supplements                 | ~500k+   | Many members get regular bloodwork to track supplement effects |
| r/keto, r/intermittentfasting | 2M+ each | Diet communities that monitor blood markers                    |
| r/diabetes                    | ~100k+   | Chronic condition with heavy lab work involvement              |
| r/thyroid                     | ~50k+    | Very lab-dependent condition; regular tracking needed          |
| r/SampleSize                  | ~200k+   | Specifically for distributing surveys                          |

**How to frame the post (examples):**

**Good (genuine question, invites discussion):**

> "How do you track your blood test results over time? I get blood work every 6 months and I have been putting results into a spreadsheet, but it is getting unwieldy. Curious what others use -- apps, spreadsheets, or just relying on your doctor's portal?"

**Good (sharing frustration):**

> "Just got my latest blood work back and spent 30 minutes trying to compare my cholesterol trends to last year's results. My doctor's portal only shows the latest test. Anyone else frustrated by this? How do you handle it?"

**Bad (promotional, will get deleted):**

> "Hey everyone! I built an app that tracks blood tests! Check it out at [link]"

**What signals to look for in responses:**

- **Strong demand signal**: 50+ upvotes, 20+ comments, people sharing their own workarounds, people asking "where can I get this?"
- **Moderate signal**: 10-30 upvotes, several people relating to the problem, a few sharing their tools
- **Weak signal**: Under 10 upvotes, "just ask your doctor" responses, general disinterest
- **Red flag**: Hostile responses about privacy, "why would anyone need this," moderator removal

**Also look for:**

- Specific pain points people describe (feature ideas)
- Tools they currently use (competitive intelligence)
- Language they use to describe the problem (copy for your landing page)
- People who DM you asking for a solution (strongest signal)

**Time investment:** 2-4 hours (1-2 hours lurking, 1 hour writing posts, 1 hour engaging)

**Cost:** $0

**Examples of successful Reddit validation:**

- Nomad List founder Pieter Levels posted in r/digitalnomad asking "what tools do you wish existed?" before building
- Many indie hackers report their highest-signal validation came from Reddit because of the brutal honesty culture

---

### Tactic 4: Fake Door / Smoke Test

**What to do (step-by-step):**

1. **On your landing page, add a "Upload Your PDF" button** that does not actually process anything. When clicked, it goes to a page that says: "We are finalizing the upload feature. Leave your email to be first in line when it is ready."
2. **Add a pricing section** with 2-3 tier cards (e.g., Free / Pro $9.99/mo / Family $14.99/mo). The "Start Free" and "Subscribe" buttons go to the same waitlist page.
3. **Track every interaction**: which pricing tier they clicked, whether they clicked "Upload PDF," whether they left an email after seeing the waitlist page.

**How to do this ethically:**

- Be transparent on the follow-up page. Do not pretend the product is live when it is not.
- Use copy like: "ViziAI is launching soon. We are in early access -- your click tells us this feature matters to you. Leave your email and we will notify you when it is ready."
- Never collect money for a product that does not exist yet (unless it is explicitly a pre-order with refund terms).
- Do not mislead about the current state -- "coming soon" and "early access" are honest.

**What to measure:**

- **CTA click-through rate (CTR)**: Industry benchmark for fake door tests is 2-5% CTR indicating viable demand. Below 1% = reconsider the idea or the positioning.
- **Pricing tier clicks**: Which tier gets the most clicks reveals willingness-to-pay level.
- **Email capture rate after click**: If they click "Subscribe to Pro" and then also leave their email, that is a very strong signal.
- **Drop-off analysis**: How many click the button vs. how many actually leave an email? A large drop-off means the CTA was curiosity, not intent.

**What "success" looks like:**

- 3-5%+ CTR on the "Upload PDF" fake door = strong interest in the core feature
- 2-5%+ CTR on a paid pricing tier = willingness to pay is real
- 20%+ of people who land on the waitlist page leave their email = high intent
- If the "Pro" tier gets more clicks than "Free" = pricing is in the right range

**Time investment:** 3-5 hours (building the landing page with these elements)

**Cost:** $0-19

---

### Tactic 5: Content-as-Validation

**What to do (step-by-step):**

**A) Write a Twitter/X thread:**

1. Topic: "How I track my dad's blood test results (and what I learned about health trends)"
2. Structure: Personal story hook -> problem description -> what you tried -> what you built -> insights -> CTA
3. End with: "I am thinking about making this available to everyone. Would you use it? Reply or DM me."
4. Threads with 4-6 tweets get ~10% more engagement than single tweets.
5. Post at peak times (Tue-Thu, 9-11 AM EST for health/tech audiences)

**B) Write a blog post (SEO play):**

1. Target keywords (research these with Ubersuggest or Ahrefs free tier):
   - "how to read blood test results" (high volume, high competition)
   - "blood test tracker app" (medium volume, lower competition)
   - "how to track blood test results over time" (low volume, very low competition -- long tail)
   - "understand blood work results" (medium volume)
   - "blood test comparison tool" (low volume, low competition)
2. Write a genuinely helpful guide: "The Complete Guide to Tracking Your Blood Test Results Over Time"
3. Include a free Google Sheets template download (see C below)
4. Add a soft CTA at the end: "Want this automated? ViziAI is launching soon -- join the waitlist."
5. Publish on your own domain (SEO value) or Medium (distribution value)

**C) Create a free blood test tracking Google Sheets template:**

1. Build a well-designed spreadsheet with columns for date, metric name, value, reference range, and status (normal/high/low)
2. Add conditional formatting (green/amber/red based on reference ranges)
3. Include auto-generated charts for key metrics over time
4. Share it publicly on Google Sheets with "Make a copy" link
5. Promote it on Reddit, X, in the blog post, and in health communities
6. Track downloads (use a Bitly link or UTM-tagged URL)
7. Include a small note in the template footer: "Want this automated? Try ViziAI -- vizi-ai.onurovali.me"

**Existing templates to study (for differentiation):**

- Vertex42 Blood Count Tracker (Excel/Sheets, basic)
- GitHub markwk/awesome-biomarkers Biomarker Tracker (Google Sheets, technical)
- CLL Society Lab Results Tracker (disease-specific)
- Most existing templates are basic, ugly, and disease-specific -- a well-designed general-purpose one would stand out.

**What "success" looks like:**

- **X/Twitter thread**: 50+ likes, 10+ replies, 5+ DMs asking about the tool = strong signal
- **Blog post**: 500+ views in first month, ranking on page 2+ for target keywords within 3 months
- **Google Sheets template**: 100+ copies made in first month = people actively need this tool, and each copy is a warm lead
- **SEO benchmark**: If the blog post ranks for any keyword and drives organic traffic, you have a content moat competitors do not

**Time investment:**

- X thread: 1-2 hours
- Blog post: 4-6 hours
- Google Sheets template: 3-4 hours

**Cost:** $0

---

### Tactic 6: Concierge MVP / Manual Validation

**What to do (step-by-step):**

1. Post in relevant communities (Reddit, X, Quantified Self Forum, Facebook health groups):
   > "I am building a tool to help people understand their blood test results better. I would love to analyze your results for free -- just DM me a photo/PDF of your latest blood work, and I will send you back a visual summary with trends and context. No strings attached, just want to learn what people find useful."
2. When someone sends you their PDF, run it through the existing ViziAI extraction flow (you already have this built)
3. Send them back a clean visual summary with their trends, reference ranges, and any notable findings
4. Follow up with 3 questions:
   - "Was this helpful? What stood out to you?"
   - "What would you want to see differently?"
   - "Would you use a tool like this regularly if it existed as an app?"
5. Track: how many people respond to the offer, how many actually send their PDF, what feedback they give

**Why this is powerful:**

- It tests whether people will take an action (sending their actual blood test), not just say they would
- The follow-up conversation gives you deep qualitative insight
- You already have the tech stack built -- this is not truly manual, you are just doing the onboarding by hand
- People who send you their actual health data trust you and have a real need

**What "success" looks like:**

- **5-10 people send you their PDFs** within the first week = real pull (not push)
- **50%+ find the summary useful** in follow-up = value proposition validated
- **People ask "when can I sign up?"** without being prompted = strongest possible signal
- **People share it with their family** ("can you do this for my mom too?") = viral potential

**What "failure" looks like:**

- Nobody sends their PDF (the action barrier is too high or trust is too low)
- People say "cool" but have no follow-up questions (polite interest, not real need)
- Feedback is mostly "this is what my doctor already tells me" (value prop is weak)

**Time investment:** 1 hour to write the post, 30 min per person to process and follow up (budget for 10 = 6 hours total)

**Cost:** $0 (you already built the extraction pipeline)

---

### Tactic 7: Competitor Audience Mining

**What to do (step-by-step):**

**A) InsideTracker review mining:**

1. Read Trustpilot reviews (insidetracker.com has 30+ pages of reviews)
2. Focus on 2-3 star reviews (the most informative -- they tried the product but were disappointed)
3. Catalog specific complaints

**Key InsideTracker complaints found:**

- **Pricing**: $500+ for blood tests that overlap 75% with standard doctor panels. Annual costs exceed thousands with quarterly retesting.
- **Generic analysis**: "Very transactional and generic" -- pre-written descriptions rather than personalized insights. Users expected a human to evaluate results given the cost.
- **Poor PDF upload**: The app struggles to read uploaded lab PDFs, with missing units requiring manual conversions.
- **Clunky app**: Website feels poorly designed, convoluted pages, constant discount popups, pages that hang and crash.
- **Customer service**: Vague assurances with no follow-through, delays in getting results back.
- **State restrictions**: Cannot fill prescriptions in certain states, not disclosed upfront.

**ViziAI opportunity from InsideTracker gaps:**

- Affordable (or free tier) alternative that works with any lab's PDF
- Better PDF parsing (ViziAI's GPT-4o Vision extraction is already superior to OCR-based approaches)
- No lock-in to a testing service -- bring your own labs
- Clean, modern UI vs. InsideTracker's cluttered experience

**B) SiPhox Health review mining:**

- Blood draw difficulty (finger prick is harder than expected for some)
- Sample rejection if insufficient blood quantity
- Unclear instructions
- Some find reports lack depth

**C) App Store review mining for blood test trackers:**
Key apps to review: Blood Test Grapher, Lab Tracker, Carrot Care, Health3, BloodKnows

**Common user wishes found across App Store reviews:**

- **Web/desktop access**: Users want to view data on larger screens, not just mobile
- **Cross-device sync**: Data should sync between iPhone, iPad, and web
- **Better auto-detection**: Apps struggle to automatically identify lab results and dates from PDFs
- **Trend visualization**: Users want clear graphs comparing results over time
- **Custom metric tracking**: Support for ratios (e.g., total cholesterol to HDL) and non-standard markers
- **Data export**: Ability to export data for use elsewhere
- **Apple Health integration**: Increasingly requested

**D) Product Hunt comment mining:**

- Look at Carrot Care's Product Hunt page and similar launches
- Users praise simplification of lab data but want better document processing
- Integration with physical testing devices is a common request

**Time investment:** 4-6 hours of reading reviews and cataloging insights

**Cost:** $0

---

### Recommended 2-Week Validation Sprint

This playbook is ordered by effort vs. signal strength -- highest signal-per-hour tactics first.

---

#### Pre-Sprint Setup (Day 0, ~2 hours)

- [ ] Set up email collection: Create a ButtonDown or ConvertKit account (free tier)
- [ ] Set up analytics: Add a Plausible or Umami instance (privacy-friendly, or use Vercel Analytics which is already available)
- [ ] Create a dedicated email address for the concierge MVP outreach
- [ ] Bookmark all target subreddits and create a Reddit account if needed (do NOT use a brand-new account for posting -- Reddit will flag it as spam)

---

#### Week 1: Discovery and Direct Outreach

**Day 1-2: Concierge MVP posts (3-4 hours)**
_Signal strength: VERY HIGH | Effort: LOW_

- [ ] Write and post the "I will analyze your blood tests for free" offer in:
  - r/biohacking
  - r/quantifiedself
  - Quantified Self Forum
  - 1-2 relevant Facebook groups
- [ ] Respond to every reply within 24 hours
- [ ] Process any PDFs received through ViziAI pipeline
- [ ] Send back visual summaries and collect feedback
- **Success metric:** 5+ people send their PDFs in the first 3 days

**Day 2-3: Reddit validation posts (2-3 hours)**
_Signal strength: HIGH | Effort: LOW_

- [ ] Post the genuine question ("How do you track your blood test results?") in:
  - r/biohacking
  - r/longevity
  - r/health
- [ ] Engage with every comment, ask follow-up questions
- [ ] Document pain points, language used, and tools mentioned
- **Success metric:** 30+ upvotes and 15+ comments on at least one post

**Day 3-4: Build validation landing page (3-4 hours)**
_Signal strength: HIGH | Effort: MEDIUM_

- [ ] Build on Carrd or Framer (or a simple Next.js page)
- [ ] Include: headline, 3-4 benefit bullets, app mockup/screenshot, email signup, "See pricing" link
- [ ] Set up email capture to ButtonDown/ConvertKit
- [ ] Add basic analytics (UTM parameters for traffic sources)
- **Success metric:** Page is live and collecting emails by end of Day 4

**Day 4-5: Design and launch survey (2-3 hours)**
_Signal strength: MEDIUM-HIGH | Effort: LOW_

- [ ] Create the 7-question survey in Tally (free)
- [ ] Post in r/SampleSize with the title: "Blood test tracking habits survey (2 min)"
- [ ] Share in Reddit threads you have already posted in
- [ ] Share on X with a personal hook
- **Success metric:** 50+ responses by end of Week 1

**Day 5-7: Competitor review mining (3-4 hours)**
_Signal strength: MEDIUM | Effort: MEDIUM_

- [ ] Read 50+ InsideTracker Trustpilot reviews (focus on 2-3 stars)
- [ ] Read App Store reviews for top 5 blood test tracking apps
- [ ] Catalog complaints, wishes, and language into a spreadsheet
- [ ] Identify the top 5 unmet needs that ViziAI can address
- **Success metric:** Clear list of competitor gaps that map to ViziAI features

---

#### Week 2: Content, Scale, and Synthesis

**Day 8-9: Google Sheets template (3-4 hours)**
_Signal strength: MEDIUM-HIGH | Effort: MEDIUM_

- [ ] Build a polished blood test tracking template in Google Sheets
- [ ] Include: conditional formatting, auto-charts, reference ranges, clear instructions
- [ ] Make it better-designed than any existing template (the bar is low)
- [ ] Share publicly with "Make a copy" link
- [ ] Post it in the Reddit threads from Week 1 as a value-add comment
- [ ] Include a subtle ViziAI mention in the footer
- **Success metric:** 50+ copies made in the first week

**Day 9-10: X/Twitter thread (1-2 hours)**
_Signal strength: MEDIUM | Effort: LOW_

- [ ] Write a 5-tweet thread: "I have been tracking my dad's blood tests for 2 years. Here is what I learned about health trends."
- [ ] Include 1-2 visual charts from ViziAI (anonymized)
- [ ] End with: "I built a tool for this. Would you use it?" + link to landing page
- [ ] Post Tue-Thu between 9-11 AM EST
- **Success metric:** 30+ likes, 5+ meaningful replies, 10+ landing page visits from the thread

**Day 10-11: Fake door pricing test (2-3 hours)**
_Signal strength: HIGH | Effort: LOW_

- [ ] Add a pricing section to the landing page with 2-3 tiers
- [ ] "Subscribe" buttons go to waitlist with message: "ViziAI is launching soon. Your click tells us this plan interests you."
- [ ] Track which tier gets the most clicks
- **Success metric:** 3%+ CTR on any paid tier button

**Day 12-13: Blog post (4-6 hours)**
_Signal strength: MEDIUM (long-term HIGH) | Effort: HIGH_

- [ ] Write: "The Complete Guide to Tracking Your Blood Test Results Over Time"
- [ ] Include the Google Sheets template as a free download
- [ ] Add ViziAI CTA at the end
- [ ] Publish on your domain or Medium
- [ ] Share in relevant communities
- **Success metric:** 200+ views in first week, 10+ template downloads from the post

**Day 14: Synthesis and Decision (2-3 hours)**
_Signal strength: N/A | Effort: CRITICAL_

- [ ] Compile all data into a decision document:
  - Total email signups collected
  - Survey response summary (especially Q5 usefulness rating and Q6 pricing)
  - Reddit engagement metrics and qualitative themes
  - Concierge MVP feedback (how many sent PDFs, what they said)
  - Pricing test CTR data
  - Template download count
  - Competitor gap analysis
- [ ] Score the validation: GO / ITERATE / STOP

---

#### Decision Framework After the Sprint

| Signal                                    | Result                       | Action                                                                     |
| ----------------------------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| 100+ email signups                        | Strong demand                | Proceed to public launch planning                                          |
| 50-100 email signups                      | Moderate demand              | Iterate positioning, run another sprint focused on best-performing channel |
| Under 50 email signups                    | Weak demand                  | Reconsider the audience or the value prop                                  |
| Survey: 60%+ rate "Very/Extremely useful" | Core value validated         | Build the features they rated highest                                      |
| Survey: pricing clusters at $5-15/mo      | Willingness to pay exists    | Test specific price points with A/B landing pages                          |
| Survey: most say $0 or free               | Monetization challenge       | Consider freemium with premium features, or pivot to B2B                   |
| 10+ people send PDFs in concierge test    | Exceptional pull             | These are your first beta users; ask them to pay                           |
| Reddit posts get 50+ upvotes              | Problem resonates            | Double down on Reddit as acquisition channel                               |
| Pricing page CTR 3%+ on paid tier         | Real willingness to pay      | You have a business, not just a product                                    |
| Google Sheets template 100+ copies        | Content-led growth potential | Build SEO strategy around health tracking content                          |

---

#### Total Sprint Investment

- **Time:** ~35-45 hours over 2 weeks (roughly 3-4 hours/day)
- **Cost:** $0-19 (Carrd Pro annual plan is the only potential expense)
- **What you will know:** Whether there is real demand, what people will pay, which audience segment has the most pull, what features matter most, and what language resonates -- all before spending a dollar on marketing or building any new features.

---

### Key Lean Startup Principles Applied

1. **Build-Measure-Learn loops**: Each tactic has a clear metric. Do not just "do marketing" -- set targets and measure against them.
2. **Cheapest test first**: Concierge MVP and Reddit posts cost $0 and give the highest signal. Start there.
3. **Do things that do not scale**: Manually analyzing blood tests is not scalable, but it gives you the deepest learning. That is the point.
4. **Seek disconfirming evidence**: Do not just celebrate signups. Pay attention to the people who say "no" or "I would not pay" -- they are giving you the most valuable data.
5. **Evidence hierarchy**: Actions > Opinions > Compliments. Someone sending their PDF > someone saying "I would use this" > someone saying "cool idea."

---

## Action Items

Based on the validation tactics research:

1. **Immediate (this week):** Post concierge MVP offer in r/biohacking and r/quantifiedself
2. **Immediate:** Post genuine "how do you track blood tests" question on Reddit
3. **Day 3-4:** Build Carrd or Framer landing page with email capture
4. **Day 4-5:** Launch 7-question validation survey on Tally
5. **Week 2:** Build Google Sheets template, write X thread, add pricing fake door
6. **End of sprint:** Compile decision document with GO / ITERATE / STOP recommendation

---

## Sources

### Landing Page Benchmarks

- [Landing Page Conversion Rates by Industry (2026) -- First Page Sage](https://firstpagesage.com/seo-blog/landing-page-conversion-rates-by-industry/)
- [Average Conversion Rates Landing Pages -- Unbounce](https://unbounce.com/average-conversion-rates-landing-pages/)
- [Landing Page Statistics 2025 -- Hostinger](https://www.hostinger.com/tutorials/landing-page-statistics)
- [100+ Landing Page Statistics (2026) -- Involve.me](https://www.involve.me/blog/landing-page-statistics)
- [Landing Page Conversion Rate Benchmarks (2026) -- Landy Blog](https://www.landy-ai.com/blog/landing-page-conversion-rate-benchmarks)

### Survey Design & Willingness to Pay

- [How to Ask about Willingness to Pay -- Nick Freiling / Medium](https://nickfreiling.medium.com/how-to-ask-about-willingness-to-pay-in-a-consumer-survey-98b8b6e260c0)
- [Willingness to Pay for Health Apps -- PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11064745/)
- [Van Westendorp Price Sensitivity Meter -- SurveyMonkey](https://www.surveymonkey.com/market-research/resources/van-westendorp-price-sensitivity-meter/)
- [Determining Sample Size -- CloudResearch](https://www.cloudresearch.com/resources/guides/statistical-significance/determine-sample-size/)
- [Typeform Survey Response Rate Tips](https://www.typeform.com/blog/survey-response-rate)

### Reddit Validation

- [7 Ways to Use Reddit to Validate Startup Ideas -- Medium](https://medium.com/@reviewraccoon/7-ways-to-use-reddit-to-validate-your-startup-ideas-that-no-one-is-talking-about-100k-upvotes-35a9cc59888a)
- [How to Validate Startup Ideas on Reddit (2026) -- Reddinbox](https://reddinbox.com/blog/how-to-validate-startup-ideas-on-reddit)
- [13 Best Biohacker Subreddits -- Dave Asprey](https://daveasprey.com/best-biohacker-subreddits/)
- [Quantified Self for Longevity -- Longevity Advice](https://www.longevityadvice.com/quantified-self-longevity/)

### Fake Door / Smoke Testing

- [Fake Door Testing Guide -- Personizely](https://www.personizely.net/glossary/fake-door-testing)
- [Fake Door Smoke Test -- GLIDR](https://help.glidr.io/en/articles/1648423-fake-door-smoke-test)
- [Fake Door Testing Complete Guide -- Evelance](https://evelance.io/blog/fake-door-testing-the-complete-guide/)
- [From Fake Door to Glassdoor Validation -- Prelaunch](https://prelaunch.com/blog/fake-door-testing)

### Content & SEO

- [Awesome Biomarkers -- GitHub](https://github.com/markwk/awesome-biomarkers)
- [Blood Count Tracker -- Vertex42](https://www.vertex42.com/ExcelTemplates/blood-count-tracker.html)
- [All Personal Health Data in One Spreadsheet -- Medium](https://robbieallen.medium.com/all-of-my-personal-health-data-in-one-spreadsheet-66ee49cd1008)

### Concierge MVP & Lean Startup

- [Concierge MVP Guide -- Empat](https://www.empat.tech/blog/concierge-mvp)
- [Lean Validation Fundamental Guide -- Bundl](https://www.bundl.com/guides/lean-validation-a-fundamental-guide)
- [Validating Startup Idea: Lean Customer Feedback Playbook -- Altar.io](https://altar.io/validating-your-startup-idea-lean-customer-feedback-playbook/)

### Competitor Intelligence

- [InsideTracker Trustpilot Reviews](https://www.trustpilot.com/review/insidetracker.com)
- [InsideTracker Review (2026) -- Innerbody](https://www.innerbody.com/insidetracker-review)
- [SiPhox Health vs InsideTracker -- Nucleus](https://mynucleus.com/blog/siphox-health-vs-insidetracker)
- [Carrot Care Product Hunt Page](https://www.producthunt.com/products/carrot-care)
- [Blood Test Grapher -- App Store](https://apps.apple.com/us/app/blood-test-grapher/id1133573419)

### The Mom Test

- [The Mom Test Summary -- Iterators](https://www.iteratorshq.com/blog/the-mom-test-why-its-on-every-founders-bookshelf/)
- [The Mom Test Book Report -- mtlynch.io](https://mtlynch.io/book-reports/the-mom-test/)
- [5 Takeaways from The Mom Test -- Unusual VC](https://www.unusual.vc/rob-fitzpatricks-mom-test/)

### Waitlist & Landing Page Tools

- [Waitlist Landing Page Optimization Guide -- Waitlister](https://waitlister.me/growth-hub/guides/waitlist-landing-page-optimization-guide)
- [Framer Landing Page Best Practices 2025](https://www.framer.com/blog/landing-page-best-practices/)
- [How to Create a Coming Soon Page in Carrd -- Waitlister](https://waitlister.me/coming-soon-pages/carrd)
