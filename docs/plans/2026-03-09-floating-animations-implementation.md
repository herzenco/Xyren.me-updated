# Floating Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add scroll-triggered floating animations to Hero and featured sections (How We Think, Portfolio, Tools, Pricing) using Framer Motion + useInView, with varied animation directions for visual interest.

**Architecture:** Create reusable animation variants in `lib/animations.ts`, then wrap key elements in each section component with `motion.div` components that trigger animations on scroll via `useInView()` hook from react-intersection-observer.

**Tech Stack:** Framer Motion (animation library), react-intersection-observer (viewport detection), Next.js 16, TypeScript, Tailwind CSS

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Add Framer Motion and react-intersection-observer to dependencies**

Edit `package.json` to add to the `dependencies` object:
```json
"framer-motion": "^11.0.3",
"react-intersection-observer": "^9.13.0"
```

**Step 2: Install packages**

Run: `npm install`

Expected: Both packages installed successfully in node_modules

**Step 3: Verify installation**

Run: `npm ls framer-motion react-intersection-observer`

Expected: Both packages listed with versions

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion and react-intersection-observer dependencies"
```

---

## Task 2: Create Animation Variants Library

**Files:**
- Create: `lib/animations.ts`

**Step 1: Create animations configuration file**

Create `/Users/herzen/Desktop/Xyren.me-updated/lib/animations.ts`:

```typescript
import { Variants } from 'framer-motion'

/**
 * Reusable animation variants for floating effects
 * All animations respect prefers-reduced-motion preference
 */

export const floatUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 2.5,
      ease: 'easeInOut',
    },
  },
}

export const floatDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 2.5,
      ease: 'easeInOut',
    },
  },
}

export const floatLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 3,
      ease: 'easeInOut',
    },
  },
}

export const floatRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 3,
      ease: 'easeInOut',
    },
  },
}

export const floatRotate: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotate: -2,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 3,
      ease: 'easeInOut',
    },
  },
}

export const containerVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}
```

**Step 2: Verify file was created**

Run: `ls -la lib/animations.ts`

Expected: File exists at `lib/animations.ts`

**Step 3: Check TypeScript compilation**

Run: `npx tsc --noEmit`

Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add lib/animations.ts
git commit -m "feat: add reusable floating animation variants"
```

---

## Task 3: Add Animations to Hero Section

**Files:**
- Modify: `components/sections/hero.tsx`

**Step 1: Update Hero component with Framer Motion**

Replace the entire content of `components/sections/hero.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { floatUp, floatDown, floatRotate } from '@/lib/animations'

export function Hero() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section ref={ref} className="relative py-32 md:py-44 overflow-hidden">
      {/* Cyan ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,_hsl(190_100%_50%/0.12)_0%,_transparent_70%)]" />
      </div>

      <div className="container relative mx-auto px-6 text-center">
        <motion.h1
          variants={floatUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-4xl text-5xl font-bold tracking-[-0.03em] sm:text-6xl md:text-[72px] leading-[1.05]"
        >
          Websites designed to{' '}
          <br className="hidden sm:block" />
          <span className="text-gradient">turn visitors into clients.</span>
        </motion.h1>

        <motion.p
          variants={floatDown}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
        >
          We build conversion-focused websites for service professionals. Leads
          captured, appointments booked. Launched in 5–10 days.
        </motion.p>

        <div className="mt-12">
          <motion.div
            variants={floatRotate}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <Link
              href="/#contact"
              className="cta-glow inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-lg font-semibold transition-all"
            >
              Get a website that works
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Verify file updated**

Run: `grep -n "motion.h1" components/sections/hero.tsx`

Expected: motion.h1 found at a line number

**Step 3: Check TypeScript compilation**

Run: `npx tsc --noEmit`

Expected: No TypeScript errors

**Step 4: Start dev server and test Hero animations**

Run: `npm run dev`

Expected: Dev server starts, navigate to http://localhost:3000 and scroll to verify Hero elements float in

**Step 5: Commit**

```bash
git add components/sections/hero.tsx
git commit -m "feat: add floating animations to Hero section (floatUp, floatDown, floatRotate)"
```

---

## Task 4: Add Animations to How We Think Section

**Files:**
- Modify: `components/sections/how-we-think.tsx`

**Step 1: Read current How We Think component**

First, examine the current component structure to identify elements to animate.

**Step 2: Update How We Think component**

Add `'use client'` directive at top, import Framer Motion and animations, wrap section with `useInView`, and apply varied animations to cards/content items. Each card should use a different variant (floatUp/floatDown/floatLeft/floatRight) based on position.

Pattern example:
```typescript
'use client'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { floatUp, floatDown, containerVariants } from '@/lib/animations'

