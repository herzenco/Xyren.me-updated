# Xyren.me — Project Skills & Design System

> **Xyren** — Productized Web Design for Service Professionals
> *By Herzen Co.*

---

## Branding

| Element | Value |
|---|---|
| **Brand Name** | Xyren |
| **Parent Company** | Herzen Co. |
| **Tagline** | Custom Websites for Service Professionals |
| **Website** | xyren.me |
| **Email** | hello@xyren.co |
| **Twitter** | @xyrenme |
| **Primary Color** | `#408be9` (Xyren Blue) |
| **Font** | Inter (Sans) + Geist Mono |
| **Logo Variants** | Blue (primary), Dark (formal), White (dark mode via CSS filter) |
| **Logo Files** | `public/logos/xyren-logo-blue.png`, `public/logos/xyren-logo-dark.png` |
| **Brand Voice** | Professional, confident, clear, no-nonsense — conversion-focused language |
| **Text Logo** | "**Xyren** by Herzen Co." (Xyren in font-medium foreground, "by Herzen Co." in muted-foreground) |

### Logo Usage Rules

| Context | Logo Variant | Technique |
|---|---|---|
| **Navbar** | Text logo: "Xyren by Herzen Co." | `<span>` with color split |
| **Footer (light mode)** | Text: "Xyren" + "by Herzen Co." | White + `#6a7282` on dark bg |
| **Footer (dark mode)** | Same as light (footer is always dark) | Same |
| **Marketing / social** | Blue logo PNG | Export from `public/logos/` |
| **Print / formal docs** | Dark logo PNG | Export from `public/logos/` |

> **Critical:** The navbar uses a text-based logo ("Xyren by Herzen Co."), NOT logo images. The PNG logos are for marketing materials and external use. Always include "by Herzen Co." alongside "Xyren" in all website contexts.

---

## Copy Guidelines

### Copy Style Instructions
- Write direct, punchy, customer-first copy for a modern operating company.
- Avoid “founders” language by default. Prefer “businesses,” “teams,” or “service businesses” when relevant.
- No em dashes. Use periods. Use commas sparingly. Use hyphens only when necessary.
- Avoid buzzwords and inspirational language. No hype. No metaphors.
- Headlines must be short, declarative, and outcome-focused.
- Subheads should clarify what we do and who it is for in plain language.
- Favor contrasts and fit qualifiers. Use lines like “good fit if…” and “not just…”
- Speak with calm confidence. Slight edge is fine. Never salesy.
- Focus on outcomes first, then features only if needed.
- Keep sections scannable. Use 3 to 5 bullets max when helpful.
- CTAs should be understated and direct.

### 20 Example Pairs

| Context | DO | DO NOT |
|---|---|---|
| **1) Homepage hero headline** | We help businesses build products and grow. | Empowering ambitious founders to unlock exponential growth. |
| **2) Subheadline under hero** | We operate focused service brands that handle product, automation, and growth so you can move faster. | We leverage a holistic approach to accelerate your digital transformation journey. |
| **3) Section label** | WHO WE ARE | OUR PHILOSOPHY |
| **4) “Who we are” headline** | The operating company behind independent brands. | Building a future of interconnected ventures. |
| **5) “Who we are” body copy** | Each brand runs independently with clear ownership. Herzen Co provides structure and shared standards. | Our ecosystem thrives through synergy and alignment across verticals. |
| **6) Fit qualifier headline** | We are a good fit if you need to ship, not just plan. | Let’s bring your vision to life together. |
| **7) Fit bullets** | • You need execution this quarter<br>• You want clear ownership<br>• You care about measurable progress | • You value innovation<br>• You believe in collaboration<br>• You want to disrupt your industry |
| **8) Xyren one-liner** | Conversion-ready websites for service businesses, launched fast with automation built in. | A next-generation web experience engineered for modern brands. |
| **9) Xelerate one-liner** | Fractional product leadership for teams that need clarity, structure, and momentum. | A strategic partner to elevate your roadmap and optimize outcomes. |
| **10) Productized offer phrasing** | Launched in days, not months. | Accelerated delivery timelines with agile methodologies. |
| **11) Outcome first, features second** | Get more qualified leads. Then automate follow-up. | Includes CRM, AI chat, analytics, scheduling, and integrations. |
| **12) Proof without bragging** | Clear scope. Tight feedback. Visible progress. | Best-in-class execution with world-class talent. |
| **13) CTA button text** | How We Help | Schedule a Free Discovery Call |
| **14) Secondary CTA** | Our Companies | Explore Our Solutions |
| **15) Contact section headline** | Ready to move? | Let’s connect and explore possibilities. |
| **16) Contact body copy** | Tell us what you are building and what is stuck. We will point you to the right brand. | We would love to learn about your needs and craft a custom solution. |
| **17) Pricing or positioning disclaimer** | Not a fit if you want endless revisions or unclear ownership. | We strive to accommodate every client’s unique preferences. |
| **18) “Approach” language** | Structure, ownership, and measurable progress. | A data-driven, customer-centric, human-first approach. |
| **19) Footer tagline** | Operating focused service brands. | Building and scaling digital ventures with long-term vision. |
| **20) Brand differentiation line** | Different customers, different workflows, same standards. | A unified ecosystem of complementary offerings. |

