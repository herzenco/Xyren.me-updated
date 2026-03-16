# Xyren.me Design System & Architecture Guide

> **Reference this guide on every build to maintain consistency and alignment.**

---

## 1. Logos & Brand Assets

### Primary Logos
- **Blue Logo:** `public/logos/xyren-logo-blue.png` (100x32 in navbar, 90x28 in footer)
- **Dark Logo:** `public/logos/xyren-logo-dark.png` (same sizes, for dark mode)

### Usage
- **Navbar/Footer:** Use both logos with dark mode toggles:
  ```tsx
  <Image
    src="/logos/xyren-logo-blue.png"
    alt="Xyren"
    width={100}
    height={32}
    className="block dark:hidden"
    priority
  />
  <Image
    src="/logos/xyren-logo-dark.png"
    alt="Xyren"
    width={100}
    height={32}
    className="hidden dark:block"
    priority
  />
  ```
- **Email/Print:** Use blue logo
- **Dark Backgrounds:** Use dark logo

---

## 2. Color System

### CSS Variables (in `app/globals.css`)

**Light Mode (:root)**
```css
--background: oklch(1 0 0);                    /* White */
--foreground: oklch(0.145 0 0);                /* Near-black */
--muted: oklch(0.97 0 0);                      /* Very light gray */
--muted-foreground: oklch(0.556 0 0);          /* Medium gray */
--border: oklch(0.922 0 0);                    /* Light border gray */
--accent: oklch(0.97 0 0);                     /* Accent (from theme) */
--destructive: oklch(0.577 0.245 27.325);      /* Red for errors */
```

**Dark Mode (.dark)**
```css
--background: oklch(0.145 0 0);                /* Very dark (almost black) */
--foreground: oklch(0.985 0 0);                /* Near-white */
--muted: oklch(0.269 0 0);                     /* Dark gray */
--muted-foreground: oklch(0.708 0 0);          /* Light gray on dark */
--border: oklch(1 0 0 / 10%);                  /* White with transparency */
--accent: oklch(0.269 0 0);                    /* Darker accent */
```

### Tailwind Class Mapping
- `bg-background` → page background
- `text-foreground` → primary text
- `text-muted-foreground` → secondary text
- `bg-muted` → light background sections
- `border-border` → all borders
- `bg-accent` → highlights, buttons (blue in design)
- `text-destructive` → error states

### Color Values (Actual HEX)
- **Blue Primary:** #0066ff (used in gradients and accents)
- **Purple Secondary:** #6366f1 (used in gradients)
- **Accent Purple:** #a855f7 (secondary accent)
- **Cyan Alt:** #06b6d4 (alternative gradient stops)

---

## 3. Gradient System

### CSS Variables (in `app/globals.css`)

```css
--gradient-primary: linear-gradient(135deg, #0066ff 0%, #6366f1 100%);
--gradient-primary-alt: linear-gradient(135deg, #0066ff 0%, #06b6d4 100%);
--gradient-accent: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
--gradient-subtle: linear-gradient(135deg, #0066ff15 0%, #6366f115 100%);
```

### TypeScript Reference (in `lib/design-system.ts`)
```typescript
gradients: {
  primary: 'var(--gradient-primary)',
  primaryAlt: 'var(--gradient-primary-alt)',
  accent: 'var(--gradient-accent)',
  subtle: 'var(--gradient-subtle)',
}
```

### Usage Examples
- **Button backgrounds:** `bg-gradient-to-r from-blue-600 to-purple-600`
- **Text highlights:** `bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`
- **Card borders:** `before:bg-gradient-to-b before:from-blue-600 before:to-purple-600`

---

## 4. Glow Animation

### CSS Definition (in `app/globals.css`)

```css
@keyframes subtle-glow {
  0%, 100% {
    text-shadow: 0 0 10px rgba(0, 102, 255, 0.3), 0 0 20px rgba(99, 102, 241, 0.2);
  }
  50% {
    text-shadow: 0 0 15px rgba(0, 102, 255, 0.4), 0 0 25px rgba(99, 102, 241, 0.3);
  }
}

.gradient-glow {
  animation: subtle-glow 4s ease-in-out infinite;
}
```

