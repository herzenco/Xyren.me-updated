import { createClient } from '@supabase/supabase-js'

// Load env vars - script is run directly with tsx
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const blogPosts = [
  {
    title: "7 Reasons Your Service Business Website Isn't Getting Calls",
    slug: '7-reasons-website-not-getting-calls',
    category: 'seo',
    excerpt: "Most service business websites make the same mistakes. Here's what to fix first.",
    content: `# 7 Reasons Your Service Business Website Isn't Getting Calls

Your website is live. You've told your customers about it. But the phone isn't ringing. Sound familiar?

Most service business websites share the same handful of problems. The good news: they're all fixable.

## 1. Your Phone Number Is Hard to Find

On mobile, your phone number should be at the very top of every page — ideally as a tap-to-call button. If someone has to scroll to find it, you've already lost them.

## 2. Your Site Loads Too Slowly

Google penalizes slow sites in rankings, and visitors leave if a page takes more than 3 seconds to load. Image compression and proper hosting go a long way.

## 3. You're Not Ranking Locally

If you're not showing up in Google Maps or the top 3 local results, most of your potential customers will never find you organically.

## 4. There's No Clear Call to Action

Every page needs to tell visitors exactly what to do next: Call now, Book online, Get a free quote. Don't make them guess.

## 5. Your Reviews Aren't Visible

93% of people read reviews before hiring a local service provider. If your 5-star reviews are buried on Google, put them front and center on your site.

## 6. You're Not Mobile-Optimized

Over 70% of local searches happen on mobile. A site that looks broken on a phone is worse than no site.

## 7. Your Content Doesn't Answer Questions

Google rewards content that answers the questions your customers are actually searching for. Service pages that just list your offerings aren't enough.

---

*Ready to fix all of these at once? [Get a free quote →](/#contact)*`,
    author: 'Xyren.me Team',
    tags: ['SEO', 'websites', 'service business'],
    reading_time: 6,
    is_published: true,
    published_at: new Date('2026-01-15').toISOString(),
  },
  {
    title: 'How Much Should a Small Business Website Cost in 2026?',
    slug: 'small-business-website-cost-2026',
    category: 'business',
    excerpt: "The real breakdown of what you'll pay — and what you'll get — at every price point.",
    content: `# How Much Should a Small Business Website Cost in 2026?

Pricing varies wildly — from \$500 to \$50,000. Here's what you actually need to know before spending anything.

## DIY Builders (\$10–\$30/month)

Wix, Squarespace, and GoDaddy are fine for a very basic online presence. But they're slow, hard to customize beyond templates, and terrible for local SEO.

## Freelancers (\$1,000–\$5,000)

A good freelancer can build you something solid. The risks: availability, inconsistent quality, and no ongoing support once the project is done.

## Agencies (\$5,000–\$50,000+)

Full-service agencies handle strategy, design, and development. Worth it for complex projects, but most service businesses don't need that level.

## Bundled Monthly Services (\$200–\$500/month)

Services like Xyren.me build you a fast, professional website and handle all the marketing — for a predictable monthly fee. No large upfront cost.

## What You Actually Need

For most service businesses: speed, mobile-optimization, local SEO, and a clear path for customers to contact you. You don't need to spend \$20k to get that.

The question isn't just "how much does it cost?" — it's "what will it cost me *not* to have a great website?"

---

*See our pricing → [Xyren.me pricing](/#pricing)*`,
    author: 'Xyren.me Team',
    tags: ['pricing', 'websites', 'business'],
    reading_time: 5,
    is_published: true,
    published_at: new Date('2026-02-01').toISOString(),
  },
  {
    title: 'Local SEO in 2026: What Actually Moves the Needle for Service Businesses',
    slug: 'local-seo-2026-service-businesses',
    category: 'seo',
    excerpt: "Stop chasing algorithm updates. These fundamentals work — and they're what Google cares about.",
    content: `# Local SEO in 2026: What Actually Moves the Needle

Most local SEO advice is noise. Here's what genuinely works for service businesses right now.

## Google Business Profile Is Non-Negotiable

Claim and fully complete your profile. Add photos weekly. Respond to every review — positive and negative. This is the single highest-leverage thing you can do.

## Consistent NAP Everywhere

Name, Address, Phone number — must be **identical** on your website, Google Business Profile, Yelp, and every directory you're listed on. Inconsistencies confuse Google and hurt rankings.

## Reviews Drive Rankings

Aim for 20+ Google reviews. Ask every satisfied customer directly. Make it easy with a short direct review link. Businesses with more (and more recent) reviews consistently outrank those with fewer.

## Location Pages Work

If you serve multiple towns or neighborhoods, create a dedicated page for each one. Write real, specific content — not just "We serve Springfield." Include the city name naturally in headings and body copy.

## Page Speed Matters More Than Ever

Core Web Vitals are a confirmed ranking factor. A slow site is effectively invisible in competitive local searches. Test yours at [PageSpeed Insights](https://pagespeed.web.dev).

## Schema Markup Helps

LocalBusiness JSON-LD schema tells Google your business type, hours, phone number, and service area in a format it can read directly — not just infer from your text.

---

*Let us handle your local SEO strategy → [Get started](/#contact)*`,
    author: 'Xyren.me Team',
    tags: ['local SEO', 'Google Business Profile', 'rankings'],
    reading_time: 7,
    is_published: true,
    published_at: new Date('2026-02-20').toISOString(),
  },
]