---

## Agent Guardrails

**Enforce these rules automatically in all code and copy generation:**
- **No em dashes.** Ever.
- **No buzzwords:** leverage, synergy, innovative, world-class, transform, disrupt.
- **No motivational language.** No “vision” talk unless it is concrete.
- **Prefer short sentences.** One idea per sentence.
- **Lead with outcomes.** Add features only after the outcome is clear.
- **Use contrast phrases sparingly but deliberately:** “not just” is a good one.
- **Be inclusive.** Avoid “founders” as the default audience label.

---


## Design System

> The Xyren design system is clean, professional, and conversion-focused. Every component uses Inter font, the `#408be9` Xyren Blue accent, rounded-[14px] cards with subtle borders and shadows, and alternating white/gray section backgrounds. Every new page and component **must** follow these patterns.

### Color Palette

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--background` | `#ffffff` | `#0a0a0a` | Page backgrounds |
| `--foreground` | `#0a0a0a` | `#f9fafb` | Primary text, headings |
| `--primary` | `#408be9` (Xyren Blue) | `#5a9eef` | Buttons, links, icons, accents |
| `--primary-foreground` | `#ffffff` | `#0a0a0a` | Text on primary buttons/icons |
| `--secondary` | `#f9fafb` | `#141414` | Alternating section backgrounds |
| `--muted-foreground` | `#4a5565` | `#9ca3af` | Body/description text |
| `--border` | `#e5e7eb` | `rgba(255,255,255,0.1)` | Card borders, dividers |
| `--destructive` | `#ef4444` | `#ef4444` | Error states |
| `--card` | `#ffffff` | `#141414` | Card backgrounds |
| `--accent` | `#f9fafb` | `#1e1e1e` | Hover/active states |

#### Additional Text Colors (from Figma)

| Color | Hex | Usage |
|---|---|---|
| **Heading text** | `#0a0a0a` | H1, H2, H3, card titles |
| **Body text** | `#4a5565` | Descriptions, subtitles, paragraphs |
| **Card description** | `#717182` | Card/plan descriptions (slightly muted) |
| **Feature list text** | `#364153` | Pricing feature checkmarks |
| **Footer text muted** | `#6a7282` | "by Herzen Co.", copyright |
| **Footer link text** | `#99a1af` | Footer navigation links |
| **Footer background** | `#101828` | Dark footer background |
| **Footer border** | `#1e2939` | Footer bottom separator |

### Typography

