# Xyren.me Redesign & Lead Management System Design Doc

**Date:** 2026-03-05
**Status:** Approved
**Vision:** Xyren.me is a portfolio/demo site showcasing Xyren's capability to build powerful, lead-tracking-enabled websites with AI-powered lead scoring and comprehensive analytics.

---

## 1. Project Overview

**What We're Building:**
A redesigned Xyren.me marketing website combined with a private lead management dashboard that serves two purposes:
1. **Marketing showcase** — Demonstrate to prospects what Xyren can build
2. **Internal proof-of-concept** — Live lead tracking, scoring, and analytics for Xyren's own business
3. **Future template** — When building for customers, spin up separate instances with this as the base

**Core Value Proposition:**
"Xyren builds websites for small businesses and service businesses with powerful tools for an accessible price." The site communicates: **"You can compete with bigger companies using Xyren."**

**Design Aesthetic:**
Innovative, modern, premium. Apple-inspired but unique. Generous whitespace, typography-first, subtle motion/interactions. Clear data visualizations.

---

## 2. Architecture

### Tech Stack
- **Frontend:** Next.js 16 (App Router)
- **Database:** Supabase PostgreSQL (single-tenant)
- **Authentication:** Supabase Auth (password + optional social login for your dashboard)
- **Tracking/Analytics:** Vercel Analytics (baseline) + custom event tracking layer
- **AI/Scoring:** Supabase Edge Functions (Node.js) for lead qualification
- **Styling:** Tailwind CSS + shadcn/ui

### Site Structure
```
/                          → Public marketing site (hero, features, use-cases, etc.)
/use-cases/*               → Industry-specific showcase pages
/resources                 → Hub landing for blog & guides
/resources/blog            → Blog listing with categories
/resources/blog/[category]/[slug] → Individual blog posts
/resources/how-to/[slug]   → How-to guides
/resources/faq             → FAQ page
/contact                   → Dedicated contact form page
/dashboard/*               → Private dashboard (authenticated, you only)
/auth                      → Login page
```

### Database Schema (MVP)
```sql
-- Lead captures from contact forms
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(20),
  business_type VARCHAR(100),
  service_needs TEXT,
  company_size VARCHAR(50),
  source_page VARCHAR(255),        -- Where form was submitted from
  referrer VARCHAR(255),            -- Traffic source
  fit_score INT,                    -- AI fit score (0-100)
  intent_score INT,                 -- AI intent score (0-100)
  overall_score INT,                -- Combined score
  status VARCHAR(50),               -- new, contacted, qualified, lost
  tags JSONB,                       -- User-defined tags
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Detailed visitor behavior tracking
CREATE TABLE lead_events (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  event_type VARCHAR(100),         -- page_view, form_start, form_submit, etc.
  page_path VARCHAR(255),
  referrer VARCHAR(255),
  device_type VARCHAR(50),         -- mobile, desktop, tablet
  location VARCHAR(100),           -- country/region if available
  scroll_depth INT,                -- % of page scrolled
  time_on_page INT,                -- seconds
  created_at TIMESTAMP
);

-- Users (just you initially)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50),                -- admin, user
  created_at TIMESTAMP
);
```

### SEO & Crawlability
- **Marketing site:** Fully SSR, completely crawlable by search engines
- **Dashboard:** Blocked via `robots.txt` (Disallow: /dashboard, /api/private)
- **sitemap.xml:** Includes only marketing routes
- **JSON-LD schema:** Markup on homepage, blog posts, use-case pages
- **OpenGraph tags:** Social sharing support on all marketing pages

---

## 3. Marketing Site Pages (MVP)

### Homepage (`/`)
- **Hero section:** Bold statement communicating "compete with bigger companies"
- **How we think:** Values/approach section
- **Portfolio/case studies:** Anonymized showcase of results (leads captured, qualification rates)
- **Tools section:** Highlight the lead tracking, AI scoring, analytics capabilities
- **Pricing:** Tiered pricing for different customer types
- **FAQ:** Common questions
- **CTA/Contact:** Multiple entry points to contact form

### Use Cases (`/use-cases/[industry]`)
- Professional services
- Home services
- (More can be added post-MVP)
- Show how Xyren's tools help each industry specifically

### Resources Hub (`/resources`)
- Landing page for blog, guides, and FAQ
- Curated content on web design, lead generation, automation