### Where It's Applied
Apply `.gradient-glow` class to key phrases with gradient text throughout marketing site:
- Hero: "bigger companies."
- How We Think: "differently."
- Tools: "built in."
- Pricing: "Simple pricing."
- FAQ: "answers."
- Contact: "get started?"

---

## 5. Typography

### Font Stack
**Primary Font:** Geist (from `next/font/google`)
- Already loaded in `app/layout.tsx`
- CSS variable: `--font-geist-sans`
- Fallback: system-ui, -apple-system, sans-serif

### Font Sizes
```typescript
sizes: {
  h1: '48px',           /* Hero titles (md/lg can go to 72px) */
  h2: '32px',           /* Section titles */
  h3: '24px',           /* Subsection titles */
  body: '16px',         /* Default body text */
  small: '14px',        /* Secondary text */
  tiny: '12px',         /* Captions, metadata */
}
```

### Font Weights
```typescript
weights: {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}
```
- **Headings:** font-bold (700)
- **Labels, badges:** font-semibold (600)
- **Body text:** font-normal (400)

### Line Heights
```typescript
lineHeights: {
  tight: 1.1,           /* Large headlines (h1) */
  heading: 1.2,         /* Subheadings (h2, h3) */
  normal: 1.5,          /* Default body */
  relaxed: 1.6,         /* Large body text */
}
```

### Tailwind Typography Classes
- `text-5xl md:text-6xl lg:text-7xl` → Hero h1
- `text-4xl` → Section h2
- `text-xl` → Body text (lg screens)
- `text-sm` → Secondary text

---

## 6. Spacing Tokens

### CSS Variables (in `app/globals.css`)
```css
--space-xs: 0.25rem;    /* 4px */
--space-sm: 0.5rem;     /* 8px */
--space-md: 1rem;       /* 16px */
--space-lg: 1.5rem;     /* 24px */
--space-xl: 2rem;       /* 32px */
--space-2xl: 3rem;      /* 48px */
--space-3xl: 4rem;      /* 64px */
--space-4xl: 5rem;      /* 80px */
--space-5xl: 6rem;      /* 96px */
```

### Tailwind Equivalents
- `gap-2` → 8px
- `gap-3` → 12px
- `gap-4` → 16px
- `gap-6` → 24px
- `gap-8` → 32px
- `p-6` → 24px padding
- `p-8` → 32px padding
- `px-4` → 16px horizontal
- `py-24` → 96px vertical (section padding on mobile)
- `md:py-32` → 128px on tablet
- `lg:py-40` → 160px on desktop

### Standard Section Spacing
All sections use: `py-24 md:py-32 lg:py-40`
- Mobile: 96px top/bottom
- Tablet: 128px top/bottom
- Desktop: 160px top/bottom

---

## 7. Border Radius

### Variants (from `lib/design-system.ts`)
```typescript
radius: {
  none: '0px',
  sm: 'calc(var(--radius) - 4px)',        /* ~2px */
  md: 'calc(var(--radius) - 2px)',        /* ~4px */
  lg: 'var(--radius)',                    /* ~6px (default) */
  xl: 'calc(var(--radius) + 4px)',        /* ~10px */
  '2xl': 'calc(var(--radius) + 8px)',     /* ~14px */
  '3xl': 'calc(var(--radius) + 12px)',    /* ~18px */
  '4xl': 'calc(var(--radius) + 16px)',    /* ~22px */
  full: '9999px',                         /* Perfect circles */
}
```

### Usage
- **Buttons:** `rounded-md` (default)
- **Cards:** `rounded-lg` (subtle curve)
- **Badges/Chips:** `rounded-full` (pill-shaped)
- **Inputs:** `rounded-md`

---

## 8. Shadows & Transitions

### Shadows (from `lib/design-system.ts`)
```typescript
shadows: {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
}
```

