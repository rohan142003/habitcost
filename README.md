# HabitCost - SaaS Habit Cost Calculator

A web app that shows the "real cost" of habits (coffee, Uber, subscriptions, takeout) by visualizing spending in terms of money AND time worked.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js v5
- **UI**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **AI**: Anthropic Claude API
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- Stripe account (for payments)
- Google OAuth credentials (for authentication)
- Anthropic API key (for AI insights)

### Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd habit-cost-calculator
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables:

```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`

5. Generate and push the database schema:

```bash
npm run db:push
```

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Features

### Habit Tracking
- Create habits by category (coffee, transport, food, subscriptions, etc.)
- Log spending entries with amount, date, optional notes
- Quick-add for frequent purchases

### Cost Visualizations
- **Time Cost**: Convert spending to hours of work (based on hourly wage)
- **Projections**: Weekly/monthly/yearly/5-year spending forecasts
- **Opportunity Cost**: "This could be a vacation" comparisons
- **Charts**: Spending trends, category breakdowns

### Goal Setting
- Savings goals (e.g., "Save $500 for vacation")
- Reduction goals (e.g., "Reduce coffee spending by 30%")
- Milestone tracking and celebrations

### AI Insights (Claude API)
- Pattern detection ("You spend 40% more on Mondays")
- Actionable suggestions ("Making coffee at home saves $50/mo")
- Predictions and progress celebrations

### Social Features
- Friend connections (privacy-first)
- Share progress cards (percentages, not dollars)
- Anonymous comparisons

### Monetization (Stripe)

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 5 habits, 100 entries/mo, 10 AI insights/mo |
| Pro | $5.99/mo | 25 habits, unlimited entries, 100 insights/mo |
| Premium | $12.99/mo | Unlimited everything, API access, family sharing |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, register pages
│   ├── (dashboard)/      # Protected app pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── habits/       # Habit management
│   │   ├── goals/        # Goal tracking
│   │   ├── insights/     # AI insights
│   │   ├── social/       # Friends & sharing
│   │   └── settings/     # User settings, billing
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn components
│   ├── dashboard/        # Dashboard widgets
│   ├── charts/           # Chart components
│   └── ...
├── lib/
│   ├── db/               # Database client & schema
│   ├── auth/             # NextAuth config
│   ├── calculations/     # Time cost, projections
│   ├── ai/               # Claude API integration
│   └── stripe/           # Payment handling
└── hooks/                # Custom React hooks
```

## Database Commands

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Key Calculations

### Time Cost
```typescript
hoursWorked = amount / hourlyWage
// $5 coffee at $25/hr = 12 minutes of work
```

### 5-Year Projection (with investment growth)
```typescript
// Monthly contribution compounded at 7% annual
futureValue = monthly * ((1 + 0.07/12)^60 - 1) / (0.07/12)
// $100/mo on coffee = $6,977 in 5 years
```

## Environment Variables

```
DATABASE_URL          - PostgreSQL connection string
NEXTAUTH_SECRET       - Random secret for NextAuth
NEXTAUTH_URL          - Your app URL
GOOGLE_CLIENT_ID      - Google OAuth client ID
GOOGLE_CLIENT_SECRET  - Google OAuth client secret
ANTHROPIC_API_KEY     - Anthropic Claude API key
STRIPE_SECRET_KEY     - Stripe secret key
STRIPE_WEBHOOK_SECRET - Stripe webhook secret
STRIPE_PRO_PRICE_ID   - Stripe price ID for Pro plan
STRIPE_PREMIUM_PRICE_ID - Stripe price ID for Premium plan
NEXT_PUBLIC_APP_URL   - Public app URL for Stripe redirects
```

## License

MIT
