# Substitute Products & Workarounds

**Date:** 2026-02-22

> What do people currently use instead? Spreadsheets, doctor portals, generic health apps? What's the "hire" people are trying to do and how are they doing it today?

**Status:** Complete

### How People Currently Track Blood Tests

| Segment                  | Size Estimate               | Solution                          | Pain Level                       |
| ------------------------ | --------------------------- | --------------------------------- | -------------------------------- |
| **Do Nothing**           | ~60-70% of population       | Glance at results, forget         | Low (until something goes wrong) |
| **Spreadsheet Warriors** | ~5-10% (health-engaged)     | Excel/Google Sheets, manual entry | High (tedious, no automation)    |
| **Portal Dependent**     | ~20-30%                     | MyChart, Quest, Labcorp portals   | Medium (fragmented, no trends)   |
| **App Users**            | ~2-5% (biohackers, QS)      | InsideTracker, Carrot Care, etc.  | Medium (expensive or limited)    |
| **Paper/Binder**         | ~5-10% (older demographics) | Physical filing                   | High (no analysis possible)      |

### Spreadsheets (The Dominant DIY Method)

A thriving cottage industry of templates exists:

- **Free:** Vertex42 Blood Count Tracker, CLL Society tracker, GitHub markwk/awesome-biomarkers
- **Paid (Etsy):** Google Sheets blood test trackers ($5-15), marketed to biohackers and "chronic illness warriors"
- **Notion templates:** Blood Test Tracking (Good Energy), Medical Tracker, My Health Tracker

**Real user quote (Mayo Clinic Connect):**

> "I created my own Excel worksheet, listing in alphabetical order the different tests. On the header I have space for where a test was pulled, and date." — A user with labs from cancer center, dialysis center, AND Quest Labs.

**Real user quote (Rapamycin News longevity forum):**

> Members share spreadsheet templates for longitudinal tracking and actively ask for "open-source or free software for blood analysis/tracking/management" — indicating spreadsheets are insufficient.

**Key pain points with spreadsheets:**

- Manual data entry is tedious (typing every value from a PDF)
- Reference ranges differ across labs
- No automated trend visualization
- Hard to share with doctors
- Becomes unwieldy after several years

### Doctor/Lab Portals: Fragmented and Dumb

**Fragmentation is the #1 problem.** Each portal only shows results from that system. If you get blood work at Quest one year and Labcorp the next, there's no way to see trends across providers.

- Poor data visualization — a JMIR study found portals "lack sufficient and useful information for patients to understand their results"
- No personalization — raw numbers against reference ranges, no trend analysis or explanations
- Barriers: computer literacy, privacy concerns, different portals for different providers

### The "Do Nothing" Segment (Largest by Far)

Shocking statistics:

- **48% of Americans** don't know their cholesterol level
- **65%** don't know their blood glucose level
- Only **12% of US adults** have "proficient" health literacy
- **6.8% to 62%** of abnormal lab results are NOT followed up in ambulatory settings
- Patients who received interpretations had **71% follow-up rate** vs. **49%** without

Typical behavior: get blood work done, glance at high/low flags, forget about it. No comparison to previous results. No trend tracking.

### Generic Health Apps: Can't Do Blood Tests

- **Apple Health** — Has a "Lab Results" section but can't manually add most biomarkers. Only works with participating US providers. No PDF import.
- **Google Fit** — Supports blood glucose, BP, heart rate, SpO2. That's it. No cholesterol, liver enzymes, thyroid, CBC.
- **Cronometer** — Notable exception, supports blood test logging, but it's primarily a nutrition app. Manual entry only.
- **MyFitnessPal** — Does NOT support blood test tracking at all.

### Jobs to Be Done (Top 5)

1. **"Help me spot trends before they become problems"** (Early Warning)
   - Most common job. "One single test result is never as telling as the overall trend."
   - Who: Chronic disease patients, people with family history, health-anxious, caregivers

2. **"Show me if what I'm doing is working"** (Intervention Feedback)
   - Changed diet, started supplement, began medication — did it move the needle?
   - Who: Biohackers, medication patients, keto/carnivore dieters, longevity enthusiasts

3. **"Help me prepare for my doctor visit"** (Doctor Preparation)
   - Organized data to bring to appointments, especially with multiple specialists
   - Who: Patients with multiple providers, caregivers, chronic illness patients

4. **"Help me understand what my numbers mean"** (Comprehension)
   - 80% claim to understand results, yet most can't name their cholesterol or glucose
   - Who: General population, lower health literacy, non-native speakers, anxious patients

5. **"Keep all my health records in one place"** (Consolidation)
   - Results scattered across Quest, Labcorp, hospital portals, paper, emailed PDFs
   - Who: Anyone who switched doctors, moved cities, manages family records

### The Gap ViziAI Fills

Most people either **do nothing** (because it's too hard) or use **spreadsheets** (because nothing else fits). The specific pain of extracting values from PDF lab reports and automatically tracking them over time is largely unaddressed. InsideTracker and SiPhox require using their testing services. For Turkish lab PDFs specifically, there is no solution on the market.
