# PostMetric - 42-Day Build Plan

**Goal:** Ship a working tweet attribution SaaS in 6 weeks
**Daily commitment:** 1-2 hours per day
**Stack:** React/Next.js, Firebase (Firestore, Auth, Hosting), Tailwind CSS

---

## Week 1: Foundation

### Day 1 - Project Setup
- [ ] Create new React app (`npx create-react-app postmetric-app` or use Vite)
- [ ] Set up GitHub repo
- [ ] Install Tailwind CSS
- [ ] Set up project structure (components, pages, utils)

### Day 2 - Firebase Setup
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Install Firebase SDK (`npm install firebase`)
- [ ] Initialize Firebase in your app
- [ ] Add Firebase config to environment variables
- [ ] Test connection

### Day 3 - Firebase Authentication
- [ ] Enable Firebase Authentication (Email/Password + Google)
- [ ] Create login/signup pages
- [ ] Implement auth state management
- [ ] Test authentication flow
- [ ] Create protected dashboard route

### Day 4 - Dashboard Shell
- [ ] Create basic dashboard layout
- [ ] Add navigation/sidebar
- [ ] Add placeholder sections for tweets and analytics
- [ ] Make it look decent with Tailwind

### Day 5 - Twitter OAuth Setup
- [ ] Apply for Twitter/X API access (can take a few days)
- [ ] Read X API docs on authentication
- [ ] Set up API keys in environment variables
- [ ] Test API connection

### Day 6 - Twitter Connection UI
- [ ] Add "Connect Twitter" button to dashboard
- [ ] Create Twitter OAuth flow (start basic)
- [ ] Store Twitter tokens in Firestore
- [ ] Show connected status

### Day 7 - Rest/Buffer
- [ ] Catch up on any incomplete tasks
- [ ] Test everything end-to-end
- [ ] Fix any bugs
- [ ] Review progress

---

## Week 2: Twitter Integration

### Day 8 - Fetch Tweets
- [ ] Write function to fetch user's recent tweets
- [ ] Create tweets collection in Firestore
- [ ] Store 10 most recent tweets
- [ ] Test with your own Twitter account

### Day 9 - Display Tweets
- [ ] Show tweets in dashboard
- [ ] Display: text, date, basic metrics
- [ ] Add simple styling
- [ ] Make it responsive

### Day 10 - Tweet Metrics
- [ ] Fetch likes, retweets, replies from X API
- [ ] Store metrics in Firestore
- [ ] Display metrics next to each tweet
- [ ] Add icons for each metric type

### Day 11 - Auto-sync Tweets
- [ ] Add "Refresh Tweets" button
- [ ] Update tweet metrics on refresh
- [ ] Show last synced timestamp
- [ ] Add loading state

### Day 12 - Analytics Connection UI
- [ ] Add section for "Connect Analytics"
- [ ] Research Google Analytics API
- [ ] Start OAuth setup for GA (if using)
- [ ] Create connection flow UI

### Day 13 - Analytics Schema
- [ ] Create conversions collection in Firestore
- [ ] Plan what data to track (signups, purchases, etc.)
- [ ] Write seed data for testing
- [ ] Test Firestore queries

### Day 14 - Rest/Buffer
- [ ] Review week's progress
- [ ] Clean up code
- [ ] Deploy latest changes
- [ ] Fix any bugs

---

## Week 3: Attribution MVP

### Day 15 - Manual Event Input
- [ ] Create "Add Conversion" form (manual for now)
- [ ] Fields: email, timestamp, event type
- [ ] Save to Firestore
- [ ] Display added conversions

### Day 16 - Basic Attribution Logic
- [ ] Write function: "Find tweets posted before conversion"
- [ ] Use 24-hour window
- [ ] Test with sample data
- [ ] Handle edge cases

### Day 17 - Show Attribution
- [ ] Display conversion count next to tweets
- [ ] Add "X signups attributed" badge
- [ ] Make it clickable to see details
- [ ] Add visual indicators

### Day 18 - Conversion Details Page
- [ ] Create page showing all conversions
- [ ] Show: user, timestamp, attributed tweet
- [ ] Add basic filtering
- [ ] Make it sortable

### Day 19 - Time Window Settings
- [ ] Add settings page
- [ ] Let user adjust attribution window (6hr, 12hr, 24hr, 48hr)
- [ ] Save preference to Firestore
- [ ] Apply to attribution logic

### Day 20 - Confidence Scores
- [ ] Calculate simple confidence % (closer in time = higher confidence)
- [ ] Display confidence next to attributions
- [ ] Add tooltip explaining calculation
- [ ] Use color coding (green/yellow/red)

