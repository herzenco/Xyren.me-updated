# Xyren.me Redesign & Lead Management System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to execute this plan task-by-task with agent team (PM, Designer, Frontend Dev, Backend Dev).

**Goal:** Launch a redesigned Xyren.me with innovative aesthetic, functional lead capture/management dashboard, AI lead scoring, and comprehensive analytics tracking.

**Architecture:** Single Next.js 16 app with marketing site (SSR, SEO-crawlable) and private authenticated dashboard. Supabase for auth/database, Edge Functions for AI scoring, custom tracking layer for analytics.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Auth + PostgreSQL + Edge Functions), Vercel Analytics, Lucide icons.

---

## Phase 0: Project Setup & Infrastructure

### Task 1: Create worktree for isolated development

**Files:**
- Create: `.claude/worktrees/*` (auto-managed)

**Steps:**
1. Use EnterWorktree to create isolated development worktree
2. Verify you're in new worktree: `git status` should show DEVELOPMENT branch
3. All subsequent work happens in this worktree

**Why:** Isolated development space, easy rollback if needed.

---

## Phase 1: Design System & Visual Foundation (Designer Lead)

### Task 2: Research latest minimalist/innovative design trends

**Files:**
- Create: `docs/design/research.md` (design notes)

**Steps:**
1. Research current design trends: Apple's approach, modern SaaS sites (Notion, Linear, Vercel), minimalist principles
2. Document findings: color strategies, typography choices, spacing/whitespace approaches, animation trends
3. Save 3-5 reference sites/screenshots in research.md
4. Identify 2-3 color palette options (neutral base + accent colors)

**Expected outcome:** Design direction documented, color palettes ready.

---

### Task 3: Create design system tokens (colors, typography, spacing)

**Files:**
- Create: `app/globals.css` (design tokens as CSS variables)
- Create: `lib/design-system.ts` (TypeScript design constants)

**Steps:**
1. Define CSS variables in `app/globals.css`:
   ```css
   :root {
     /* Colors */
     --color-background: #ffffff;
     --color-foreground: #000000;
     --color-muted: #f5f5f5;
     --color-accent: #0066ff; /* or chosen accent color */
     --color-accent-light: #e6f0ff;

     /* Typography */
     --font-sans: system-ui, -apple-system, sans-serif;
     --font-mono: 'Monaco', monospace;

     /* Spacing */
     --space-xs: 0.25rem;
     --space-sm: 0.5rem;
     --space-md: 1rem;
     --space-lg: 1.5rem;
     --space-xl: 2rem;
     --space-2xl: 3rem;
   }
   ```

2. Create `lib/design-system.ts` with constants:
   ```typescript
   export const designSystem = {
     colors: {
       background: 'var(--color-background)',
       foreground: 'var(--color-foreground)',
       accent: 'var(--color-accent)',
     },
     spacing: {
       xs: 'var(--space-xs)',
       sm: 'var(--space-sm)',
       // ... etc
     },
   };
   ```

3. Verify Tailwind config includes CSS variables

**Expected outcome:** Design tokens defined and usable throughout the app.

---

### Task 4: Create component library (buttons, cards, forms)