const howToGuides = [
  {
    title: 'How to Set Up Your Google Business Profile in 15 Minutes',
    slug: 'set-up-google-business-profile',
    difficulty: 'beginner' as const,
    excerpt: 'Step-by-step: claim your listing, fill it out correctly, and start ranking in Google Maps.',
    content: `# How to Set Up Your Google Business Profile in 15 Minutes

Google Business Profile is the single most important thing a local service business can do online — and it's completely free.

## Step 1: Go to business.google.com

Click "Manage now" and sign in with a Google account you'll use for your business permanently.

## Step 2: Enter Your Business Name

Search for your business first. Google sometimes creates listings automatically from public data — if yours exists, claim it. Otherwise, create a new one.

## Step 3: Choose Your Business Category

Be specific. Not just "Contractor" — use "General Contractor," "Plumber," or "House Cleaning Service." Your primary category has the biggest impact on which searches you appear in.

## Step 4: Add Your Service Area

If you travel to customers (plumber, electrician, cleaner, landscaper), select "I deliver goods and services to my customers" and add the cities or zip codes you serve.

## Step 5: Add Your Phone Number and Website

Make sure these **exactly match** what's on your website. Even small differences (like "St." vs "Street") can hurt your rankings.

## Step 6: Verify Your Listing

Google will mail a postcard with a 5-digit PIN to your business address (5–7 days). Enter it to verify. You can also verify by phone or email if those options are offered.

## Step 7: Complete Your Profile

Don't stop at verification. A complete profile outranks an incomplete one:

- Add accurate business hours (including holiday hours)
- Upload 10+ photos: exterior, interior, work examples, team
- Write a keyword-rich description (750 characters max)
- Add all your services with descriptions
- Enable messaging if you want customers to text you

## Next Steps

Ask your first 5 satisfied customers to leave a Google review using a direct link (find it in your GBP dashboard under "Get more reviews"). Respond to every review within 24 hours.`,
    tags: ['Google Business Profile', 'local SEO', 'setup guide'],
    reading_time: 8,
    is_published: true,
    published_at: new Date('2026-01-20').toISOString(),
  },
  {
    title: 'How to Get Your First 10 Google Reviews',
    slug: 'get-first-10-google-reviews',
    difficulty: 'beginner' as const,
    excerpt: 'The exact process to go from zero reviews to 10 in your first month — without being spammy.',
    content: `# How to Get Your First 10 Google Reviews

Reviews are the fastest way to build trust with potential customers. Here's the exact process to get your first 10 — ethically and quickly.

## Why 10 Reviews Is the Threshold

Studies consistently show that businesses with 10+ reviews see significantly higher click-through rates from Google search results. It's the point where customers begin trusting a business they've never heard of.

## Step 1: Create a Direct Review Link

In your Google Business Profile dashboard, go to Home → "Get more reviews" → copy the link. Shorten it with bit.ly so it's easy to text or say out loud.

## Step 2: Ask Right After the Job

The best moment is immediately after delivering great work, when satisfaction is highest.

*"I'm so glad everything worked out — if you have 30 seconds, a Google review would mean the world to us."*

Then follow up with a text or email with the link.

## Step 3: Send a Simple Follow-Up Text

\`\`\`
Hi [Name], it was great working with you! If you have a moment, here's a
direct link to leave us a Google review: [link]

No pressure at all — we just appreciate every bit of feedback. Thanks!
\`\`\`

## Step 4: Add It to Your Email Signature

Every email you send is an opportunity:

*"Happy with our service? [Leave us a Google review →](your-link)"*

## Step 5: Put It on Your Invoice or Receipt

Add a QR code that links directly to your review page. Print it on invoices, business cards, or a simple card you hand to customers at job completion.

## What NOT to Do

- **Don't offer incentives** — paying for reviews violates Google's policy and can get your listing suspended
- **Don't review yourself** — Google detects IP patterns and removes these
- **Don't ask in bulk** — a sudden spike in reviews from people who haven't visited recently is a red flag

## Responding to Reviews

Respond to every review within 24 hours:

- **Positive reviews**: Thank them and mention a specific detail from the job
- **Negative reviews**: Apologize professionally, take responsibility, offer to resolve it offline — never argue publicly`,
    tags: ['Google reviews', 'reputation management', 'local SEO'],
    reading_time: 7,
    is_published: true,
    published_at: new Date('2026-02-10').toISOString(),
  },
]

async function seed() {
  console.log('Seeding blog posts...')
  for (const post of blogPosts) {
    const { error } = await supabase.from('blog_posts').upsert(post, { onConflict: 'slug' })
    if (error) console.error(`Failed to seed "${post.slug}":`, error.message)
    else console.log(`  ✓ ${post.title}`)
  }

  console.log('\nSeeding how-to guides...')
  for (const guide of howToGuides) {
    const { error } = await supabase.from('how_to_guides').upsert(guide, { onConflict: 'slug' })
    if (error) console.error(`Failed to seed "${guide.slug}":`, error.message)
    else console.log(`  ✓ ${guide.title}`)
  }

  console.log('\nDone!')
}

seed().catch(console.error)
