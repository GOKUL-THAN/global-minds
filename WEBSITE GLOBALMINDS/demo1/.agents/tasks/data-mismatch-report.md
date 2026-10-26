# Data Mismatch Audit Report — Global Minds Academy Website
**Audit date:** 2025  
**Scope:** `d:\WEBSITE GLOBALMINDS\demo1\src\` and `public\`

---

## Executive Summary

**7 active courses exist in `courses.ts`** (not 8 as stated in README and not 9 as implied by earlier messages). **Generative AI does NOT exist as a course.** There are wide-spread category-slug mismatches between `courses.ts` and `categories.ts`/`publicCourseCatalog.ts` that break the `/categories/:slug` routing for every course. Additional medium and low severity issues affect the README, `AboutPage.tsx`, `instructors.ts`, `masterPrograms.ts` image map, and the `Automation Testing` category routing.

---

## Findings

---

### 1. courses.ts vs publicCourseCatalog.ts — Category Slug Mismatches (HIGH)

**File:** `src/data/courses.ts` vs `src/data/publicCourseCatalog.ts` vs `src/data/categories.ts`

`courses.ts` assigns internal category values that do **not** match the slugs in `categories.ts` or `publicCourseCatalog.ts`. `courseService.ts` calls `applyPublicCourseListing()` which **overwrites** the `category` field with the value from `publicCourseCatalog.ts`. This means the live category routing uses `publicCourseCatalog.ts` slugs, not `courses.ts` slugs. However, `CategoryPage.tsx` (line 16) also filters via `course.category === slug` — so the slug in the URL (`/categories/:slug`) must match the catalog's category, not the raw courses.ts value.

| Course | `courses.ts` category | `publicCourseCatalog.ts` category | `categories.ts` slug |
|--------|----------------------|----------------------------------|----------------------|
| Data Science | `'data-science'` | `'data-science-analytics'` | `'data-science-analytics'` ✅ |
| Machine Learning | `'ai-ml'` | `'machine-learning'` | `'machine-learning'` ✅ |
| Software Testing | `'testing'` | `'software-testing'` | `'software-testing'` ✅ |
| Automation Testing | `'testing'` | `'automation-testing'` | `'automation-testing'` ✅ |
| AWS / Cloud | `'cloud'` | `'cloud-computing'` | `'cloud-computing'` ✅ |
| Full Stack Development | `'development'` | `'full-stack-development'` | `'full-stack-development'` ✅ |
| Cyber Security | `'cyber-security'` | `'cyber-security'` | `'cyber-security'` ✅ |

**Finding:** After `applyPublicCourseListing()` is applied in `courseService.ts`, the effective category slugs DO match `categories.ts`. However, the raw `courses.ts` internal values (`'data-science'`, `'ai-ml'`, `'testing'`, `'cloud'`, `'development'`) are mismatched. Any code path that uses `allCourses` directly from `courses.ts` (bypassing `courseService`) — such as `getCoursesByCategory()` exported from `courses.ts` itself (line 525) — will return zero results when called with the correct `categories.ts` slugs.

**Severity:** HIGH — `courses.ts`'s own `getCoursesByCategory()` helper is broken for all 5 mismatched categories. Any direct static import that calls this function will silently return empty arrays.

**Fix:** Align `courses.ts` category values to match `categories.ts` slugs:
- `'data-science'` → `'data-science-analytics'`
- `'ai-ml'` → `'machine-learning'`
- `'testing'` (Software Testing) → `'software-testing'`
- `'testing'` (Automation Testing) → `'automation-testing'`
- `'cloud'` → `'cloud-computing'`
- `'development'` → `'full-stack-development'`

---

### 2. README.md — Wrong Course Count and Non-Existent Course Listed (HIGH)

**File:** `README.md`, line 11  
**What it says:** `🎓 **8 Courses** — Data Science, ML, Software Testing, Automation Testing, AWS, Generative AI, Full Stack, Cyber Security`  
**What is true:** There are **7 active courses** in `courses.ts`. **Generative AI does not exist** — there is no course record with `slug: 'generative-ai'` anywhere in the codebase. The `courses.ts` comment `// Individual courses removed — master programs available in masterPrograms.ts` (end of file) also suggests something was deleted.