**Files:**
- Modify: `components/ui/button.tsx` (update styling to match design system)
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/textarea.tsx`
- Create: `components/ui/form-field.tsx` (wrapper component)

**Steps:**
1. Review existing shadcn/ui components in `components/ui/`
2. Update button.tsx to use design system colors/spacing:
   ```typescript
   // components/ui/button.tsx
   const buttonVariants = cva(
     "inline-flex items-center justify-center rounded-md font-medium transition-colors",
     {
       variants: {
         variant: {
           default: "bg-accent text-white hover:bg-accent-dark",
           outline: "border border-foreground text-foreground hover:bg-muted",
           ghost: "hover:bg-muted text-foreground",
         },
         size: {
           sm: "px-3 py-1.5 text-sm",
           md: "px-4 py-2 text-base",
           lg: "px-6 py-3 text-lg",
         },
       },
     }
   );
   ```

3. Update card.tsx for generous whitespace:
   ```typescript
   // components/ui/card.tsx
   export const Card = React.forwardRef<HTMLDivElement, ...>((props, ref) => (
     <div ref={ref} className="rounded-lg border border-muted bg-white p-6 shadow-sm" {...props} />
   ));
   ```

4. Create form-field wrapper for consistent form inputs
5. Run dev server: `npm run dev`
6. Verify components render with new design system

**Expected outcome:** Component library updated and consistent.

---

## Phase 2: Marketing Site - Pages (Frontend Lead, Designer review)

### Task 5: Build Hero Section with innovative layout

**Files:**
- Modify: `app/page.tsx` (update homepage structure)
- Create: `components/sections/hero.tsx` (new hero component)
- Modify: `app/globals.css` (add hero-specific styles if needed)

**Steps:**
1. Create new `components/sections/hero.tsx`:
   ```typescript
   // components/sections/hero.tsx
   export function HeroSection() {
     return (
       <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
         <div className="max-w-3xl text-center space-y-6">
           <h1 className="text-5xl md:text-6xl font-bold leading-tight">
             Compete with bigger companies.
           </h1>
           <p className="text-xl text-muted-foreground">
             Xyren builds websites for small businesses with powerful tools at accessible prices.
           </p>
           <div className="flex gap-4 justify-center pt-8">
             <Button size="lg">Get Started</Button>
             <Button variant="outline" size="lg">Learn More</Button>
           </div>
         </div>
       </section>
     );
   }
   ```

2. Update `app/page.tsx` to import and use HeroSection
3. Verify on localhost:3000 - hero should be clean, spacious, bold typography
4. Add subtle animation on scroll (fade-in) using CSS or Framer Motion

**Expected outcome:** Hero section looks innovative and communicates core value.

---

### Task 6: Build HowWeThink section (values/approach)

**Files:**
- Modify: `components/sections/how-we-think.tsx`

**Steps:**
1. Update component to show 3-4 core values/principles:
   ```typescript
   // components/sections/how-we-think.tsx
   const values = [
     {
       icon: 'Zap',
       title: 'Powerful Tools',
       description: 'Enterprise-grade features at SMB prices.'
     },
     {
       icon: 'BarChart3',
       title: 'Data-Driven',
       description: 'Built-in lead tracking and AI scoring.'
     },
     // ... more
   ];

   export function HowWeThinkSection() {
     return (
       <section className="py-20 px-4 bg-muted">
         <div className="max-w-5xl mx-auto">
           <h2 className="text-4xl font-bold mb-12 text-center">How We Think</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {values.map(v => (
               <Card key={v.title}>
                 <Icon name={v.icon} />
                 <h3 className="text-xl font-semibold">{v.title}</h3>
                 <p className="text-muted-foreground">{v.description}</p>
               </Card>
             ))}
           </div>
         </div>
       </section>
     );
   }
   ```

2. Test on localhost - should show clean grid with icons
3. Ensure generous spacing between elements

**Expected outcome:** Values section communicates approach clearly.

---

### Task 7: Build Portfolio/Case Studies section (anonymized)

**Files:**
- Modify: `components/sections/portfolio.tsx`

**Steps:**
1. Create case study cards showing anonymized metrics:
   ```typescript
   const caseStudies = [
     {
       industry: 'Home Services',
       leads: 340,
       qualified: '87%',
       growth: '+230%',
     },
     // ... more
   ];

   export function PortfolioSection() {
     return (
       <section className="py-20 px-4">
         <h2 className="text-4xl font-bold mb-12 text-center">Results</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {caseStudies.map(cs => (
             <Card key={cs.industry}>
               <h3 className="font-semibold">{cs.industry}</h3>
               <div className="mt-4 space-y-2">
                 <p><strong>{cs.leads}</strong> leads captured</p>
                 <p><strong>{cs.qualified}</strong> qualified</p>
                 <p className="text-accent font-bold">{cs.growth} growth</p>
               </div>
             </Card>
           ))}
         </div>
       </section>
     );
   }
   ```

2. Test rendering - metrics should be clear and impressive
3. Ensure no actual customer data is exposed

**Expected outcome:** Case studies build trust through anonymized social proof.

---

### Task 8: Build Tools/Features section (showcase lead tracking power)

**Files:**
- Modify: `components/sections/tools.tsx`

**Steps:**
1. Showcase 4-5 key features with descriptions and icons:
   ```typescript
   const features = [
     {
       icon: 'Target',
       title: 'AI Lead Scoring',
       description: 'Automatically qualify leads based on fit and intent.',
     },
     {
       icon: 'BarChart3',
       title: 'Conversion Analytics',
       description: 'Track funnel, sources, and lead quality metrics.',
     },
     {
       icon: 'Zap',
       title: 'Real-Time Tracking',
       description: 'Monitor visitor behavior and engagement in real-time.',
     },
     {
       icon: 'Shield',
       title: 'Lead Management',
       description: 'Organize, tag, and prioritize your leads.',
     },
   ];

   export function ToolsSection() {
     return (
       <section className="py-20 px-4 bg-muted">
         <h2 className="text-4xl font-bold mb-12 text-center">Powerful Features</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {features.map(f => (
             <div key={f.title} className="flex gap-4">
               <Icon name={f.icon} className="text-accent text-2xl flex-shrink-0" />
               <div>
                 <h3 className="font-semibold text-lg">{f.title}</h3>
                 <p className="text-muted-foreground">{f.description}</p>
               </div>
             </div>
           ))}
         </div>
       </section>
     );
   }
   ```

2. Test - features should be visually clear and benefit-focused
3. Ensure lead tracking/scoring features are prominent

**Expected outcome:** Features section communicates sophisticated capabilities.

---

### Task 9: Build Pricing section

**Files:**
- Modify: `components/sections/pricing.tsx`

**Steps:**
1. Create 3-tier pricing (Starter, Pro, Enterprise):
   ```typescript
   const tiers = [
     {
       name: 'Starter',
       price: '$99',
       period: '/month',
       features: ['Up to 100 leads/month', 'Basic analytics', 'Email support'],
       cta: 'Get Started',
     },
     {
       name: 'Pro',
       price: '$299',
       period: '/month',
       features: ['Up to 1000 leads/month', 'Advanced analytics', 'AI lead scoring', 'Priority support'],
       cta: 'Get Started',
       highlight: true, // Featured tier
     },
     // ... etc
   ];
   ```

2. Design as cards with clear differentiation
3. Highlight recommended tier
4. Test responsiveness on mobile

**Expected outcome:** Pricing is clear and actionable.

---

### Task 10: Build FAQ section

**Files:**
- Modify: `components/sections/faq.tsx`

**Steps:**
1. Create FAQ accordion with 6-8 common questions:
   ```typescript
   const faqs = [
     {
       question: 'How does AI lead scoring work?',
       answer: 'Our system evaluates lead fit and intent automatically...',
     },
     // ... more
   ];

   export function FAQSection() {
     return (
       <section className="py-20 px-4">
         <h2 className="text-4xl font-bold mb-12 text-center">FAQ</h2>
         <div className="max-w-2xl mx-auto space-y-4">
           {faqs.map(faq => (
             <Accordion key={faq.question} {...faq} />
           ))}
         </div>
       </section>
     );
   }
   ```

2. Use shadcn/ui Accordion component or custom
3. Test accordion open/close functionality

**Expected outcome:** FAQ answers common objections.

---

### Task 11: Build Contact section (lead capture form)

**Files:**
- Modify: `components/sections/contact.tsx`
- Create: `app/contact/page.tsx` (dedicated contact page)
- Create: `lib/schemas/contact.ts` (form validation)

**Steps:**
1. Create form validation schema in `lib/schemas/contact.ts`:
   ```typescript
   import { z } from 'zod';

   export const contactFormSchema = z.object({
     name: z.string().min(2, 'Name must be at least 2 characters'),
     email: z.string().email('Invalid email'),
     phone: z.string().regex(/^\d{10,}/, 'Invalid phone'),
     businessType: z.string().min(1, 'Select a business type'),
     serviceNeeds: z.string().min(10, 'Describe your needs'),
     companySize: z.string().min(1, 'Select company size'),
   });
   ```

2. Create contact form component:
   ```typescript
   // components/sections/contact.tsx
   'use client';

   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { contactFormSchema } from '@/lib/schemas/contact';

   export function ContactSection() {
     const form = useForm({
       resolver: zodResolver(contactFormSchema),
     });

     const onSubmit = async (data) => {
       // Will be implemented in Task 20 (API integration)
       console.log(data);
     };

     return (
       <section className="py-20 px-4">
         <div className="max-w-2xl mx-auto">
           <h2 className="text-4xl font-bold mb-8 text-center">Get Started</h2>
           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormField label="Name" {...form.register('name')} />
             <FormField label="Email" {...form.register('email')} type="email" />
             <FormField label="Phone" {...form.register('phone')} />
             {/* More fields */}
             <Button type="submit">Submit</Button>
           </form>
         </div>
       </section>
     );
   }
   ```

3. Create dedicated contact page at `app/contact/page.tsx` that imports ContactSection
4. Test form validation (try submitting with empty fields, invalid email, etc.)
5. Verify errors display correctly

**Expected outcome:** Contact form captures all required fields with validation.

---

### Task 12: Build Use Cases pages

**Files:**
- Create: `app/use-cases/page.tsx` (index)
- Create: `app/use-cases/professional-services/page.tsx`
- Create: `app/use-cases/home-services/page.tsx`
- Create: `components/sections/use-case-hero.tsx`

**Steps:**
1. Create use case index page listing available use cases
2. Create professional-services page:
   ```typescript
   // app/use-cases/professional-services/page.tsx
   export default function ProfessionalServicesPage() {
     return (
       <>
         <section className="hero">
           <h1>Websites for Professional Services</h1>
           <p>Law, consulting, accounting, and more</p>
         </section>
         <section className="content">
           {/* Benefits specific to this industry */}
           {/* Case studies */}
           {/* CTA */}
         </section>
       </>
     );
   }
   ```

3. Create home-services page similarly
4. Test routing: `/use-cases`, `/use-cases/professional-services`, `/use-cases/home-services`

**Expected outcome:** Use case pages drive targeted conversions.

---

### Task 13: Build Resources hub

**Files:**
- Create: `app/resources/page.tsx` (hub landing)
- Create: `app/resources/blog/page.tsx` (blog listing)
- Create: `app/resources/how-to/page.tsx` (how-to listing)
- Create: `app/resources/faq/page.tsx` (resource-specific FAQ)

**Steps:**
1. Create resources hub landing showing blog, guides, FAQ as cards
2. Create placeholder blog listing page (will be populated with real content later)
3. Create placeholder how-to listing page
4. Create resource-specific FAQ page
5. Test navigation between pages

**Expected outcome:** Resources section is navigable and organized.

---

### Task 14: Add SEO meta tags to all marketing pages

**Files:**
- Modify: `app/layout.tsx` (global metadata)
- Modify: `app/page.tsx` (homepage metadata)
- Modify: `components/sections/` (add metadata helpers)
- Create: `lib/seo.ts` (SEO helpers)

**Steps:**
1. Create SEO helpers in `lib/seo.ts`:
   ```typescript
   export const seoMetadata = {
     home: {
       title: 'Xyren | Websites for Small Businesses',
       description: 'Build websites with powerful lead tracking, AI scoring, and analytics. Perfect for service businesses.',
       image: '/og-image.png',
     },
     contact: {
       title: 'Contact Xyren | Get Started Today',
       description: 'Ready to build your website? Contact us for a consultation.',
     },
     // ... more
   };
   ```

2. Update `app/layout.tsx` with global OG tags:
   ```typescript
   export const metadata: Metadata = {
     title: 'Xyren | Websites for Small Businesses',
     openGraph: {
       type: 'website',
       url: 'https://xyren.me',
       title: seoMetadata.home.title,
       description: seoMetadata.home.description,
       images: [{ url: '/og-image.png' }],
     },
   };
   ```

3. Add metadata to individual pages
4. Test with OG preview tool

**Expected outcome:** All pages have proper SEO metadata.

---

### Task 15: Ensure full site is SSR and crawlable

**Files:**
- Modify: `next.config.js` (if needed)
- Create: `public/robots.txt`
- Create: `app/sitemap.ts`

**Steps:**
1. Verify all marketing pages use server-side rendering (no `'use client'` for page files)
2. Create `public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Disallow: /dashboard
   Disallow: /api/private

   Sitemap: https://xyren.me/sitemap.xml
   ```

3. Create `app/sitemap.ts`:
   ```typescript
   import { MetadataRoute } from 'next';

   export default function sitemap(): MetadataRoute.Sitemap {
     const baseUrl = 'https://xyren.me';
     const marketingPages = [
       '/',
       '/use-cases/professional-services',
       '/use-cases/home-services',
       '/resources',
       '/resources/blog',
       '/resources/how-to',
       '/resources/faq',
       '/contact',
     ];

     return marketingPages.map(page => ({
       url: `${baseUrl}${page}`,
       lastModified: new Date(),
       changeFrequency: 'weekly',
       priority: 0.8,
     }));
   }
   ```

4. Test: `npm run build` should complete without errors
5. Verify robots.txt is served correctly: `curl https://localhost:3000/robots.txt`
6. Verify sitemap: `curl https://localhost:3000/sitemap.xml`