### Transitions (from `lib/design-system.ts`)
```typescript
transitions: {
  fast: '0.2s ease-out',    /* Hover states, quick interactions */
  normal: '0.3s ease-out',  /* Default transitions */
  slow: '0.5s ease-out',    /* Entrance animations, scroll effects */
}
```

### Usage
- **Button hover:** `transition-all` with shadow increase
- **Links:** `transition-colors`
- **Form inputs:** `transition-all` with border/ring changes

---

## 9. Breakpoints

### Responsive Breakpoints (from `lib/design-system.ts`)
```typescript
breakpoints: {
  xs: '0px',              /* Default (mobile) */
  sm: '640px',            /* Small tablets */
  md: '768px',            /* Tablets */
  lg: '1024px',           /* Laptops */
  xl: '1280px',           /* Large desktops */
  '2xl': '1536px',        /* Extra large */
}
```

### Tailwind Prefix Usage
- `md:grid-cols-2` → 2 columns on tablets+
- `lg:grid-cols-3` → 3 columns on laptops+
- `hidden md:flex` → Hidden mobile, visible tablet+
- `text-sm md:text-base lg:text-lg` → Responsive text sizes

---

## 10. Component Patterns

### Buttons
```tsx
<Button size="lg" className="px-8">Get Started</Button>
```
- **Default variant:** Blue gradient background, white text
- **Outline variant:** Transparent background, border, accent text
- **Sizes:** sm (44px), default (48px), lg (52px)
- **Hover:** scale(1.02), shadow increase

### Cards
```tsx
<Card className="p-8 md:p-10">
  {/* Content */}
</Card>
```
- **Padding:** 32-40px
- **Left border:** 1px gradient (blue to purple)
- **Radius:** md (subtle curve)
- **Hover:** Shadow increase, slight lift
- **Background:** White (light) / dark-gray (dark mode)

### Input Fields
```tsx
<Input
  className="min-h-[44px]"
  placeholder="..."
/>
```
- **Min height:** 44px (mobile accessibility)
- **Border:** 1px border-border
- **Focus:** Ring-2 ring-blue-600/20, border-blue-600
- **Padding:** px-3 py-2

### Form Field Wrapper
```tsx
<div className="space-y-1.5">
  <Label htmlFor="field">Label *</Label>
  <Input id="field" {...register('field')} />
  {errors.field && <p className="text-xs text-destructive">{errors.field.message}</p>}
</div>
```

### Badge/Pills
```tsx
<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
  <Icon className="h-4 w-4" />
  Label
</span>
```

---

## 11. Section Structure

### Standard Header Pattern
```tsx
<section id="section-id" className="py-24 md:py-32 lg:py-40">
  <div className="mx-auto max-w-6xl px-6 md:px-8">
    {/* Section header */}
    <div className="mx-auto max-w-3xl text-center mb-20">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
        Title <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent gradient-glow">highlight.</span>
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground">
        Subheading/description here
      </p>
    </div>

    {/* Content grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Items */}
    </div>
  </div>
</section>
```

### Spacing Rules
- **Vertical section padding:** `py-24 md:py-32 lg:py-40` (96-160px)
- **Horizontal padding:** `px-6 md:px-8` (mobile 24px, desktop 32px)
- **Max-width container:** `max-w-6xl` for full-width, `max-w-4xl` for content-heavy
- **Grid gaps:** `gap-6 lg:gap-8` (24px mobile, 32px desktop)
- **Section header spacing:** `mb-20` after title/subtitle

### Color Backgrounds
- Default: `bg-background` (white)
- Alternating: `bg-muted/50` (very light gray)
- Featured: No background (default white)

---

## 12. Page Architecture

### Route Map
```
/                                    → Homepage (hero, values, portfolio, tools, pricing, faq, contact)
/use-cases/professional-services    → Professional services marketing
/use-cases/home-services            → Home services marketing
/resources                           → Resources hub (blog, guides, FAQ)
/resources/blog                      → Blog listing
/resources/blog/[category]           → Posts by category
/resources/blog/[category]/[slug]    → Individual post
/resources/how-to                    → How-to guides listing
/resources/how-to/[slug]             → Individual guide
/resources/faq                       → FAQ page
/contact                             → Dedicated contact page
/auth                                → Login/signup (client-side form)
/dashboard                           → Protected admin panel
/api/contact                         → POST endpoint for contact form
/api/auth/logout                     → POST logout endpoint
```