| Element | Size | Weight | Tracking | Leading |
|---|---|---|---|---|
| **Hero H1** | `text-5xl` → `text-[72px]` | `font-medium` | `tracking-[-0.025em]` | `leading-[1]` |
| **Section H2** | `text-4xl` → `text-5xl` | `font-medium` | `tracking-[-0.03em]` | default |
| **CTA H2** | `text-5xl` → `text-6xl` | `font-medium` | `tracking-[-0.025em]` | default |
| **Card H3** | `text-base` or `text-lg` | `font-medium` | default | default |
| **Body text** | `text-base` or `text-lg` | `font-normal` | default | `leading-relaxed` |
| **Secondary text** | `text-sm` | `font-normal` | default | `leading-relaxed` |
| **Nav links** | `text-base` | `font-normal` | default | default |
| **Pricing amount** | `text-4xl` | `font-normal` | default | default |

**Font:** Inter (loaded via `next/font/google` as `--font-geist-sans`) + Geist Mono

> **Key change from v2:** Switched from `font-semibold` to `font-medium` for all headings. The design is clean and confident, not heavy.

### Spacing

| Context | Value | Tailwind Class |
|---|---|---|
| **Section vertical padding** | 96–128px | `py-24 md:py-32` |
| **Hero vertical padding** | 128–160px | `py-32 md:py-40` |
| **Section heading to content** | 64px | `mb-16` |
| **Between cards in a grid** | 24–32px | `gap-6` or `gap-8` |
| **Content gap (text blocks)** | 20px | `mt-5` |
| **Container padding** | 24px | `px-6` |
| **Max content width** | 1200px equiv | `max-w-5xl mx-auto` |

### Border Radius

| Element | Tailwind Class |
|---|---|
| **Cards (pricing, tools, use cases)** | `rounded-[14px]` |
| **Icon containers (large)** | `rounded-[14px]` |
| **Icon containers (small)** | `rounded-[10px]` |
| **Buttons** | `rounded-lg` (8px) |
| **FAQ accordion items** | `rounded-[10px]` |
| **Inputs & dropdowns** | `rounded-xl` |
| **Dropdowns/popovers** | `rounded-xl` |
| **Base radius** | `0.875rem` (14px, set via `--radius`) |

### Component Patterns

#### Buttons
- **Primary CTA:** `rounded-lg bg-primary text-primary-foreground px-8 py-3 text-lg font-medium` — rectangular with rounded corners, Xyren Blue
- **Secondary CTA (outlined):** `border border-primary text-primary rounded-lg h-9 text-sm font-medium` — blue outline
- **Text link CTA:** `text-primary` + `<ArrowRight>` icon — "Learn More →" pattern
- **Navbar CTA:** `rounded-lg px-4 h-9 text-sm font-medium bg-primary` — compact

#### Cards
- All cards use `rounded-[14px] border border-border bg-card shadow-sm`
- On hover: `hover:shadow-md transition-all duration-300` (optional)
- Featured/popular card: `border-primary shadow-lg` (blue border, elevated shadow)
- No inverted (dark) cards — featured card is differentiated by border color only
- Card padding: `p-6`

#### Icon Containers
- **Large (value props):** `h-14 w-14 rounded-[14px] bg-primary` with white icon `h-7 w-7`
- **Medium (tool cards):** `h-12 w-12 rounded-[10px] bg-primary` with white icon `h-6 w-6`
- Icons are always white (`text-primary-foreground`) on blue background

#### Forms / Inputs
- Height: `h-11`
- Border: `border-border/60` (subtle)
- Background: `bg-secondary/50` with `focus:bg-background` transition
- Radius: `rounded-xl`
- Submit button: full-width `rounded-full h-12`

#### Navbar
- Height: 68px (`h-[68px]`)
- Background: `bg-background/80 backdrop-blur-xl` (glassmorphism)
- Border: `border-border/40` bottom border
- Logo: Text-based "**Xyren** by Herzen Co." (not image)
- Links: `text-base text-muted-foreground` — Industries, Packages, Resources
- CTA: `rounded-lg h-9 text-sm font-medium bg-primary` — "Get a free project plan"
- Dropdowns: `rounded-xl`, `backdrop-blur-xl`, slide-in animation