**Expected outcome:** Site is fully crawlable by search engines.

---

## Phase 3: Database & Backend Setup (Backend Lead)

### Task 16: Create Supabase tables and schemas

**Files:**
- Create: `lib/supabase/migrations/001_initial_schema.sql` (optional, for documentation)

**Steps:**
1. Go to Supabase dashboard and create tables:

   **Table: users** (for dashboard access)
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(255) UNIQUE NOT NULL,
     role VARCHAR(50) DEFAULT 'user',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

   **Table: leads**
   ```sql
   CREATE TABLE leads (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(255) NOT NULL,
     name VARCHAR(255) NOT NULL,
     phone VARCHAR(20),
     business_type VARCHAR(100),
     service_needs TEXT,
     company_size VARCHAR(50),
     source_page VARCHAR(255),
     referrer VARCHAR(255),
     fit_score INT,
     intent_score INT,
     overall_score INT,
     status VARCHAR(50) DEFAULT 'new',
     tags JSONB DEFAULT '[]'::jsonb,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

   **Table: lead_events**
   ```sql
   CREATE TABLE lead_events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
     event_type VARCHAR(100),
     page_path VARCHAR(255),
     referrer VARCHAR(255),
     device_type VARCHAR(50),
     location VARCHAR(100),
     scroll_depth INT,
     time_on_page INT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

   **Table: contact_submissions** (initial capture before scoring)
   ```sql
   CREATE TABLE contact_submissions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(255),
     name VARCHAR(255),
     phone VARCHAR(20),
     business_type VARCHAR(100),
     service_needs TEXT,
     company_size VARCHAR(50),
     source_page VARCHAR(255),
     referrer VARCHAR(255),
     ip_address VARCHAR(50),
     user_agent TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. Set up RLS (Row Level Security) policies:
   - leads table: authenticated users can read, service role can insert/update
   - lead_events: service role can insert
   - contact_submissions: anyone can insert, service role can read

3. Create indexes for performance:
   ```sql
   CREATE INDEX idx_leads_status ON leads(status);
   CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
   CREATE INDEX idx_lead_events_lead_id ON lead_events(lead_id);
   CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
   ```

4. Test: Verify tables exist in Supabase dashboard

**Expected outcome:** Database schema is set up and ready.

---

### Task 17: Set up Supabase Edge Function for lead scoring

**Files:**
- Create: `supabase/functions/score-lead/index.ts`

**Steps:**
1. Create Edge Function:
   ```bash
   supabase functions new score-lead
   ```

2. Implement scoring logic in `supabase/functions/score-lead/index.ts`:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

   serve(async (req) => {
     const { email, name, businessType, serviceNeeds, companySize, referrer } = await req.json()

     // Fit Score: business type + service alignment
     let fitScore = 50; // baseline
     const suitableTypes = ['service', 'home', 'professional', 'contractor', 'agency'];
     if (suitableTypes.some(t => businessType.toLowerCase().includes(t))) {
       fitScore += 30;
     }
     if (serviceNeeds.length > 50) fitScore += 20;
     if (companySize && companySize !== 'enterprise') fitScore += 10;
     fitScore = Math.min(100, fitScore);

     // Intent Score: referrer + form effort
     let intentScore = 50;
     if (referrer && referrer.includes('google')) intentScore += 30;
     if (referrer && referrer.includes('direct')) intentScore += 20;
     if (serviceNeeds.length > 100) intentScore += 20;
     intentScore = Math.min(100, intentScore);

     const overallScore = Math.round((fitScore * 0.6 + intentScore * 0.4));

     return new Response(
       JSON.stringify({
         fitScore,
         intentScore,
         overallScore,
       }),
       { headers: { "Content-Type": "application/json" } },
     )
   })
   ```