### SSR Rules
- **Marketing pages:** NO `'use client'` at page level (all SSR for SEO)
- **Section components:** CAN use `'use client'` (hero, contact form, etc)
- **Layouts:** NO `'use client'` (unless wrapping client sections)
- **API routes:** Always server-side
- **Protected pages:** Middleware in `proxy.ts` handles auth

### Client Components (when needed)
- Contact form (react-hook-form, validation)
- Navbar/Footer (mobile menu state)
- Theme toggle (client-side theme switching)
- Dashboard components (interactive features)
- Auth pages (form submission)

---

## 13. Key File Index

### Design System
- **`app/globals.css`** — CSS variables (colors, spacing, gradients, animations)
- **`lib/design-system.ts`** — TypeScript constants for design tokens
- **`lib/seo.ts`** — SEO metadata configuration for all pages

### Configuration
- **`lib/config.ts`** — Site configuration (name, URL, description, ogImage)
- **`app/layout.tsx`** — Root layout with global metadata
- **`tailwind.config.ts`** — Tailwind configuration
- **`next.config.js`** — Next.js configuration

### Layout Components
- **`components/layout/navbar.tsx`** — Navigation bar with logo + dropdown menus
- **`components/layout/footer.tsx`** — Footer with logo + link columns
- **`components/layout/theme-provider.tsx`** — Dark mode provider
- **`components/layout/theme-toggle.tsx`** — Dark mode toggle button

### Section Components (Marketing)
- **`components/sections/hero.tsx`** — Hero banner with CTA
- **`components/sections/how-we-think.tsx`** — Core values (4-item grid)
- **`components/sections/portfolio.tsx`** — Case studies (3-item grid)
- **`components/sections/tools.tsx`** — Features (6-item grid)
- **`components/sections/pricing.tsx`** — 3-tier pricing
- **`components/sections/faq.tsx`** — FAQ accordion
- **`components/sections/contact.tsx`** — Contact form

### UI Components (shadcn)
- **`components/ui/button.tsx`** — Button component (variants: default, outline, ghost)
- **`components/ui/card.tsx`** — Card component (border + padding)
- **`components/ui/input.tsx`** — Input field component
- **`components/ui/textarea.tsx`** — Textarea component
- **`components/ui/label.tsx`** — Form label component
- **`components/ui/accordion.tsx`** — Accordion (for FAQ)

### Assets
- **`public/logos/xyren-logo-blue.png`** — Primary logo (light mode)
- **`public/logos/xyren-logo-dark.png`** — Dark logo (dark mode)
- **`public/robots.txt`** — Search engine crawler rules
- **`app/robots.ts`** — Next.js robots.txt config
- **`app/sitemap.ts`** — Dynamic XML sitemap

### Utilities
- **`lib/utils.ts`** — Helper functions (cn for classname merging)
- **`lib/supabase/client.ts`** — Supabase browser client
- **`lib/supabase/server.ts`** — Supabase server client
- **`lib/supabase/middleware.ts`** — Auth middleware utilities
- **`proxy.ts`** — Request proxy for auth/middleware

---

## 14. Design Principles

### 1. Breathing Room (Whitespace)
- Large padding between sections (80-160px)
- Generous component spacing (32-48px internal)
- Single focal point per section
- Users should never feel rushed

### 2. Typographic Hierarchy
- **h1:** 48-72px, bold, tight line-height (hero only)
- **h2:** 32-40px, bold, for section titles
- **h3:** 24px, semibold, for subsections
- **Body:** 16px, normal weight, relaxed line-height (1.6)
- **Secondary:** 14px, muted color, lighter weight

### 3. Motion Guidelines
- **Entrance:** Fade-in on scroll (0.4s ease-out)
- **Hover:** Scale 1.02, shadow increase (0.2s)
- **Animations:** Subtle and purposeful, not flashy
- **Glow effect:** 4s cycle, continuous but not distracting
- **Respect:** `prefers-reduced-motion` media query