export function HowWeThink() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section ref={ref} className="...">
      {/* Apply containerVariants for staggered animation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {/* First card floats up */}
        <motion.div variants={floatUp}>
          {/* card content */}
        </motion.div>

        {/* Second card floats down */}
        <motion.div variants={floatDown}>
          {/* card content */}
        </motion.div>
      </motion.div>
    </section>
  )
}
```

**Step 3: Test animations in dev server**

Scroll to How We Think section to verify staggered floating animations

**Step 4: Commit**

```bash
git add components/sections/how-we-think.tsx
git commit -m "feat: add varied floating animations to How We Think section"
```

---

## Task 5: Add Animations to Portfolio Section

**Files:**
- Modify: `components/sections/portfolio.tsx`

**Step 1: Update Portfolio component**

Add `'use client'` directive, import Framer Motion and animations, apply `floatUp` to heading, alternate `floatUp`/`floatLeft` to cards, add hover scale effect.

Pattern for cards:
```typescript
<motion.div
  variants={index % 2 === 0 ? floatUp : floatLeft}
  whileHover={{ scale: 1.02 }}
  className="..."
>
  {/* card content */}
</motion.div>
```

**Step 2: Test animations**

Scroll to Portfolio section, verify cards float in with alternating directions and scale on hover

**Step 3: Commit**

```bash
git add components/sections/portfolio.tsx
git commit -m "feat: add alternating floating animations to Portfolio section with hover scale"
```

---

## Task 6: Add Animations to Tools Section

**Files:**
- Modify: `components/sections/tools.tsx`

**Step 1: Update Tools component**

Apply `floatUp` or `floatRotate` to tool icons, apply complementary direction (`floatDown` or `floatRight`) to descriptions. Create visual rhythm where icons and text move in opposite directions.

**Step 2: Test animations**

Verify tools section elements float in with contrasting directions

**Step 3: Commit**

```bash
git add components/sections/tools.tsx
git commit -m "feat: add contrasting floating animations to Tools section icons and descriptions"
```

---

## Task 7: Add Animations to Pricing Section

**Files:**
- Modify: `components/sections/pricing.tsx`

**Step 1: Update Pricing component**

Apply consistent `floatUp` to all pricing cards for a unified feel. Cards should stagger in sequence. The highlight/featured card can continue using the existing `glow-pulse` animation (no change needed).

**Step 2: Test animations**

Verify pricing cards float up in staggered sequence

**Step 3: Commit**

```bash
git add components/sections/pricing.tsx
git commit -m "feat: add staggered floatUp animations to Pricing section cards"
```

---

## Task 8: Verify Performance and Accessibility

**Files:**
- Test: All modified components

**Step 1: Run build to check for errors**

Run: `npm run build`

Expected: Build completes successfully with no errors

**Step 2: Test prefers-reduced-motion**

In browser DevTools, enable "Prefers reduced motion" under Accessibility settings and reload page. Animations should be disabled or minimal.

Note: Framer Motion respects this by default when animations are properly configured. Verify animations don't play when reduced-motion is enabled.

**Step 3: Check performance**

Open browser DevTools Performance tab, scroll through page, and record performance. Verify:
- No jank or dropped frames during scrolling
- Animations run smoothly at 60fps
- No memory leaks

**Step 4: Final commit with completion note**

```bash
git add -A
git commit -m "feat: complete floating animations implementation for Hero + featured sections

- Add Framer Motion and react-intersection-observer dependencies
- Create reusable animation variants (floatUp, floatDown, floatLeft, floatRight, floatRotate)
- Apply scroll-triggered animations to Hero, How We Think, Portfolio, Tools, and Pricing
- Ensure animations respect prefers-reduced-motion accessibility preference
- Verify no performance impact on page load or scrolling
- All animations are 2.5-3s duration with 15-20px movement for noticeable but refined feel"
```

---

## Testing Checklist

Before marking as complete:

- [ ] npm install completes without errors
- [ ] TypeScript compilation passes (npx tsc --noEmit)
- [ ] npm run build succeeds
- [ ] Dev server runs without errors (npm run dev)
- [ ] Hero section: headline floats up, subtitle floats down, CTA floats with rotation
- [ ] How We Think: cards have varied floating directions with stagger effect
- [ ] Portfolio: cards alternate floatUp/floatLeft with 1.02x scale on hover
- [ ] Tools: icons float up/rotate, descriptions float down/sideways with contrast
- [ ] Pricing: all cards floatUp in staggered sequence
- [ ] All animations trigger on scroll (appear as section comes into view)
- [ ] Reduced motion preference disables animations
- [ ] Page performance is not degraded (60fps scrolling)
- [ ] No console errors or warnings

---

## Notes for Implementation

- All modifications are **'use client'** components (client-side animations)
- Animation durations are 2.5-3 seconds as per design
- useInView hook with `triggerOnce: true` ensures animations play once per page load
- Stagger timing: 0.15s (150ms) between child elements
- All color, style, and branding remain unchanged
- No layout or DOM restructuring needed