3. Deploy function:
   ```bash
   supabase functions deploy score-lead
   ```

4. Test with curl:
   ```bash
   curl -X POST https://[YOUR-PROJECT].supabase.co/functions/v1/score-lead \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer [ANON_KEY]" \
     -d '{"email":"test@test.com","businessType":"service","serviceNeeds":"Need website"}'
   ```

**Expected outcome:** Edge Function deployed and scoring works.

---

### Task 18: Create API routes for lead submission

**Files:**
- Create: `app/api/contact/route.ts`
- Create: `app/api/leads/route.ts`

**Steps:**
1. Create contact submission endpoint in `app/api/contact/route.ts`:
   ```typescript
   import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
   import { cookies } from 'next/headers';
   import { contactFormSchema } from '@/lib/schemas/contact';

   export async function POST(req: Request) {
     const data = await req.json();

     // Validate
     const validation = contactFormSchema.safeParse(data);
     if (!validation.success) {
       return Response.json({ error: validation.error.issues }, { status: 400 });
     }

     const { name, email, phone, businessType, serviceNeeds, companySize } = validation.data;

     // Get request metadata
     const headersList = await headers();
     const referrer = headersList.get('referer') || '';
     const userAgent = headersList.get('user-agent') || '';
     const ip = headersList.get('x-forwarded-for') || '';

     // Create supabase client
     const supabase = createServerComponentClient({ cookies });

     // Store contact submission
     const { data: submission } = await supabase
       .from('contact_submissions')
       .insert({
         name, email, phone, businessType, serviceNeeds, companySize,
         referrer, user_agent: userAgent, ip_address: ip,
         source_page: referrer.split('?')[0],
       })
       .select()
       .single();

     // Call scoring function
     const scoringResponse = await fetch(
       `${process.env.SUPABASE_URL}/functions/v1/score-lead`,
       {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           email, businessType, serviceNeeds, referrer,
         }),
       }
     );

     const scores = await scoringResponse.json();

     // Create lead with scores
     const { data: lead } = await supabase
       .from('leads')
       .insert({
         name, email, phone, businessType, serviceNeeds, companySize,
         source_page: referrer.split('?')[0],
         referrer,
         fit_score: scores.fitScore,
         intent_score: scores.intentScore,
         overall_score: scores.overallScore,
       })
       .select()
       .single();

     // Track event
     await supabase.from('lead_events').insert({
       lead_id: lead.id,
       event_type: 'form_submitted',
       page_path: referrer.split('?')[0],
       referrer,
     });

     return Response.json({ success: true, lead }, { status: 201 });
   }
   ```