### 4. Visual Consistency
- Single color scheme (blue→purple gradient)
- Consistent card/component styling across pages
- Standard section spacing on all pages
- Same component library used everywhere
- Dark mode support via Tailwind `dark:` prefix

### 5. Accessibility (WCAG AA)
- Min 4.5:1 contrast ratio (text on background)
- 44px+ touch targets on mobile
- Focus states visible on all interactive elements
- Alt text on all images
- Semantic HTML (headings, labels, buttons)

### 6. Performance
- Next.js 16 with SSR for SEO
- Image optimization (next/image)
- CSS variables for instant theme switching
- Minimal JavaScript (form handling only)
- Fast page loads (targeting <3s on 4G)

---

## 15. Reference Sites & Lessons Applied

### 1. **Apple.com**
- ✅ Maximum whitespace between sections
- ✅ One headline, one CTA per section
- ✅ Large, bold typography (48px+)
- ✅ Minimal color (single accent)
- **Applied to Xyren:** Section spacing, heading sizes, whitespace philosophy

### 2. **Linear.app**
- ✅ Modern SaaS aesthetic
- ✅ Gradient accents (conservative use)
- ✅ Clean data visualizations
- ✅ Premium feel without complexity
- **Applied to Xyren:** Blue→purple gradient system, feature highlights

### 3. **Vercel.com**
- ✅ Clean grid layouts
- ✅ Strategic whitespace
- ✅ Smooth animations on scroll
- ✅ Consistent component styling
- **Applied to Xyren:** Grid component structure, entrance animations

### 4. **Notion.so**
- ✅ Very clean hero sections
- ✅ Feature cards with icons (no images)
- ✅ Large section spacing
- ✅ Icon-first design
- **Applied to Xyren:** Tools/Features section structure, icon usage

### 5. **Stripe.com**
- ✅ Sophisticated use of gradients
- ✅ Strategic illustrations (minimal)
- ✅ Large, bold typography
- ✅ Interactive hover states
- **Applied to Xyren:** Gradient text highlights, subtle glow animation

---

## Usage Instructions

### When Adding a New Section
1. Check this guide for **spacing tokens** (use `py-24 md:py-32 lg:py-40`)
2. Use **section structure** template (header with centered title)
3. Apply **typography hierarchy** (h2 for title, p for subheading)
4. Add **gradient highlight** to key phrase with `.gradient-glow` class
5. Use **card component** for grouped content
6. Verify **dark mode** with `dark:` Tailwind prefix
7. Test on mobile, tablet, desktop (responsive)

### When Adding a New Component
1. Check **component patterns** section for existing examples
2. Use **spacing tokens** and **border radius** from design system
3. Reference **color system** for proper semantic colors
4. Add **transition/animation** if interactive
5. Ensure **accessibility** (focus states, contrast, touch targets)
6. Use **TypeScript** for props typing

### When Changing Colors/Spacing
1. Update CSS variables in `app/globals.css`
2. Update TypeScript constants in `lib/design-system.ts`
3. Test in **light mode** and **dark mode**
4. Verify all sections still look cohesive
5. Check contrast ratios (WCAG AA minimum 4.5:1)

---

## Summary Checklist for Every Build

- [ ] Logos used (not text) in navbar/footer
- [ ] Section spacing: `py-24 md:py-32 lg:py-40`
- [ ] Section header: centered h2, text-4xl md:text-5xl
- [ ] Gradient highlights: `bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent gradient-glow`
- [ ] Cards use: `rounded-lg` with left gradient border
- [ ] Buttons: min 48px height with hover scale effect
- [ ] Inputs: 44px+ height, visible focus state
- [ ] Dark mode: `dark:` classes where needed
- [ ] Responsive: mobile → tablet → desktop widths
- [ ] Accessibility: WCAG AA contrast, focus states, touch targets
- [ ] Animation: subtle, purposeful (glow, hover, entrance)

---

**Last Updated:** 2026-03-05
**Built with:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
