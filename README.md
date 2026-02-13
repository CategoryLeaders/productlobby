# ProductLobby

A demand aggregation platform where consumers create campaigns for products or product changes, others pledge support and buying intent, and brands can engage with binding offers.

## Features

- **Campaign Creation**: Create variant or feature request campaigns targeting specific brands
- **Pledge System**: Support pledges (fast, viral) and Intent pledges (price ceiling, timeframe)
- **Brand Verification**: Domain email or DNS TXT verification for brand ownership
- **Binding Offers**: All-or-nothing offers with on-platform payments
- **Signal Score**: Algorithm to rank campaigns and notify brands of high demand
- **Creator Rewards**: Campaign creators earn a share of platform fees

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **State Management**: React Query + Zustand
- **Payments**: Stripe Connect
- **Email**: Resend
- **SMS**: Twilio

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Stripe account
- Resend API key
- Twilio account (for SMS)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/productlobby.git
cd productlobby
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
crowdlobby/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── (main)/            # Main app routes
│   │   ├── admin/             # Admin dashboard
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities and services
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types
├── prisma/                    # Database schema
└── public/                    # Static assets
```

## Configuration

Key configuration values in `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `RESEND_API_KEY` | Resend email API key |
| `PLATFORM_FEE_PERCENT` | Platform fee (default: 0.03 = 3%) |
| `CREATOR_SHARE_PERCENT` | Creator share of fee (default: 0.10 = 10%) |

## Signal Score Algorithm

Campaigns are ranked using a signal score formula:

```
SignalScore = 18 * log10(1 + DemandValue) +
               8 * log10(1 + WeightedIntent) +
               3 * log10(1 + Support) +
               6 * Momentum -
              20 * FraudRisk
```

Thresholds:
- **35+**: Eligible for "Trending"
- **55+**: Notify targeted brand
- **70+**: "High Signal" highlight
- **80+**: Suggest offer prompts

## API Endpoints

### Authentication
- `POST /api/auth/magic-link` - Send magic link
- `POST /api/auth/verify` - Verify magic link
- `POST /api/auth/logout` - End session
- `POST /api/auth/phone/send` - Send SMS code
- `POST /api/auth/phone/verify` - Verify SMS code

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PATCH /api/campaigns/:id` - Update campaign
- `POST /api/campaigns/:id/pledges` - Add pledge

### Brands
- `GET /api/brands` - Search brands
- `POST /api/brands` - Create brand
- `POST /api/brands/:id/claim` - Start verification
- `POST /api/brands/:id/verify` - Complete verification

### Offers
- `GET /api/offers/:id` - Get offer details
- `POST /api/offers/:id/checkout` - Start checkout

## License

Proprietary - All rights reserved.
