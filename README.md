# 🃏 Scrum Poker

A simple, serverless planning poker application for agile teams. Built with Next.js 15, TypeScript, and Supabase Real-Time.

> **📌 Note**: This is the **Supabase Real-Time experimental branch**.
> For the production-ready version using Redis + polling, see the `main` branch.
>
> **Want to learn about real-time WebSocket subscriptions?** Check out [SUPABASE-SETUP.md](./SUPABASE-SETUP.md)

## Features

- ✅ Create instant sessions with shareable links
- ✅ Random nickname generation or custom nicknames
- ✅ **Real-time voting with WebSocket subscriptions** (instant updates!)
- ✅ Standard planning poker cards (0, 1, 2, 3, 5, 8, 13, 21, ?, ☕)
- ✅ See who voted and who hasn't
- ✅ Reveal votes and see statistics
- ✅ Reset votes for new rounds
- ✅ Sessions auto-expire after 24 hours
- ✅ Dark mode support
- ✅ Fully responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Real-Time)
- **Deployment**: Vercel (serverless)

## Local Development

### Prerequisites

- Node.js 18+ and npm
- A Vercel account (free tier works great)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd scrumpoker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Upstash Redis via Vercel Marketplace**

   **Option A: Via Vercel Dashboard (Recommended - Easiest)**

   1. Push your code to GitHub first (see step 1 in "Deployment to Vercel" section below)
   2. Go to [Vercel](https://vercel.com/new) and import your repository
   3. After deployment, go to your project
   4. Click the "Storage" tab
   5. Click "Connect Store"
   6. Select "Upstash Redis" from the marketplace
   7. Choose "Let Vercel manage my Upstash account" (simplest option)
   8. Configure your database (name, region, plan - free tier is perfect)
   9. Click "Connect"
   10. Vercel will automatically inject the environment variables and redeploy

   **Option B: Via Vercel CLI with Existing Upstash Account**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Link your project
   vercel link

   # Go to https://vercel.com/marketplace/upstash
   # Install the Upstash integration
   # Connect your existing Upstash account or create a new database

   # Pull environment variables
   vercel env pull .env.local
   ```

   **Option C: Manual Upstash Setup (For local development)**

   If you want to set up a separate database for local development:
   1. Go to [Upstash Console](https://console.upstash.com/)
   2. Create a free account
   3. Create a new Redis database
   4. Copy the REST API credentials
   5. Create `.env.local` file:
      ```env
      UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
      UPSTASH_REDIS_REST_TOKEN="your-token-here"
      ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### Quick Deploy (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Deploy to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy" (initial deployment will work, but needs database connection)

3. **Connect Upstash Redis from Vercel Marketplace**
   - After deployment, go to your project
   - Click the "Storage" tab
   - Click "Connect Store"
   - Select "Upstash Redis" from the marketplace
   - Choose "Let Vercel manage my Upstash account" (easiest)
     - OR connect your existing Upstash account
   - Configure database settings (name, region, free plan)
   - Click "Connect"
   - Vercel will automatically inject environment variables and redeploy

That's it! Your app is now live with a working Redis database.

### Manual Deploy with CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Environment Variables

Required for the app to work:

```env
UPSTASH_REDIS_REST_URL=           # Upstash Redis REST API URL
UPSTASH_REDIS_REST_TOKEN=         # Upstash Redis REST API token
```

**Important Notes:**
- These are **automatically set** when you connect Upstash Redis via Vercel Marketplace
- For local development, either:
  - Use `vercel env pull .env.local` to sync from your Vercel project
  - Or create your own Upstash database at [console.upstash.com](https://console.upstash.com/) and add credentials to `.env.local`
- The `@upstash/redis` package reads these environment variables automatically via `Redis.fromEnv()`

## How to Use

1. **Create a Session**
   - Open the app homepage
   - Click "Create New Session"
   - Share the URL with your team

2. **Join a Session**
   - Open the shared link
   - Enter a nickname or get a random one
   - Click "Join Session"

3. **Vote**
   - Click on a card to vote
   - You can change your vote anytime before reveal
   - Others can see you voted but not your choice

4. **Reveal & Reset** (Creator Only)
   - Click "Reveal Votes" to show everyone's cards
   - View statistics (average, min, max)
   - Click "Reset Round" to start a new estimation

## Project Structure

```
scrumpoker/
├── app/
│   ├── api/
│   │   └── session/
│   │       ├── route.ts              # Create session
│   │       └── [id]/
│   │           ├── route.ts          # Get session
│   │           ├── join/route.ts     # Join session
│   │           ├── vote/route.ts     # Submit vote
│   │           ├── reveal/route.ts   # Reveal votes
│   │           └── reset/route.ts    # Reset round
│   ├── session/[id]/
│   │   └── page.tsx                  # Voting room UI
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── lib/
│   ├── types.ts                      # TypeScript types
│   ├── redis.ts                      # Redis client wrapper
│   └── utils.ts                      # Utility functions
└── package.json
```

## Features Explained

### Session Management
- Sessions are stored in Redis with a 24-hour TTL
- Each session has a unique ID (12-character nanoid)
- Creator gets special permissions (reveal/reset)

### Real-time Updates
- Polling every 2 seconds when in a session
- Lightweight approach, no WebSocket needed
- Works reliably with serverless functions

### Data Persistence
- Upstash Redis handles all data storage
- Sessions auto-expire after 24 hours (Redis TTL)
- No database migrations needed
- Fully serverless and managed

## Costs

Everything runs on free tiers:

- **Vercel Hosting**: Free tier includes
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS

- **Upstash Redis**: Free tier includes
  - 10,000 commands/day
  - 256 MB max data size
  - Max 100 concurrent connections
  - Perfect for small to medium teams

## Troubleshooting

### "Session not found" error
- Session expired (24-hour TTL)
- Create a new session

### Environment variables not working
```bash
# Pull latest env vars from Vercel
vercel env pull .env.local

# Restart dev server
npm run dev
```

### Redis connection errors
- Check your Upstash environment variables are set correctly
- Ensure Upstash Redis is connected in Vercel dashboard (Storage tab)
- Verify the database wasn't deleted
- For local dev, make sure you've run `vercel env pull .env.local`

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

## Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using Claude Code