### Blog (`/resources/blog`, `/resources/blog/[category]/[slug]`)
- Category-based blog posts
- Initial content: web design trends, lead tracking best practices, automation guides
- SEO-optimized, shareable

### How-To Guides (`/resources/how-to/[slug]`)
- Actionable guides on using Xyren's features
- Examples: "How to set up lead tracking," "Understanding lead scores"

### FAQ (`/resources/faq`)
- Common questions about Xyren, pricing, process, lead tracking

### Contact Page (`/contact`)
- Dedicated form page for serious inquiries
- Shows contact info, form, maybe embedded dashboard preview

---

## 4. Lead Capture & Management

### What We Capture
- **Form fields:** Name, email, phone, business type, service needs, company size
- **Automatic data:** Submission timestamp, source page, referrer, device, browser
- **Entry points:**
  - Homepage CTA buttons
  - `/contact` page form
  - Forms on `/resources` pages

### AI Lead Scoring (MVP)
Runs on form submission via Supabase Edge Function.

**Scoring Dimensions:**
1. **Fit Score (0-100):**
   - Business type match (e.g., service businesses score high)
   - Service needs alignment with Xyren's offering
   - Company size sweet spot (SMBs score high)

2. **Intent Score (0-100):**
   - Form completion (fully filled = higher)
   - Pages visited before form (multiple pages = higher engagement)
   - Time on site before submission
   - Referrer quality (organic search = high intent)

3. **Overall Score (0-100):**
   - Weighted combination: 60% fit, 40% intent

### Lead Status & Management
- **Status labels:** new, contacted, qualified, lost
- **Tags:** User-defined tags for organization
- **Lead details:** Full info, behavior history, visit path, scores
- **No automated outreach:** You decide when/how to contact

---

## 5. Dashboard (Private, Authenticated)

### Dashboard Overview (`/dashboard`)
- **Key metrics:** Total leads (MTD), average score, conversion rate, top source
- **Recent activity:** Latest leads, recent scores, status changes
- **Quick stats:** Leads by status, average time-to-contact, etc.

### Leads List (`/dashboard/leads`)
- Lead table with: name, email, score, source, date, status
- **Filters:** By score range, source, date, status, tag
- **Sorting:** By score (desc), date, status
- **Bulk actions:** Tag, change status, export

### Lead Details (`/dashboard/leads/[id]`)
- Full lead info: name, email, phone, business details
- **Scores:** Fit, intent, overall with explanation
- **Engagement timeline:** All events in chronological order
- **Visit path:** Pages visited, time on each, referrer
- **Actions:** Change status, add tags, add notes, schedule follow-up

### Analytics (`/dashboard/analytics`)
- **Conversion funnel:** Visitors → Form started → Form submitted → High-score % (visualization)
- **Lead source breakdown:** Pie chart (organic, direct, referral, social)
- **Top pages:** Which pages drive most qualified leads (bar chart)
- **Quality by source:** Average score per source (table/heatmap)
- **Date range picker:** View by week, month, custom range

---

## 6. Tracking & Analytics Strategy

### Events Tracked
1. **Page views:** Every page visit with source, referrer, device, timestamp
2. **Form interactions:** Field focus, validation errors, submit attempts
3. **Engagement:** Time on page, scroll depth, click depth
4. **Lead quality:** Score assigned to lead, tied back to original events

### Data Structure
```javascript
lead_events {
  id, lead_id, event_type, page_path, referrer,
  device_type, location, scroll_depth, time_on_page,
  created_at
}
```

### Metrics Calculated
- **Conversion rate:** Leads submitted / Visitors
- **Top sources:** Which channels deliver the most leads
- **Quality by source:** Average lead score per traffic source
- **Funnel drop-off:** Where visitors leave the conversion path
- **Page engagement:** Which pages keep visitors longest, scroll deepest

### Privacy & Public Reporting
- **Dashboard:** All actual data (your access only)
- **Marketing site:** Shows *anonymized* metrics only
  - "85% of leads score 70+" (no actual lead data)
  - "1000+ leads managed in Q1" (aggregate only)
  - Dashboard screenshots (no live data, sample/demo data)

---

## 7. Design Aesthetic & Visual Strategy