#### Footer
- Background: `bg-[#101828]` (always dark, NOT theme-dependent)
- Brand: "Xyren" in white, "by Herzen Co." in `#6a7282`
- Tagline: `#99a1af` text — "Productized web design for service professionals."
- Column headings: white `font-medium`
- Links: `#99a1af` with white hover
- Bottom bar: `border-[#1e2939]` separator, copyright in `#6a7282`, email link in primary blue
- **5 columns:** Brand, Services, Resources, Company, Legal

#### FAQ Accordion
- Card-style items: `rounded-[10px] border border-border bg-card shadow-sm px-6`
- Spaced with `space-y-4`
- Open state: `shadow-md` (elevated)
- Trigger: `font-medium text-sm`

#### Section Backgrounds (Alternating Pattern)
```
Hero         → bg-background (white)
How We Think → bg-secondary  (gray #f9fafb)
Portfolio    → bg-background (white)
Tools        → bg-secondary  (gray #f9fafb)
Pricing      → bg-background (white)
FAQ          → bg-secondary  (gray #f9fafb)
Contact/CTA  → bg-background (white)
Footer       → bg-[#101828]  (dark navy, always)
```

### Dark Mode Rules
- Background shifts from white to `#0a0a0a` (near-black, not pure black)
- Cards: `#141414`
- Text: `#f9fafb` (not pure white)
- Primary accent brightens: `#408be9` → `#5a9eef`
- Borders thin to `rgba(255,255,255,0.1)`
- Footer remains `bg-[#101828]` in both modes (always dark)
- Use `dark:text-muted-foreground` for hardcoded colors like `#717182` that need dark mode adaptation

---

## Homepage Sections (in order)

### 1. Hero
- H1: "Websites designed to turn visitors into clients."
- Subtitle: "Launch in 5–10 days with built-in lead capture, booking automation, and systems that work while you don't."
- CTA: "Get a free project plan" → `/#contact`
- No gradient text, no secondary CTA, no bullet points — clean and focused

### 2. How We Think (Value Props)
- 3 pillars on `bg-secondary`, centered, with blue icon boxes
- **Automation first** (Zap icon) — "Every site ships with tools to capture, qualify, and book leads automatically."
- **Conversion over decoration** (Target icon) — "Clean layouts designed to drive action, not distract visitors."
- **Built to run without babysitting** (Settings icon) — "No plugins to break. No updates to chase. Systems that just work."

### 3. Portfolio (Use Cases)
- H2: "Two service models. One outcome: more clients."
- 2 cards with title, description, "Learn More →" link
- **Home Services** → `/use-cases/home-services`
- **Professional Services** → `/use-cases/professional-services`

### 4. Tools
- H2: "Built-in tools that capture and convert"
- Subtitle: "Everything you need to turn traffic into booked appointments — no assembly required."
- 4 cards on `bg-secondary`: Scheduling (Calendar), AI Chat (MessageSquare), Lead CRM (Users), Analytics (BarChart3)

### 5. Pricing
- H2: "Simple pricing, powerful systems"
- Subtitle: "Choose the plan that matches your growth stage. All plans include $2,000 one-time setup."
- **Core** — $150/mo (5-page website, lead capture, basic scheduling, mobile responsive, monthly updates)
- **Active** — $300/mo ★ Featured (Everything in Core + AI chat, Lead CRM, email automation, analytics, priority support)
- **Optimized** — $450/mo (Everything in Active + multi-location, custom integrations, A/B testing, conversion optimization, dedicated account manager)
- Footer note: "$2,000 one-time setup applies to all plans. No long-term contracts. Cancel anytime."

### 6. FAQ
- H2: "Frequently asked questions"
- 5 card-style accordion items on `bg-secondary`:
  1. How long does it take to launch?
  2. What's included in the one-time setup fee?
  3. Can I switch plans later?
  4. Do you provide ongoing support?
  5. What if I need custom features?

### 7. Contact (CTA)
- H2: "Get your free project plan"
- Subtitle: "Takes about 60 seconds. No commitment required."
- CTA button: "Get a free project plan" → `mailto:hello@xyren.me`
- Simple, no form — just a bold CTA