2. Create leads listing endpoint in `app/api/leads/route.ts`:
   ```typescript
   import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
   import { cookies } from 'next/headers';

   export async function GET(req: Request) {
     const supabase = createServerComponentClient({ cookies });

     // Verify authentication
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) {
       return Response.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const { searchParams } = new URL(req.url);
     const status = searchParams.get('status');
     const minScore = searchParams.get('minScore');

     let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

     if (status) query = query.eq('status', status);
     if (minScore) query = query.gte('overall_score', minScore);

     const { data: leads } = await query;
     return Response.json(leads);
   }
   ```

3. Test endpoints:
   ```bash
   # Submit contact form
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"John","email":"john@test.com",...}'

   # List leads (requires auth)
   curl http://localhost:3000/api/leads \
     -H "Authorization: Bearer [AUTH_TOKEN]"
   ```

**Expected outcome:** API endpoints work, leads are captured and scored.

---

### Task 19: Create analytics queries helper

**Files:**
- Create: `lib/supabase/analytics.ts`

**Steps:**
1. Create analytics queries:
   ```typescript
   import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
   import { cookies } from 'next/headers';

   export async function getConversionFunnel() {
     const supabase = createServerComponentClient({ cookies });

     const { data } = await supabase
       .from('lead_events')
       .select('event_type', { count: 'exact' })
       .in('event_type', ['page_view', 'form_start', 'form_submit']);

     const stats = {
       visitors: 0,
       formStarts: 0,
       formSubmits: 0,
     };

     // Process data to calculate funnel
     return stats;
   }

   export async function getLeadsBySource() {
     const supabase = createServerComponentClient({ cookies });

     const { data } = await supabase
       .from('leads')
       .select('referrer, overall_score');

     // Group by referrer source
     const sources = {};
     // Process data
     return sources;
   }

   export async function getLeadQualityStats() {
     const supabase = createServerComponentClient({ cookies });

     const { data } = await supabase
       .from('leads')
       .select('overall_score');

     const avgScore = data?.reduce((sum, l) => sum + l.overall_score, 0) / data?.length || 0;
     const highQuality = data?.filter(l => l.overall_score >= 70).length || 0;

     return { avgScore, highQuality };
   }
   ```

2. Test queries by calling from dashboard (Task 23)

**Expected outcome:** Analytics queries are ready for dashboard.

---

## Phase 4: Dashboard UI (Frontend Lead, Backend review)

### Task 20: Create dashboard layout and navigation

**Files:**
- Create: `app/dashboard/layout.tsx`
- Create: `components/layout/dashboard-nav.tsx`
- Create: `components/layout/dashboard-sidebar.tsx`

**Steps:**
1. Create dashboard layout:
   ```typescript
   // app/dashboard/layout.tsx
   'use client';

   import { DashboardNav } from '@/components/layout/dashboard-nav';
   import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';

   export default function DashboardLayout({ children }) {
     return (
       <div className="flex min-h-screen">
         <DashboardSidebar />
         <div className="flex-1">
           <DashboardNav />
           <main className="p-6">{children}</main>
         </div>
       </div>
     );
   }
   ```

2. Create sidebar navigation:
   ```typescript
   // components/layout/dashboard-sidebar.tsx
   const navItems = [
     { label: 'Overview', href: '/dashboard', icon: 'BarChart3' },
     { label: 'Leads', href: '/dashboard/leads', icon: 'Users' },
     { label: 'Analytics', href: '/dashboard/analytics', icon: 'TrendingUp' },
     { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
   ];

   export function DashboardSidebar() {
     return (
       <aside className="w-64 border-r bg-muted p-6">
         <h2 className="font-bold mb-8">Xyren Dashboard</h2>
         <nav className="space-y-2">
           {navItems.map(item => (
             <Link key={item.href} href={item.href} className="block p-2 rounded hover:bg-white">
               {item.label}
             </Link>
           ))}
         </nav>
       </aside>
     );
   }
   ```

3. Test: `npm run dev` → `localhost:3000/dashboard` should show layout

**Expected outcome:** Dashboard layout is responsive and navigable.

---

### Task 21: Build dashboard overview page

**Files:**
- Create: `app/dashboard/page.tsx`

**Steps:**
1. Create overview dashboard:
   ```typescript
   // app/dashboard/page.tsx
   'use client';

   import { useEffect, useState } from 'react';
   import { Card } from '@/components/ui/card';
   import { getConversionFunnel, getLeadQualityStats } from '@/lib/supabase/analytics';

   export default function DashboardPage() {
     const [stats, setStats] = useState(null);

     useEffect(() => {
       async function load() {
         const funnel = await getConversionFunnel();
         const quality = await getLeadQualityStats();
         setStats({ ...funnel, ...quality });
       }
       load();
     }, []);

     return (
       <div className="space-y-8">
         <h1 className="text-3xl font-bold">Dashboard Overview</h1>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card>
             <p className="text-muted-foreground">Total Leads (MTD)</p>
             <p className="text-4xl font-bold">{stats?.totalLeads || 0}</p>
           </Card>
           <Card>
             <p className="text-muted-foreground">Average Score</p>
             <p className="text-4xl font-bold">{stats?.avgScore?.toFixed(0) || 0}</p>
           </Card>
           <Card>
             <p className="text-muted-foreground">High Quality</p>
             <p className="text-4xl font-bold">{stats?.highQuality || 0}</p>
           </Card>
         </div>

         {/* Recent leads table, charts, etc. */}
       </div>
     );
   }
   ```

2. Test: Dashboard shows key metrics

**Expected outcome:** Dashboard overview displays key stats.

---

### Task 22: Build leads list page with filtering