### Philosophy
Communicate **"innovative, modern, powerful—accessible to SMBs"** without being trendy or gimmicky. Inspired by Apple's design but distinctly Xyren.

### Key Principles
1. **Generous whitespace:** Breathing room, not cramped
2. **Typography-first:** Bold, modern typeface choices
3. **Motion & micro-interactions:** Subtle animations on scroll/hover
4. **Color strategy:** Neutral base (white/off-white or dark) + 1-2 premium accent colors
5. **Component consistency:** Unified but modern button, card, form styles
6. **Data visualization:** Clean charts showing sophistication through clarity

### Visual Hierarchy
- **Hero:** Bold statement about competing with bigger companies
- **Case studies:** Real proof (anonymized) of lead capture & quality
- **Features/tools:** Showcase lead tracking, scoring, analytics, automation
- **Dashboard preview:** Show the sophistication without exposing live data
- **CTA:** Clear, multiple conversion opportunities

### Trust-Building Elements
- Case study cards: "X leads captured, Y% qualified, $Z revenue"
- Real metrics: "1000+ leads managed," "85% qualification accuracy"
- Dashboard screenshots: Show the power of the tool
- Client testimonials (future): Real feedback from early customers

---

## 8. MVP Scope & Future Expansion

### MVP (Phase 1)
✅ Redesigned marketing site with innovative aesthetic
✅ Lead capture forms on homepage + /contact
✅ AI lead scoring (fit + intent)
✅ Dashboard with lead list, filters, detail views
✅ Analytics: funnel, source attribution, visitor behavior, quality by source
✅ Tracking: page views, form interactions, engagement
✅ SEO: Fully crawlable marketing site, blocked dashboard

### Phase 2+ (Future)
- [ ] Blog with real content (currently placeholder)
- [ ] Email integration (Resend) for lead notifications
- [ ] Lead export/CRM integrations
- [ ] Customizable scoring rules (vs. fixed algorithm)
- [ ] Automated workflows (e.g., tag leads when score > 80)
- [ ] Lead source integrations (calendar scheduling, Slack notifications)
- [ ] Advanced analytics (cohort analysis, retention curves)
- [ ] White-label template for customer sites

---

## 9. Success Criteria

1. **Design:** Site feels innovative, modern, premium—clearly communicates "you can compete with bigger companies"
2. **Lead capture:** Forms work, data captures correctly, leads appear in dashboard
3. **Scoring:** AI scores leads accurately, distinguishes high/low quality leads
4. **Analytics:** Funnel, source, behavior, and quality metrics all visible and accurate
5. **SEO:** Marketing site fully crawlable, dashboard blocked from robots
6. **Performance:** Fast loading, smooth interactions
7. **Security:** Dashboard authenticated, lead data private, no data leaks

---

## 10. Team & Agent Responsibilities

**Project Manager (PM):**
- Own the project, track progress
- Coordinate frontend, backend, and design agents
- Remove blockers, ensure alignment

**Designer:**
- Research latest design trends (innovative, minimalist)
- Create design system (colors, typography, spacing, components)
- Provide visual assets, design specs for developers
- Ensure marketing site looks premium and builds trust

**Frontend Dev:**
- Build marketing site pages (SSR, SEO-optimized)
- Build dashboard UI (leads list, analytics, detail views)
- Implement tracking/analytics client-side
- Connect UI to backend APIs

**Backend Dev:**
- Build APIs for leads, analytics queries
- Implement AI lead scoring logic
- Set up database schema and migrations
- Build Supabase Edge Functions for scoring
- Handle authentication/authorization

---

## 11. Timeline (Estimated)

- **Design phase:** 3-5 days (design system, mockups, component library)
- **Frontend build:** 5-7 days (marketing site + dashboard UI)
- **Backend build:** 5-7 days (APIs, scoring, tracking, analytics)
- **Integration & testing:** 2-3 days
- **Launch & refinement:** 1-2 days

**Total: ~2-3 weeks to MVP launch**

---

## Notes

- This design prioritizes getting to launch quickly while building a solid foundation.
- The single-tenant architecture is simple but structured so future customer instances can be spun up easily.
- Lead scoring algorithm is intentionally simple for MVP (fit + intent); can be sophisticated later with more data.
- All tracking is consent-compliant (consider adding privacy notice/cookie banner).