### 8. Footer
- Dark navy background (`#101828`)
- 5 columns: Brand | Services | Resources | Company | Legal
- Bottom bar: "© 2026 Herzen Co. All rights reserved." | "hello@xyren.co"

---

## Tech Stack

| Technology | Role | Version |
|---|---|---|
| **Next.js** | Framework (App Router) | 16.1.6 |
| **React** | UI Library | 19.2.3 |
| **TypeScript** | Language | ^5 |
| **Tailwind CSS** | Styling | ^4 |
| **shadcn/ui** | Component Library | ^3.8.5 |
| **Radix UI** | Headless UI Primitives | ^1.4.3 |
| **Supabase** | Auth & Backend (PostgreSQL) | ^2.98.0 |
| **Zod** | Schema Validation | ^4.3.6 |
| **React Hook Form** | Form Management | ^7.71.2 |
| **Vercel Analytics** | Traffic Analytics | ^1.6.1 |
| **Lucide React** | Icon Library | ^0.577.0 |
| **next-themes** | Dark/Light Mode | ^0.4.6 |
| **tw-animate-css** | Tailwind Animations | ^1.4.0 |

**Font:** Inter (loaded via `next/font/google`)
**Package Manager:** npm
**Node Version:** >= 20.9.0 (use `nvm use 20`)

---

## Project Architecture

```
xyren.me-updated/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (Inter font, Navbar, Footer, ThemeProvider)
│   ├── page.tsx                # Homepage (Hero → HowWeThink → Portfolio → Tools → Pricing → FAQ → Contact)
│   ├── globals.css             # Design tokens (Xyren Blue #408be9, light & dark mode)
│   ├── favicon.ico
│   ├── robots.ts               # SEO robots.txt
│   ├── sitemap.ts              # SEO sitemap.xml
│   ├── auth/page.tsx           # Login / Sign Up (Supabase Auth)
│   ├── dashboard/page.tsx      # Admin dashboard (protected)
│   ├── resources/              # Blog, How-To, FAQ pages
│   ├── use-cases/              # Home Services, Professional Services
│   └── api/                    # Contact form & auth logout routes
├── components/
│   ├── layout/
│   │   ├── navbar.tsx          # 68px glassmorphism navbar, text logo, 3 nav links + CTA
│   │   ├── footer.tsx          # Dark (#101828) 5-column footer
│   │   ├── theme-provider.tsx  # next-themes wrapper
│   │   └── theme-toggle.tsx    # Dark/light toggle
│   ├── sections/
│   │   ├── hero.tsx            # Clean headline, single CTA
│   │   ├── how-we-think.tsx    # 3 value props with blue icon boxes
│   │   ├── portfolio.tsx       # 2 use-case cards with Learn More links
│   │   ├── tools.tsx           # 4 tool cards (Scheduling, AI Chat, Lead CRM, Analytics)
│   │   ├── pricing.tsx         # 3 subscription tiers ($150/$300/$450 /mo)
│   │   ├── faq.tsx             # 5 card-style accordion items
│   │   └── contact.tsx         # Bold CTA section (no form)
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── config.ts               # Site configuration
│   ├── utils.ts                # cn() utility
│   └── supabase/               # client.ts, server.ts, middleware.ts
├── public/logos/                # Blue + Dark logo PNGs
└── skills.md                   # THIS FILE — design system & documentation
```

---

## Environment Variables

```env
NEXT_PUBLIC_SITE_URL=https://xyren.me
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=hello@xyren.me
```

---

## Running the Project

