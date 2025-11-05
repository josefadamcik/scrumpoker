# 🃏 Scrum Poker

A simple, serverless planning poker application for agile teams. Built with Next.js 15, TypeScript, and Supabase Real-Time.

> **📌 Note**: This is the **Supabase Real-Time experimental branch** with WebSocket-based instant updates.

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

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `scrumpoker`
   - Database Password: (generate a strong password)
   - Region: (choose closest to you)
4. Wait ~2 minutes for provisioning

### 2. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run**

This creates the `sessions` table and enables real-time subscriptions.

### 3. Enable Real-Time

1. Go to **Database** → **Replication**
2. Find the `sessions` table
3. Toggle **Real-time** to ON

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project (or create new)
vercel link

# Deploy
vercel --prod
```

### 5. Add Environment Variables to Vercel

1. Get your Supabase credentials from **Settings** → **API**:
   - Project URL
   - `anon` public key
   - `service_role` secret key

2. Add them to Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

3. Redeploy:
   ```bash
   vercel --prod
   ```

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

**Get them from**: Supabase Dashboard → Settings → API

**Set them with**: `vercel env add` (see setup step 5)

**Pull locally**: `vercel env pull .env.local`

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
