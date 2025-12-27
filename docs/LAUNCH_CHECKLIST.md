# Smart Kidz Launch Checklist

## Product readiness
- [ ] Onboarding complete (parent + child)
- [ ] Lesson viewer renders full lesson JSON
- [ ] Practice engine generates multiple activity types
- [ ] Accessibility toggles persist per child
- [ ] Explain-it-back records and saves attempts
- [ ] Paywall gating verified for active/trialing/canceled states

## Data
- [ ] Lessons imported into `lessons` table
- [ ] Skills + lesson_skill mappings loaded
- [ ] Backups: admin export token tested, JSON export saved offline

## Payments
- [ ] Stripe product + monthly/annual prices created
- [ ] Checkout works end-to-end
- [ ] Webhooks configured in Stripe and verified in logs
- [ ] Subscription stored in `subscriptions` table with correct `parent_id`
- [ ] Trial behavior confirmed

## Security & Privacy
- [ ] Supabase RLS tested for parent/child isolation
- [ ] No service role keys in client bundle
- [ ] Admin export/import endpoints protected with tokens
- [ ] No ads, no trackers (or documented if added)

## Deployment
- [ ] Vercel project connected to GitHub
- [ ] All environment variables set
- [ ] Stripe webhook points to production URL
- [ ] Domain connected (optional)
- [ ] Basic monitoring/logging enabled

## Marketing
- [ ] Homepage headline + CTA final
- [ ] Pricing page copy final
- [ ] Video produced from script (30–45s)
- [ ] Silent autoplay captions embedded on hero
- [ ] Contact/support email set

## Legal (not legal advice)
- [ ] Privacy policy
- [ ] Terms of use
- [ ] Subscription cancellation info