```bash
# Install dependencies
npm install

# Start development server (requires Node.js >= 20.9.0)
source ~/.nvm/nvm.sh && nvm use 20 && npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Changelog

### v3.0 — Figma Design Implementation (2026-03-05)
**Major redesign to match the Figma mockup.** This is the starting baseline — future changes will build on this.

#### Design Token Changes
- Primary color: `#2196F3` → `#408be9` (warmer, more distinctive blue)
- Foreground: `#1d1d1f` → `#0a0a0a` (darker headings)
- Secondary/muted bg: `#f5f5f7` → `#f9fafb` (slightly warmer gray)
- Muted foreground: `#86868b` → `#4a5565` (darker, more readable body text)
- Border: `#d2d2d7` → `#e5e7eb` (lighter borders)
- Dark mode background: `#000000` → `#0a0a0a` (near-black instead of pure black)
- Dark mode cards: `#1c1c1e` → `#141414`
- Dark mode primary: `#42a5f5` → `#5a9eef`
- Base radius: `1rem` → `0.875rem`

#### Font Change
- Switched from **DM Sans** to **Inter** (matching Figma spec)

#### Navbar Changes
- Height: 48px → 68px
- Logo: Image-based → Text-based ("Xyren by Herzen Co.")
- Nav links: Home, Use Cases dropdown, Resources dropdown, Pricing, Contact → Industries, Packages, Resources dropdown
- Link style: `text-xs tracking-wide` → `text-base` normal weight
- CTA: "Get a Free Quote" (pill) → "Get a free project plan" (rounded-lg)

#### Hero Changes
- Headline: "Your website should book clients while you sleep" (gradient text) → "Websites designed to turn visitors into clients." (clean, no gradient)
- Body: Simplified to single subtitle
- CTAs: Two buttons + bullet points → Single CTA button
- Padding: `py-32 md:py-44` → `py-32 md:py-40`

#### How We Think (Value Props)
- 4 pillars → 3 pillars (removed "Fast by Default" and "SEO From Day One", added "Automation first" and "Built to run without babysitting")
- Layout: Left-aligned grid → Center-aligned with blue icon boxes
- Icon containers: `bg-primary/10` (tinted) → `bg-primary` (solid blue) with white icons

#### Portfolio → Use Cases
- 3 project case study cards → 2 use-case cards (Home Services, Professional Services)
- Removed: project images, tags, result metrics
- Added: "Learn More →" links to use-case pages
- Card style: `rounded-3xl bg-secondary` → `rounded-[14px] border border-border shadow-sm`

#### Tools
- Tech stack list (Next.js, Tailwind, etc.) → Feature tool cards (Scheduling, AI Chat, Lead CRM, Analytics)
- New card style with solid blue icon containers

#### Pricing
- **Model changed:** One-time pricing → Subscription pricing
- Starter $1,500 / Growth $2,800 / Authority $5,000 → Core $150/mo / Active $300/mo / Optimized $450/mo
- Added: $2,000 one-time setup fee mentioned
- Featured card: Inverted dark card → Blue border + elevated shadow
- Buttons: `rounded-full` pill → `rounded-lg` outlined/filled

#### FAQ
- 6 questions → 5 questions (updated to match new pricing/service model)
- Styling: Simple border-bottom accordion → Card-style accordion items with `rounded-[10px]` borders and shadows
- Removed subtitle text under heading

#### Contact
- Full contact form (name, email, phone, business, service, message) → Simple CTA section
- Now just: headline + subtitle + single button linking to email

#### Footer
- Background: `bg-secondary` (theme-aware gray) → `bg-[#101828]` (always dark navy)
- Logo: Image-based → Text-based ("Xyren" + "by Herzen Co.")
- Columns: 3 (Services, Resources, Company) → 5 (Brand, Services, Resources, Company, Legal)
- Email: hello@xyren.me → hello@xyren.co
- Bottom bar: Simplified (copyright + email link)

### v2.0 — Apple-Inspired Redesign (2026-03-04)
- Apple-inspired palette with Xyren Blue `#2196F3`
- Glassmorphism navbar, gradient hero, rounded-3xl cards
- Dark mode with pure black background
- Logo images in navbar and footer

### v1.0 — Initial Build
- Next.js 16 project setup
- Homepage with 7 sections
- Supabase auth, dashboard, resources, use cases
- SEO, dark mode, Vercel Analytics
