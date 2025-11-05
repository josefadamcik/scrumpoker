# 🃏 Scrum Poker

A simple, serverless planning poker application for agile teams. Built with Next.js 15, TypeScript, and Supabase Real-Time.

> **📌 Note**: This uses **Supabase Real-Time** with WebSocket-based instant updates. For the polling version with Upstash Redis, see the [`serverless-polling`](https://github.com/josefadamcik/scrumpoker/tree/serverless-polling) branch.

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

## Setup

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings
4. Click **Deploy**

The initial deployment will succeed but won't have a database yet.

### 3. Connect Supabase via Vercel Marketplace

1. In your Vercel project, go to the **Storage** tab
2. Click **Connect Store**
3. Select **Supabase** from the marketplace
4. Choose one of the options:
   - **Create new Supabase project** (easiest - Vercel manages it)
   - **Connect existing Supabase account**
5. Configure your database:
   - Project name: `scrumpoker`
   - Region: (choose closest to you)
   - Plan: Free tier
6. Click **Connect**

Vercel will automatically:
- Provision the Supabase project (if creating new)
- Inject environment variables into your project
- Trigger a new deployment

### 4. Set Up Database Schema

1. Go to your Supabase dashboard (link in Vercel Storage tab)
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase-schema.sql` from this repo
5. Click **Run**

This creates the `sessions` table and enables real-time subscriptions.

### 5. Enable Real-Time

1. In Supabase dashboard, go to **Database** → **Replication**
2. Find the `sessions` table in the list
3. Toggle **Real-time** to ON

### 6. Local Development

```bash
# Install dependencies
npm install

# Pull environment variables from Vercel
vercel env pull .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

The app requires these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**These are automatically set** when you connect Supabase via Vercel Marketplace (Step 3).

**For local development**: Use `vercel env pull .env.local` to sync from Vercel.

## How to Use

1. **Create a Session**
   - Enter your nickname
   - Click "Create New Session"
   - Share the URL with your team

2. **Join a Session**
   - Open the shared link
   - Enter a nickname or get a random one
   - Click "Join Session"

3. **Vote**
   - Click on a card to vote
   - Change your vote anytime before reveal
   - Others see you voted but not your choice

4. **Reveal & Reset** (Creator Only)
   - Click "Reveal Votes" to show everyone's cards
   - View statistics (average, min, max)
   - Click "Reset Round" to start new estimation

## How Real-Time Works

When someone votes:
1. API route updates Supabase database (HTTP)
2. PostgreSQL triggers a notification
3. Supabase Realtime Server broadcasts via WebSocket
4. All connected browsers receive update instantly

No polling needed - updates are pushed when they happen!

## Project Structure

```
scrumpoker/
├── app/
│   ├── api/
│   │   └── session/              # API routes for session management
│   ├── session/[id]/page.tsx     # Voting room with real-time subscriptions
│   └── page.tsx                  # Landing page
├── lib/
│   ├── supabase.ts               # Server-side Supabase client
│   ├── supabase-client.ts        # Browser Supabase client (with real-time)
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utility functions
└── supabase-schema.sql           # Database schema
```

## Costs

Everything runs on free tiers:

- **Vercel Hosting**: Free tier
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS

- **Supabase**: Free tier
  - 500 MB database
  - 2 GB bandwidth
  - 50,000 monthly active users
  - 200 concurrent real-time connections

## Troubleshooting

### Session not found
- Session expired (24-hour TTL)
- Create a new session

### Real-time not working
1. Check Realtime is enabled: Database → Replication → `sessions` table
2. Check browser console for subscription status
3. Verify environment variables are set

### Environment variables not working
```bash
# Pull latest from Vercel
vercel env pull .env.local

# Restart dev server
npm run dev
```

## License

MIT

---

Built with ❤️ using Claude Code