**Files:**
- Create: `app/dashboard/leads/page.tsx`
- Create: `components/leads/leads-table.tsx`
- Create: `components/leads/leads-filters.tsx`

**Steps:**
1. Create leads page:
   ```typescript
   // app/dashboard/leads/page.tsx
   'use client';

   import { useState, useEffect } from 'react';
   import { LeadsTable } from '@/components/leads/leads-table';
   import { LeadsFilters } from '@/components/leads/leads-filters';

   export default function LeadsPage() {
     const [leads, setLeads] = useState([]);
     const [filters, setFilters] = useState({ status: '', minScore: '' });

     useEffect(() => {
       async function loadLeads() {
         const params = new URLSearchParams();
         if (filters.status) params.append('status', filters.status);
         if (filters.minScore) params.append('minScore', filters.minScore);

         const res = await fetch(`/api/leads?${params}`);
         const data = await res.json();
         setLeads(data);
       }
       loadLeads();
     }, [filters]);

     return (
       <div className="space-y-6">
         <h1 className="text-3xl font-bold">Leads</h1>
         <LeadsFilters onFilterChange={setFilters} />
         <LeadsTable leads={leads} />
       </div>
     );
   }
   ```

2. Create leads table component to display filtered leads
3. Create filters component for status, score range
4. Test: Filter by status, score, etc.

**Expected outcome:** Leads can be viewed, filtered, and sorted.

---

### Task 23: Build lead detail page

**Files:**
- Create: `app/dashboard/leads/[id]/page.tsx`
- Create: `components/leads/lead-detail.tsx`
- Create: `components/leads/lead-timeline.tsx`

**Steps:**
1. Create lead detail page:
   ```typescript
   // app/dashboard/leads/[id]/page.tsx
   'use client';

   import { useEffect, useState } from 'react';
   import { useParams } from 'next/navigation';
   import { LeadDetail } from '@/components/leads/lead-detail';

   export default function LeadPage() {
     const params = useParams();
     const [lead, setLead] = useState(null);

     useEffect(() => {
       async function load() {
         const res = await fetch(`/api/leads/${params.id}`);
         const data = await res.json();
         setLead(data);
       }
       load();
     }, [params.id]);

     return lead ? <LeadDetail lead={lead} /> : <p>Loading...</p>;
   }
   ```

2. Create lead detail component showing:
   - All lead info (name, email, phone, business, scores)
   - Score breakdown (fit, intent, overall with explanations)
   - Engagement timeline (all events chronologically)
   - Status and tags
   - Action buttons (change status, add tags, notes)

3. Create lead timeline component showing visit path and events

4. Test: View lead details, see timeline

**Expected outcome:** Lead details are visible with full engagement history.

---

### Task 24: Build analytics page

**Files:**
- Create: `app/dashboard/analytics/page.tsx`
- Create: `components/analytics/funnel-chart.tsx`
- Create: `components/analytics/source-chart.tsx`
- Create: `components/analytics/quality-heatmap.tsx`

**Steps:**
1. Create analytics page:
   ```typescript
   // app/dashboard/analytics/page.tsx
   'use client';

   import { useState, useEffect } from 'react';
   import { FunnelChart } from '@/components/analytics/funnel-chart';
   import { SourceChart } from '@/components/analytics/source-chart';
   import { QualityHeatmap } from '@/components/analytics/quality-heatmap';

   export default function AnalyticsPage() {
     const [funnel, setFunnel] = useState(null);
     const [sources, setSources] = useState(null);
     const [quality, setQuality] = useState(null);

     useEffect(() => {
       async function load() {
         const funnelData = await fetch('/api/analytics/funnel').then(r => r.json());
         const sourcesData = await fetch('/api/analytics/sources').then(r => r.json());
         const qualityData = await fetch('/api/analytics/quality').then(r => r.json());

         setFunnel(funnelData);
         setSources(sourcesData);
         setQuality(qualityData);
       }
       load();
     }, []);

     return (
       <div className="space-y-8">
         <h1 className="text-3xl font-bold">Analytics</h1>
         <FunnelChart data={funnel} />
         <SourceChart data={sources} />
         <QualityHeatmap data={quality} />
       </div>
     );
   }
   ```

2. Create funnel chart component (show visitor → form → submit → qualified % progression)
3. Create source chart component (pie chart of lead sources)
4. Create quality heatmap component (table of source → avg score)
5. Use recharts or similar library for charts

6. Test: Charts display data correctly

**Expected outcome:** Analytics dashboard shows key metrics visually.

---

## Phase 5: Tracking & Events (Frontend + Backend)

### Task 25: Implement page view tracking

**Files:**
- Create: `lib/tracking/page-tracker.ts`
- Create: `lib/tracking/use-tracking.ts` (React hook)
- Modify: `app/layout.tsx` (add tracking hook)

**Steps:**
1. Create page tracking utility:
   ```typescript
   // lib/tracking/page-tracker.ts
   export async function trackPageView(data: {
     pagePath: string;
     referrer: string;
     deviceType: 'mobile' | 'desktop' | 'tablet';
     scrollDepth?: number;
     timeOnPage?: number;
   }) {
     return fetch('/api/tracking/page-view', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data),
     });
   }
   ```

2. Create tracking React hook:
   ```typescript
   // lib/tracking/use-tracking.ts
   'use client';

   import { useEffect, useState } from 'react';
   import { trackPageView } from './page-tracker';

   export function useTracking() {
     useEffect(() => {
       const handlePageLoad = async () => {
         const deviceType = getDeviceType();
         await trackPageView({
           pagePath: window.location.pathname,
           referrer: document.referrer,
           deviceType,
         });
       };

       handlePageLoad();
     }, []);
   }

   function getDeviceType() {
     if (window.innerWidth < 640) return 'mobile';
     if (window.innerWidth < 1024) return 'tablet';
     return 'desktop';
   }
   ```