### Day 21 - Rest/Buffer
- [ ] Test attribution with real scenarios
- [ ] Fix edge cases
- [ ] Update dashboard design
- [ ] Get feedback from a friend

---

## Week 4: Analytics Integration

### Day 22 - Google Analytics Setup
- [ ] Complete GA OAuth
- [ ] Fetch basic site metrics
- [ ] Display in dashboard
- [ ] Test with your own GA account

### Day 23 - Track Signups from GA
- [ ] Pull signup/conversion events from GA
- [ ] Store in Firestore conversions collection
- [ ] Replace manual entry
- [ ] Verify data accuracy

### Day 24 - Auto-sync Analytics
- [ ] Use Firebase Cloud Functions for scheduled tasks
- [ ] Fetch new conversions every hour
- [ ] Match with tweets automatically
- [ ] Log sync status

### Day 25 - Attribution Dashboard
- [ ] Show total conversions this week/month
- [ ] Show top 5 performing tweets
- [ ] Add simple bar chart
- [ ] Make it visually appealing

### Day 26 - Revenue Tracking
- [ ] Add revenue field to conversions in Firestore
- [ ] Calculate revenue per tweet
- [ ] Show $ earned next to tweets
- [ ] Add total revenue widget

### Day 27 - Date Range Filter
- [ ] Add date picker to dashboard
- [ ] Filter tweets and conversions by range
- [ ] Update all metrics accordingly
- [ ] Save last selected range

### Day 28 - Rest/Buffer
- [ ] Polish UI/UX
- [ ] Get feedback from friend/beta tester
- [ ] Fix biggest pain points
- [ ] Optimize performance

---

## Week 5: Polish & Features

### Day 29 - Export Feature
- [ ] Add "Export to CSV" button
- [ ] Generate CSV of tweet performance
- [ ] Test download
- [ ] Include all relevant metrics

### Day 30 - Email Digest
- [ ] Set up email service (Resend or SendGrid)
- [ ] Create weekly summary email template
- [ ] Send test email
- [ ] Schedule weekly sends

### Day 31 - Best Time to Post
- [ ] Analyze tweet timestamps vs conversions
- [ ] Show "Your best posting times" widget
- [ ] Simple bar chart by hour of day
- [ ] Add day of week analysis

### Day 32 - Content Insights
- [ ] Analyze tweet length vs conversions
- [ ] Show what works: short vs long, questions vs statements
- [ ] Display simple tips
- [ ] Add content type categorization

### Day 33 - Onboarding Flow
- [ ] Create step-by-step setup wizard
- [ ] 1) Connect Twitter, 2) Connect Analytics, 3) Done
- [ ] Add progress indicator
- [ ] Make it skippable

### Day 34 - Help Documentation
- [ ] Write simple FAQ page
- [ ] Add tooltips to confusing features
- [ ] Create quick start guide
- [ ] Add video walkthrough (optional)

### Day 35 - Rest/Buffer
- [ ] Overall app testing
- [ ] Performance check
- [ ] Security review
- [ ] Fix critical bugs

---

## Week 6: Monetization & Launch Prep

### Day 36 - Stripe Setup
- [ ] Create Stripe account
- [ ] Set up products/pricing
- [ ] Test checkout flow
- [ ] Configure webhooks

### Day 37 - Subscription Logic
- [ ] Add subscription status to user document in Firestore
- [ ] Gate features by plan (free vs paid)
- [ ] Show upgrade prompts
- [ ] Handle Stripe webhooks with Firebase Functions

### Day 38 - Billing Dashboard
- [ ] Show current plan in settings
- [ ] Add "Manage Subscription" button
- [ ] Link to Stripe customer portal
- [ ] Display billing history

### Day 39 - Usage Limits
- [ ] Set limits: free = 50 tweets, paid = unlimited
- [ ] Enforce limits in code
- [ ] Show usage in dashboard
- [ ] Add upgrade CTA when limit reached

### Day 40 - Invite Waitlist
- [ ] Email first 10 people from Kit waitlist
- [ ] Offer free beta access
- [ ] Collect initial feedback
- [ ] Fix urgent issues

### Day 41 - Bug Fixes
- [ ] Fix reported issues
- [ ] Improve error messages
- [ ] Add loading states
- [ ] Polish final details

### Day 42 - Launch Day! 🚀
- [ ] Final testing
- [ ] Post on Twitter
- [ ] Email remaining waitlist
- [ ] Monitor for issues
- [ ] Celebrate!

---

## Tech Stack Summary

**Frontend:**
- React (or Next.js if you prefer)
- Tailwind CSS
- React Router (for routing)