**Severity:** HIGH — the README advertises a course (`Generative AI`) that does not exist. A prospective student clicking for that course will hit a 404.

**Fix:** Update README line 11 to: `🎓 **7 Courses** — Data Science, Machine Learning, Software Testing, Automation Testing, AWS / Cloud, Full Stack Development, Cyber Security`

---

### 3. courses.ts — Missing Generative AI Course (HIGH)

**File:** `src/data/courses.ts`  
**What it says:** 7 courses (IDs c1, c2, c3, c4, c5, c7, c8 — note c6 is missing, the comment says "Individual courses removed").  
**What the README and original user request claim:** 9 courses including Generative AI.

`publicCourseCatalog.ts` also lists only 7 courses and does not include Generative AI.

**Severity:** HIGH — the course advertised in the README does not exist. A `/courses/generative-ai` URL returns a 404. The slug `generative-ai.jpg` exists in `/public/images/courses/` but the course data record is absent.

---

### 4. categories.ts — Automation Testing Category Not Linked to Correct Courses Array (MEDIUM)

**File:** `src/data/categories.ts`, lines 83–95

The `automation-testing` category has:
```ts
courses: ['automation-testing'],
```
However, `courses.ts` lists Automation Testing with `category: 'testing'` (not `'automation-testing'`), meaning the `courses` array on the category object is technically correct as a cross-reference, but the category `slug: 'automation-testing'` will only work with `courseService.ts` (which uses `publicCourseCatalog.ts`'s corrected category), not with direct static usage.

Similarly the Software Testing category (slug: `'software-testing'`) lists `courses: ['software-testing']` but `courses.ts` assigns `category: 'testing'`. Same issue.

**Severity:** MEDIUM — consistent with issue #1, but worth noting separately for the `courses` array field on each category.

---

### 5. masterPrograms.ts — ai-ml-master-program and data-science-business-intelligence Share the Same Image (MEDIUM)

**File:** `src/data/masterPrograms.ts`, lines 141–144  
**What it says:**
```ts
'ai-ml-master-program': '/images/master-programs/data-science-master-program.jpg',
'data-science-business-intelligence': '/images/master-programs/data-science-master-program.jpg',
```
Both the AI & ML Master Program and the Data Science & BI Master Program use the same image (`data-science-master-program.jpg`). There is **no** `ai-ml-master-program.jpg` file in `public/images/master-programs/`. Available files: `big-data-master-program.jpg`, `business-intelligence-master-program.jpg`, `cloud-master-program.jpg`, `data-science-master-program.jpg`, `devops-master-program.jpg`, `freshers-master-program.jpg`, `full-stack-master-program.jpg`, `software-testing-master-program.jpg`.

**Severity:** MEDIUM — the AI & ML Master Program shows the same image as the Data Science & BI program. Visually confusing but not a broken link. A dedicated AI/ML image does not exist; the closest available alternatives would be `data-science-master-program.jpg` (current) or creation of a new file.

**Fix:** Either create `/images/master-programs/ai-ml-master-program.jpg` or update the map to use a visually distinct existing image (e.g., `business-intelligence-master-program.jpg` for the data-science-bi program to differentiate them).

---

### 6. MasterProgramsSection.tsx — Missing software-testing-master-program in Image Map (HIGH)

**File:** `src/components/home/MasterProgramsSection.tsx`, lines 12–17

The `homepageMasterProgramImages` map contains:
```ts
'freshers-master-program': '/images/master-programs/freshers-master-program.jpg',
'full-stack-master-program': '/images/master-programs/full-stack-master-program.jpg',
'ai-ml-master-program': '/images/master-programs/data-science-master-program.jpg',
'data-science-business-intelligence': '/images/master-programs/data-science-master-program.jpg',
```
**Missing:** `'software-testing-master-program'` is not in this map.

`masterPrograms.ts` has `mp6` with `slug: 'software-testing-master-program'` and `status: 'active'` but `featured: false`. This means it won't appear in the homepage `featuredPrograms` slice (filtered by `featured: true`), so the missing map entry currently has no visible effect on the homepage. However, if `featured` is ever set to `true`, the software testing master program will render with whatever thumbnail the `masterPrograms.ts` data provides (an Unsplash URL) instead of the local image.

**Severity:** HIGH (latent) — the image map in `MasterProgramsSection.tsx` is inconsistent with all 5 programs in `masterPrograms.ts`. The `software-testing-master-program.jpg` image exists in `public/images/master-programs/` but is not referenced. Should be added to be consistent.

**Fix:** Add to `homepageMasterProgramImages`:
```ts
'software-testing-master-program': '/images/master-programs/software-testing-master-program.jpg',
```

---

### 7. instructors.ts — Courses Array References Non-Existent Slugs (MEDIUM)

**File:** `src/data/instructors.ts`

Several instructor `courses` arrays reference course slugs that do not exist in `courses.ts`:

| Instructor | Referenced slugs that don't exist |
|-----------|-----------------------------------|
| `i1` (Alex Johnson) | `'cloud-computing'`, `'aws-devops'`, `'cloud-master-program'` |
| `i2` (Priya Sharma) | `'data-science-master-program'` |
| `i3` (Rahul Verma) | `'kubernetes'`, `'software-testing-master-program'` |
| `i4` (Sarah Williams) | `'react-js'`, `'node-js'`, `'full-stack-master-program'` |
| `i5` (Kiran Reddy) | `'selenium'`, `'software-testing-master-program'` |
| `i6` (Meera Nair) | `'ethical-hacking'` |

Valid slugs in `courses.ts`: `data-science`, `machine-learning`, `software-testing`, `automation-testing`, `aws-training`, `full-stack-development`, `cyber-security`.

**Severity:** MEDIUM — no link is currently rendered from the instructor `courses` array to course pages on the public site (instructor pages use Unsplash placeholder photos anyway), but if any component iterates this array and builds `/courses/:slug` links, those slugs will 404.

---

### 8. AboutPage.tsx — "Direct Hires: 350+ Global hiring partners" Contradicts siteConfig.ts (HIGH)

**File:** `src/pages/AboutPage.tsx`, line 17  
**What it says:**
```ts
{ icon: ShieldCheck, title: 'Direct Hires', description: '350+ Global hiring partners', ... }
```
**What siteConfig.ts says:** `50+` hiring partners (stats array, `id: 's2'`).  
**What PlacementPage.tsx says:** `50+` hiring partners.  
**What Footer.tsx says:** Nothing (inferred from siteConfig).

**Severity:** HIGH — the About page claims 350+ hiring partners while every other page and the site config says 50+. This is a direct factual contradiction visible to users.

**Fix:** Change `'350+ Global hiring partners'` to `'50+ Hiring partners'` in `AboutPage.tsx`.

---

### 9. Navbar.tsx — Courses Dropdown Uses categories.ts Slugs (/categories/:slug), Possibly Empty Pages (MEDIUM)

**File:** `src/data/navigationMenu.ts`, lines 137–146

The default navbar Courses dropdown maps `categories` from `categories.ts` to hrefs like `/categories/data-science-analytics`, `/categories/machine-learning`, etc. `CategoryPage.tsx` filters courses via `course.category === slug`. After `applyPublicCourseListing()`, the category values on courses DO match these slugs — so the pages will work when `courseService` is used. However if `courseService` fails (API down, CMS empty), the static fallback `allCourses` from `courses.ts` has mismatched category values (issue #1), meaning category pages will show "courses coming soon" instead of the actual courses.

**Severity:** MEDIUM — navigation links are correct for the normal code path; they only silently fail in the static fallback scenario.

---

### 10. Footer.tsx — /placement-records Route vs /placement Route (LOW)

**File:** `src/components/layout/Footer.tsx`, line 37 — the footer has `'Career Support'` linking to `/career`.  
**File:** `src/App.tsx` — there is a route `{ path: 'placement', element: <CareerPage /> }` (not `PlacementPage`) and a separate route `{ path: 'placement-records', element: <PlacementPage /> }`.

The Footer "Career & Offers" section links to `/placement-records` (correct for PlacementPage), not to `/placement`. This is consistent. No broken link here.

However, `/placement` silently renders `CareerPage` instead of `PlacementPage`, which may confuse users who type the URL directly.

**Severity:** LOW — the footer links are fine; the aliased `/placement` route pointing to `CareerPage` instead of `PlacementPage` is a minor UX confusion but not a broken link.

---

### 11. siteConfig.ts — Stats Array is Incomplete (MEDIUM)

**File:** `src/data/siteConfig.ts`, lines 77–79

The `stats` array contains **only one entry**:
```ts
stats: [
  { id: 's2', label: 'Hiring Partners', value: '50+', numericValue: 50, suffix: '+', icon: 'briefcase', description: 'Top tech enterprises' },
],
```
Note the ID is `'s2'` — implying `s1` (likely learner count or courses count) was removed. The `StatsSection` component on the homepage renders this array. If any page or component expects stats like learner count or placement percentage to come from `siteConfig.stats`, those stats will be missing.

**Severity:** MEDIUM — the stats section will only show 1 stat instead of multiple. Compare with what the site originally intended (learner count "5,000+", placement rate, etc. — these are common stats for ed-tech sites and would have been in the missing `s1`, `s3`, etc. entries).

---

### 12. README.md — /trainers Route Listed but Page Not Accessible (MEDIUM)

**File:** `README.md` — Public Routes table lists `/trainers` as a route.  
**File:** `src/App.tsx` — There is **no** `/trainers` route defined in the router.  
There is a `pages/TrainersPage.tsx` file but it is not imported or routed in `App.tsx`.

**Severity:** MEDIUM — `/trainers` is documented in the README and linked from some trainer profile-related data, but visiting it returns a 404 (the `*` catch-all renders `NotFoundPage`).

---

### 13. blogs.ts — Blog "Kubernetes vs Docker Swarm" References DevOps Category (LOW)

**File:** `src/data/blogs.ts`, blog `b6`, `category: 'DevOps'`

There are only 5 blog posts (`b1`, `b3`, `b4`, `b5`, `b6` — note `b2` is skipped). The category `'DevOps'` in blog `b6` is a free-form string, not matched to any course category slug. No course for DevOps exists on the site. Blog `b3` also references `DevOps` in tags. This is contextually confusing since DevOps is not an offered course.

**Severity:** LOW — blog categories are standalone strings, not validated against course categories. No broken route results. Just inconsistent messaging.

---

### 14. testimonials.ts — Mentions "DevOps training" at Global Minds (LOW)

**File:** `src/data/testimonials.ts`, testimonial `t8` (Suresh Babu)  
**What it says:** `course: 'AWS / Cloud'` but the review text says "DevOps training at Global Minds covers everything — Docker, Kubernetes, Terraform, Jenkins, Ansible and AWS integration."  

This testimonial's `course` field says `'AWS / Cloud'` but the review describes DevOps training as a separate track. Since there is no DevOps course, this creates an inconsistency — either the review should be rewritten to describe the AWS / Cloud course, or a DevOps course should exist.

**Severity:** LOW — cosmetic inconsistency. The review will render under the AWS / Cloud label.

---

### 15. publicCourseCatalog.ts vs courses.ts — Learner Counts Diverge (LOW)

**File:** `src/data/courses.ts` vs `src/data/publicCourseCatalog.ts`

`applyPublicCourseListing()` overwrites `learnerCount` from the static `courses.ts` value with the `publicCourseCatalog.ts` value. These values are significantly different:

| Course | courses.ts learnerCount | publicCourseCatalog.ts learnerCount |
|--------|------------------------|-------------------------------------|
| Data Science | 5,600 | 1,340 |
| Machine Learning | 4,100 | 980 |
| Software Testing | 3,800 | 1,320 |
| Automation Testing | 3,500 | 1,100 |
| AWS / Cloud | 5,200 | 1,150 |
| Full Stack Development | 7,200 | 1,600 |
| Cyber Security | 2,400 | 750 |

The live site uses `publicCourseCatalog.ts` values (lower), while the raw data in `courses.ts` has much higher numbers.

**Severity:** LOW — inconsistent internal data. The displayed learner counts are the `publicCourseCatalog.ts` values (lower, likely the real figures). No functional breakage but the `courses.ts` data is stale/inflated.

---

### 16. PlacementPage.tsx — Student Stories Reference Non-Hired-Partner Companies (LOW)

**File:** `src/pages/PlacementPage.tsx`, `studentStories` array

Student story for `Kavitha Reddy` references `'Python & Django'` as the course. There is no `Python & Django` course on the site. This is a fabricated course name in a placement story.

Similarly, the partners array lists `Amazon`, `Microsoft`, `Google` in student stories — these companies appear with logo files in `public/images/hiring-partners/`, but they are **not** in the main `partners` array that builds the hiring partners grid. So these 3 companies appear in individual success stories but not in the "50+ Hiring Partners" display grid.

**Severity:** LOW — cosmetic inconsistency but could undermine trust if visitors notice.

---

### 17. BatchSchedulePage.tsx — Batch Course Names Don't Match Canonical Course Titles (LOW)

**File:** `src/pages/BatchSchedulePage.tsx`, `upcomingBatches` array

Batch `b3` uses `course: 'Machine Learning'` which matches. Batch `b4` uses `course: 'Data Science'` which matches. However, the `category` fields in `upcomingBatches` use display strings (`'AWS / Cloud'`, `'Full Stack Development'`, etc.) that happen to match the `categories.ts` titles — this is correct for display but they're hardcoded strings unlinked to the data layer.

**Severity:** LOW — no functional breakage, but the batch schedule is completely hardcoded and disconnected from actual course/category data.

---

### 18. AboutPage.tsx — "Our Values" Section Shows Course Names as Values (MEDIUM)

**File:** `src/pages/AboutPage.tsx`, lines 96–112

The "Our Values" section (title: "Our Values") actually renders a grid of course names as "values":
```ts
{ title: 'AWS / Cloud', desc: 'AWS / Cloud' },
{ title: 'Data Science', desc: 'Data Science' },
{ title: 'Machine Learning', desc: 'Machine Learning' },
{ title: 'Full Stack Development', desc: 'Full Stack Development' },
```
This is clearly placeholder content that was never replaced with real company values (e.g., Innovation, Excellence, Integrity, etc.).

Additionally this grid only shows 4 courses, not the full 7. Cyber Security, Software Testing, and Automation Testing are omitted.

**Severity:** MEDIUM — the About page "Values" section is displaying course names instead of company values. Visually misleading and unprofessional.

---

### 19. CategoryPage.tsx — Dual Category Slug System Risk (HIGH, Systemic)

**File:** `src/pages/CategoryPage.tsx`, lines 12–16

```ts
const category = categories.find(item =>
  item.slug === (slug || '')
  && publicCourseCatalog.some(course => course.category === item.slug),
);
const catCourses = visibleCourses.filter(course => course.category === (slug || '') && course.status === 'active');
```

`CategoryPage` finds the category using `categories.ts` slugs, but filters courses using `visibleCourses` (from `useCourseCatalog` hook → `courseService`) where the category has already been rewritten by `applyPublicCourseListing()` to match `publicCourseCatalog.ts` categories.

This means:
- URL `/categories/data-science-analytics` → finds `categories.ts` entry (slug `data-science-analytics`) ✅ → filters courses where `course.category === 'data-science-analytics'` ✅ (set by publicCourseCatalog) ✅

So in the live flow via courseService, this works. But the `getCoursesByCategory('data-science-analytics')` from `courses.ts` directly returns `[]` because that course has `category: 'data-science'` in `courses.ts`.

**Severity:** HIGH — systemic internal inconsistency. Works in production via courseService, but a bug waiting to happen if code uses `courses.ts` helpers directly.

---

### 20. Courses Missing from the Courses Array (NOTE)

**File:** `src/data/courses.ts` — IDs jump from `c5` to `c7` (c6 is skipped), and the comment at the end says `// Individual courses removed — master programs available in masterPrograms.ts`. This indicates courses were deliberately removed (likely DevOps and/or Generative AI). However, README still advertises 8 courses including Generative AI.

The `generative-ai.jpg` image exists in `public/images/courses/` but no corresponding course record exists.

---

## Summary Table

| # | Location | Severity | Issue |
|---|----------|----------|-------|
| 1 | courses.ts category fields | HIGH | Raw category slugs mismatch categories.ts/publicCourseCatalog.ts — getCoursesByCategory() broken |
| 2 | README.md line 11 | HIGH | Lists 8 courses including non-existent Generative AI |
| 3 | courses.ts (missing c6) | HIGH | Generative AI course does not exist; image file exists but record is absent |
| 4 | MasterProgramsSection.tsx | HIGH | `software-testing-master-program` missing from image map |
| 5 | AboutPage.tsx feature cards | HIGH | Claims "350+ Global hiring partners" vs siteConfig's "50+" |
| 6 | CategoryPage.tsx (systemic) | HIGH | Dual category slug system; direct courses.ts helpers silently broken |
| 7 | masterPrograms.ts images | MEDIUM | ai-ml-master-program and data-science-bi share same image; no dedicated AI/ML image exists |
| 8 | instructors.ts courses[] | MEDIUM | Multiple non-existent course slugs referenced |
| 9 | AboutPage.tsx "Our Values" | MEDIUM | Course names displayed as company values; 3 of 7 courses missing from the grid |
| 10 | siteConfig.ts stats | MEDIUM | Only 1 stat item (s2); s1 and other stats removed, leaving gaps |
| 11 | README.md routes table | MEDIUM | /trainers route listed but not in App.tsx router |
| 12 | Navbar (categories dropdown) | MEDIUM | Works via courseService; silently fails in static fallback |
| 13 | blogs.ts b6, b3 | LOW | DevOps category on blogs; no DevOps course exists |
| 14 | testimonials.ts t8 | LOW | Review text describes DevOps training under AWS/Cloud course label |
| 15 | publicCourseCatalog.ts learnerCounts | LOW | Learner counts diverge widely from courses.ts values |
| 16 | PlacementPage.tsx student stories | LOW | "Python & Django" course referenced; Amazon/Microsoft/Google not in partners grid |
| 17 | BatchSchedulePage.tsx | LOW | Batch data hardcoded, disconnected from course/category data layer |

---

## Recommended Fixes (Priority Order)

1. **Add Generative AI course** to `courses.ts` with `slug: 'generative-ai'` and `category: 'ai-ml'` or remove it from README, siteConfig tagline, and all references. The thumbnail image already exists at `/images/courses/generative-ai.jpg`.

2. **Fix category slugs** in `courses.ts` to match `categories.ts` slugs (see issue #1 table above). This is a 6-line change.

3. **Fix AboutPage.tsx**: Change "350+ Global hiring partners" → "50+ Hiring Partners" (line ~17).

4. **Fix AboutPage.tsx "Our Values"** section: Replace course names with real company values.

5. **Add software-testing-master-program** to `MasterProgramsSection.tsx` image map.

6. **Update README.md** course count from 8 to 7 (or 8 if Generative AI is added), remove "Generative AI" from course list or add the actual course.

7. **Add /trainers route** to `App.tsx` importing `TrainersPage`.

8. **Instructor courses arrays**: Update `instructors.ts` course references to use only the 7 valid slugs.