3. Add tracking to root layout:
   ```typescript
   // app/layout.tsx
   'use client';

   import { useTracking } from '@/lib/tracking/use-tracking';

   export default function RootLayout({ children }) {
     useTracking();
     return (
       <html>
         <body>{children}</body>
       </html>
     );
   }
   ```

4. Create tracking API endpoint (Backend: Task 26)
5. Test: Check Supabase for lead_events records

**Expected outcome:** Page views are tracked automatically.

---

### Task 26: Create tracking API endpoint

**Files:**
- Create: `app/api/tracking/page-view/route.ts`

**Steps:**
1. Create tracking endpoint:
   ```typescript
   // app/api/tracking/page-view/route.ts
   import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
   import { cookies } from 'next/headers';

   export async function POST(req: Request) {
     const { pagePath, referrer, deviceType } = await req.json();

     const supabase = createServerComponentClient({ cookies });

     // Store event (no lead_id yet; can be linked after form submission)
     await supabase.from('lead_events').insert({
       event_type: 'page_view',
       page_path: pagePath,
       referrer,
       device_type: deviceType,
     });

     return Response.json({ success: true });
   }
   ```

2. Test: Submit page view event, verify in Supabase

**Expected outcome:** Page view events are recorded.

---

### Task 27: Track form interactions

**Files:**
- Modify: `components/sections/contact.tsx`
- Create: `lib/tracking/form-tracker.ts`

**Steps:**
1. Update contact form to track interactions:
   ```typescript
   // components/sections/contact.tsx
   'use client';

   import { useState } from 'react';
   import { trackFormEvent } from '@/lib/tracking/form-tracker';

   export function ContactSection() {
     const [isSubmitting, setIsSubmitting] = useState(false);

     const handleFocus = (fieldName) => {
       trackFormEvent('field_focus', fieldName);
     };

     const handleChange = (fieldName) => {
       trackFormEvent('field_change', fieldName);
     };

     const onSubmit = async (data) => {
       trackFormEvent('form_submit', 'contact_form');
       setIsSubmitting(true);

       const res = await fetch('/api/contact', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data),
       });

       // Show success message
     };

     return (
       <form onSubmit={onSubmit}>
         {/* Fields with onFocus={handleFocus}, onChange={handleChange} */}
       </form>
     );
   }
   ```

2. Create form tracking utility:
   ```typescript
   // lib/tracking/form-tracker.ts
   export async function trackFormEvent(eventType: string, fieldName: string) {
     return fetch('/api/tracking/form-event', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ eventType, fieldName }),
     });
   }
   ```

3. Create form event endpoint
4. Test: Fill out form, verify events logged

**Expected outcome:** Form interactions are tracked.

---

### Task 28: Collect scroll depth tracking

**Files:**
- Create: `lib/tracking/scroll-tracker.ts`
- Modify: `app/layout.tsx` (add scroll tracking)

**Steps:**
1. Create scroll tracking utility:
   ```typescript
   // lib/tracking/scroll-tracker.ts
   'use client';

   export function initScrollTracking() {
     let scrollTimeout: NodeJS.Timeout;

     window.addEventListener('scroll', () => {
       clearTimeout(scrollTimeout);
       scrollTimeout = setTimeout(async () => {
         const scrollDepth = Math.round(
           (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
         );

         await fetch('/api/tracking/scroll', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ scrollDepth, pagePath: window.location.pathname }),
         });
       }, 1000);
     });
   }
   ```

2. Call from layout on mount
3. Create API endpoint to store scroll depth
4. Test: Scroll on page, verify depth recorded

**Expected outcome:** Scroll depth is tracked.

---

## Phase 6: Auth & Security (Backend Lead)

### Task 29: Set up Supabase Auth for dashboard

**Files:**
- Modify: `lib/supabase/client.ts` (already set up)
- Modify: `lib/supabase/server.ts` (already set up)
- Create: `lib/supabase/middleware.ts` (auth middleware)
- Modify: `proxy.ts` (auth protection)

**Steps:**
1. Verify Supabase auth is configured in `.env.local`
2. Update `proxy.ts` to protect dashboard routes:
   ```typescript
   // proxy.ts
   import { updateSession } from '@/lib/supabase/middleware';

   export async function middleware(request: NextRequest) {
     const { pathname } = request.nextUrl;

     // Protect dashboard routes
     if (pathname.startsWith('/dashboard')) {
       const session = await updateSession(request);
       if (!session) {
         return NextResponse.redirect(new URL('/auth', request.url));
       }
     }

     return NextResponse.next();
   }

   export const config = {
     matcher: ['/((?!api|_next|.*\\..*).*)'],
   };
   ```

3. Create `app/auth/page.tsx` for login/signup (can use Supabase Auth UI or custom form)
4. Test: Try accessing /dashboard without auth → redirects to /auth

**Expected outcome:** Dashboard is protected, only authenticated users can access.

---

### Task 30: Verify RLS policies in Supabase

**Files:**
- N/A (database configuration)

**Steps:**
1. Go to Supabase dashboard → SQL Editor
2. Verify RLS policies:
   ```sql
   -- Leads: authenticated users can read, service role can insert
   ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Authenticated users can read leads" ON leads
     FOR SELECT
     USING (auth.role() = 'authenticated');

   CREATE POLICY "Service role can insert leads" ON leads
     FOR INSERT
     WITH CHECK (auth.role() = 'service_role');
   ```

3. Do similar for other tables
4. Test: Unauthenticated request to leads endpoint → 401

**Expected outcome:** Database is secure, only authorized access.

---

## Phase 7: Integration & Testing

### Task 31: End-to-end test: lead capture → scoring → dashboard

**Files:**
- Create: `tests/e2e/lead-flow.test.ts`

**Steps:**
1. Create E2E test:
   ```typescript
   // tests/e2e/lead-flow.test.ts
   describe('Lead capture flow', () => {
     it('should capture lead, score it, and display in dashboard', async () => {
       // 1. Visit homepage
       // 2. Fill contact form
       // 3. Submit
       // 4. Verify lead appears in Supabase
       // 5. Verify scores are calculated
       // 6. Login to dashboard
       // 7. Verify lead appears in leads list with score
     });
   });
   ```