**Backend & Database:**
- Firebase Firestore (NoSQL database)
- Firebase Cloud Functions (serverless backend)
- Firebase Hosting (static site hosting)

**Authentication:**
- Firebase Authentication (Email/Password + Google OAuth)

**Integrations:**
- Twitter/X API v2
- Google Analytics API
- Stripe (payments)
- Firebase Extensions for Stripe
- SendGrid/Resend (emails via Cloud Functions)

**Tools:**
- GitHub (version control)
- Firebase CLI (deployment)
- Firebase Console (management)

---

## Key Features (MVP)

1. ✅ Twitter account connection
2. ✅ Automatic tweet syncing
3. ✅ Analytics integration (GA)
4. ✅ Time-window attribution
5. ✅ Confidence scoring
6. ✅ Revenue tracking
7. ✅ Performance dashboard
8. ✅ Best times to post insights
9. ✅ Content performance insights
10. ✅ Export to CSV
11. ✅ Weekly email digests
12. ✅ Stripe billing

---

## Attribution Logic (Core Value)

**Time-Window Correlation (MVP approach):**

1. User connects Twitter → fetch their tweets with timestamps
2. User connects Analytics → fetch signup/conversion events with timestamps
3. For each conversion, look back X hours (user configurable: 6-48 hours)
4. Find all tweets posted during that window
5. Assign attribution with confidence score:
   - **High confidence (green):** Tweet posted 0-4 hours before conversion
   - **Medium confidence (yellow):** Tweet posted 4-12 hours before conversion
   - **Low confidence (gray):** Tweet posted 12-48 hours before conversion

**Future enhancements:**
- Browser extension for direct tracking
- UTM parameter injection
- Pixel-based tracking
- Multi-touch attribution

---

## Pricing Ideas

**Free Tier:**
- 50 tweets tracked
- 1 Twitter account
- Basic analytics
- 7-day data retention

**Pro - $29/month:**
- Unlimited tweets
- 3 Twitter accounts
- Advanced insights
- 90-day data retention
- CSV export
- Email reports

**Teams - $99/month:**
- Everything in Pro
- 10 Twitter accounts
- 1-year data retention
- API access
- Priority support

---

## Marketing Plan

**Pre-launch:**
- [x] Landing page live
- [x] Email waitlist
- [ ] Tweet progress daily (#buildinpublic)
- [ ] Share dashboard mockups
- [ ] Tease features

**Launch:**
- [ ] Product Hunt launch
- [ ] Twitter announcement thread
- [ ] Email waitlist with early access
- [ ] Indie Hackers post
- [ ] Reddit (r/SaaS, r/entrepreneur)

**Post-launch:**
- [ ] Weekly feature updates
- [ ] User testimonials
- [ ] Case studies
- [ ] SEO content
- [ ] YouTube tutorials

---

## Success Metrics

**Week 1-2:**
- [ ] App deployed and accessible
- [ ] Twitter OAuth working
- [ ] First tweets displayed

**Week 3-4:**
- [ ] Attribution logic working
- [ ] Analytics connected
- [ ] First real conversions tracked

**Week 5-6:**
- [ ] 10 beta users onboarded
- [ ] Stripe payments working
- [ ] First paying customer

**Month 2-3:**
- [ ] 50 users
- [ ] $500 MRR
- [ ] Net Promoter Score > 40

**Month 4-6:**
- [ ] 200 users
- [ ] $2,000 MRR
- [ ] Break even on costs

---

## Notes & Tips

- **Don't over-engineer:** Start simple, iterate based on feedback
- **Ship fast:** Better to launch with 80% than wait for 100%
- **Use buffer days:** Life happens, use them to catch up
- **Get feedback early:** Show beta users as soon as possible
- **Document everything:** Write docs as you build, not after
- **Track metrics:** Know your numbers from day 1
- **Stay focused:** Don't add features until core attribution works perfectly

---

## Resources

**Firebase:**
- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

**Twitter API:**
- [Developer Portal](https://developer.twitter.com/)
- [API Documentation](https://developer.twitter.com/en/docs/twitter-api)

**Google Analytics:**
- [GA4 API](https://developers.google.com/analytics/devguides/reporting/data/v1)

**React:**
- [Official Docs](https://react.dev/)
- [React Router](https://reactrouter.com/)

**Stripe:**
- [Checkout](https://stripe.com/docs/checkout)
- [Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Firebase Extension for Stripe](https://firebase.google.com/products/extensions/firestore-stripe-payments)

---

**Start Date:** _____________
**Target Launch:** _____________

Good luck! 🚀

*Remember: Done is better than perfect. Ship it!*
