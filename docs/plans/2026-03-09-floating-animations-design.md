# Floating & Alive Animations Design
**Date:** 2026-03-09
**Status:** Approved
**Approach:** Framer Motion + useInView

## Overview
Modernize the Xyren.me design by adding subtle, scroll-triggered floating animations to Hero and featured sections (How We Think, Portfolio, Tools, Pricing). Animations maintain existing style, branding, and colors while making the website feel more alive.

## Animation Philosophy
- **Style:** Floating and alive with gentle ambient movement
- **Intensity:** Noticeable but refined (15-20px movement, 2-3s durations)
- **Trigger:** Scroll-triggered via viewport detection
- **Variety:** Different elements animate in different directions for visual interest

## Animation Variants
Four core floating animations using Framer Motion:

### 1. **floatUp**
- Direction: Vertical (bottom to top)
- Movement: 15-20px upward
- Duration: 2.5s
- Easing: easeInOut
- Initial state: Opacity 0, y: 20px

### 2. **floatDown**
- Direction: Vertical (top to bottom)
- Movement: 15-20px downward
- Duration: 2.5s
- Easing: easeInOut
- Initial state: Opacity 0, y: -20px

### 3. **floatSide** (left/right variants)
- Direction: Horizontal
- Movement: 15-20px left or right
- Duration: 3s
- Easing: easeInOut
- Initial state: Opacity 0, x: ±20px

### 4. **floatRotate**
- Direction: Vertical float + subtle rotation
- Movement: 15-20px upward, 2-3° rotation
- Duration: 3s
- Easing: easeInOut
- Initial state: Opacity 0, y: 20px, rotate: -2°

## Section-by-Section Application

### Hero
- **Headline:** `floatUp` — main heading floats up on scroll-in
- **Subtitle:** `floatDown` — supporting text floats down
- **CTA Button:** `floatRotate` — button floats up with gentle rotation
- **Timing:** Staggered 0.1-0.2s between elements

### How We Think
- **Cards/items:** Varied directions (alternating floatUp/floatDown/floatSide)
- **Icons:** floatUp or floatRotate
- **Text:** Complementary direction to icons

### Portfolio
- **Project cards:** Mix of floatUp and floatSide
- **Hover enhancement:** Subtle scale increase (1.02x) on hover (use Framer Motion transitions)
- **Stagger:** Each card has slight delay

### Tools
- **Tool icons:** floatUp or floatRotate
- **Tool descriptions:** floatDown or floatSide
- **Visual rhythm:** Icons and text move in opposite directions

### Pricing
- **Pricing cards:** All floatUp (consistent direction)
- **Highlight card:** Additional glow effect (existing glow-pulse animation continues)
- **Features/icons within cards:** Slight stagger

## Implementation Details

### Technology
- **Framework:** Framer Motion (already in project)
- **Hook:** `useInView()` from `react-intersection-observer`
- **Component Pattern:** Wrap key elements with `motion.div`
- **Performance:** Non-blocking, optimized via Framer Motion's render optimization

### Key Files to Modify
- `components/sections/hero.tsx` — Add floating animations to headline, subtitle, CTA
- `components/sections/how-we-think.tsx` — Add varied floating to cards
- `components/sections/portfolio.tsx` — Add floating to project cards
- `components/sections/tools.tsx` — Add floating to tool items
- `components/sections/pricing.tsx` — Add floating to pricing cards
- `lib/animations.ts` (new) — Centralized animation variant definitions

### Naming Convention
- Animation variants: `floatUp`, `floatDown`, `floatLeft`, `floatRight`, `floatRotate`
- Classes remain unchanged (no style changes)
- Motion components use semantic naming: `motion.div`, `motion.h1`, etc.

## Constraints & Notes
- **No style changes:** Preserve all existing colors (dark navy, cyan, violet)
- **No branding changes:** Keep gradient text, glass effects, glow shadows
- **No layout changes:** Floating is purely visual animation, no DOM restructuring
- **Accessibility:** Animations respect `prefers-reduced-motion` preference
- **Performance:** Use Framer Motion's built-in optimization, lazy load animations via useInView

## Success Criteria
- ✅ Hero section elements float smoothly on scroll-in
- ✅ Featured sections (How We Think, Portfolio, Tools, Pricing) have varied floating animations
- ✅ Animations are noticeable (15-20px) but refined (2-3s duration)
- ✅ No impact on page performance or load time
- ✅ Animations respect reduced-motion preferences
- ✅ Visual consistency across all animated elements