2. Run: `npm run test:e2e`
3. Fix any issues found

**Expected outcome:** Full flow works end-to-end.

---

### Task 32: Test analytics queries

**Files:**
- Create: `tests/analytics.test.ts`

**Steps:**
1. Create tests for each analytics query:
   - Conversion funnel returns correct percentages
   - Lead sources are accurately attributed
   - Quality stats match expected calculations

2. Run: `npm run test`
3. Fix any issues

**Expected outcome:** Analytics are accurate.

---

### Task 33: Performance audit (Lighthouse)

**Files:**
- N/A

**Steps:**
1. Build site: `npm run build`
2. Start production server: `npm run start`
3. Run Lighthouse: `npm install -g lighthouse && lighthouse https://localhost:3000 --view`
4. Target scores:
   - Performance: 90+
   - SEO: 95+
   - Accessibility: 95+
5. Fix any issues (optimize images, add ARIA labels, etc.)

**Expected outcome:** Site passes performance and accessibility standards.

---

### Task 34: Test on mobile & tablet

**Files:**
- N/A

**Steps:**
1. Test responsive design on Chrome DevTools
2. Test on actual mobile device
3. Verify:
   - Contact form is usable on mobile
   - Dashboard is navigable on tablet
   - All buttons/links are tap-friendly (48px minimum)
4. Fix responsive issues

**Expected outcome:** Site is fully responsive.

---

## Phase 8: Launch & Cleanup

### Task 35: Set up monitoring and error tracking

**Files:**
- Create: `lib/monitoring.ts`
- Modify: `app/layout.tsx` (add error tracking)

**Steps:**
1. Add Vercel Analytics (already in package.json):
   ```typescript
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

2. Set up error logging (e.g., Sentry) if desired
3. Test: Errors should be tracked

**Expected outcome:** Site has monitoring in place.

---

### Task 36: Create sitemap and verify SEO

**Files:**
- Already created in Task 15
- Verify: `app/sitemap.ts`, `public/robots.txt`

**Steps:**
1. Test robots.txt: `curl https://xyren.me/robots.txt`
2. Test sitemap: `curl https://xyren.me/sitemap.xml`
3. Submit to Google Search Console
4. Check Lighthouse SEO score again
5. Verify all pages are indexed (use `site:xyren.me` in Google)

**Expected outcome:** Site is SEO-ready.

---

### Task 37: Deploy to production

**Files:**
- N/A (deployment configuration)

**Steps:**
1. Ensure all changes are committed:
   ```bash
   git add .
   git commit -m "feat: complete Xyren.me redesign"
   ```

2. Push to main branch (or create PR):
   ```bash
   git push origin DEVELOPMENT:main
   ```

3. Deploy to Vercel:
   - If using Vercel: automatic deployment from main branch
   - Otherwise: `npm run build && npm run start`

4. Test production site
5. Monitor logs for errors

**Expected outcome:** Site is live and accessible.

---

### Task 38: Set up automated backups

**Files:**
- N/A (Supabase configuration)

**Steps:**
1. Go to Supabase dashboard → Backups
2. Enable automated daily backups
3. Test restoration process

**Expected outcome:** Data is safely backed up.

---

### Task 39: Document admin processes

**Files:**
- Create: `docs/admin/leads-management.md`
- Create: `docs/admin/analytics-guide.md`

**Steps:**
1. Document how to:
   - Manage leads (filter, tag, change status)
   - Understand lead scores
   - Interpret analytics
   - Contact leads
   - Export data

2. Create quick-start guide for dashboard

**Expected outcome:** Admin processes are documented.

---

### Task 40: Final review & celebration

**Files:**
- N/A

**Steps:**
1. Review complete design doc (docs/plans/2026-03-05-xyren-me-redesign-design.md)
2. Verify all tasks completed
3. Test full flow again (homepage → contact form → dashboard → analytics)
4. Verify SEO, performance, mobile responsiveness
5. Celebrate launch! 🎉

**Expected outcome:** Xyren.me redesign is complete and live.

---

## Notes for Executor

- **Database**: All Supabase credentials must be in `.env.local`
- **Environment**: Node 20 required (`nvm use 20`)
- **Git commits**: Commit after each task for clear history
- **Testing**: Test each task before moving to next
- **Communication**: Agent team should sync daily on progress/blockers
- **Dependencies**: Keep bundled components (shadcn/ui) as dependencies, don't duplicate code
- **SEO**: Never compromise crawlability for design trends
- **Security**: RLS policies are critical; test thoroughly

---

## Success Criteria (MVP Complete)

✅ Marketing site redesigned with innovative aesthetic
✅ All pages are SEO-crawlable and mobile-responsive
✅ Lead capture form works, data flows to Supabase
✅ AI lead scoring calculates fit + intent scores accurately
✅ Dashboard displays leads with scores, filters work
✅ Analytics page shows conversion funnel, source attribution, quality by source
✅ Tracking captures page views, form interactions, scroll depth
✅ Dashboard is authenticated, only accessible to you
✅ No live customer data is exposed publicly
✅ Lighthouse scores: Performance 90+, SEO 95+, Accessibility 95+
✅ Site is fully responsive (mobile, tablet, desktop)
✅ All code is committed with clear commit history
✅ Site is deployed and live
✅ Admin processes are documented

---

## Future Phases (Post-MVP)

- Blog with real content and MDX support
- Email notifications (Resend integration)
- Lead export to CSV
- CRM integrations (Zapier, Make, etc.)
- Customizable lead scoring rules (dashboard editor)
- Automated workflows (auto-tag, auto-status, etc.)
- Slack notifications
- Advanced analytics (cohorts, retention curves, attribution)
- White-label product packaging for customers
- Marketing site → Separate white-label dashboard app

