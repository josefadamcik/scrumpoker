# 🃏 Scrum Poker

A simple, serverless planning poker application for agile teams. Built with Next.js 15, TypeScript, and Vercel KV.

## Features

- ✅ Create instant sessions with shareable links
- ✅ Random nickname generation or custom nicknames
- ✅ Real-time voting with polling updates
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
- **Database**: Vercel KV (Upstash Redis)
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

3. **Set up Vercel KV**

   You have two options:

   **Option A: Use Vercel CLI (Recommended)**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Link your project
   vercel link

   # Create a KV database
   # Go to https://vercel.com/dashboard/stores
   # Click "Create Database" → "KV" → Follow the wizard

   # Pull environment variables
   vercel env pull .env.local
   ```

   **Option B: Manual Setup**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard/stores)
   - Click "Create Database" → "KV"
   - Name it (e.g., "scrumpoker-kv")
   - Copy the environment variables
   - Create `.env.local` file and paste them:
     ```env
     KV_URL="..."
     KV_REST_API_URL="..."
     KV_REST_API_TOKEN="..."
     KV_REST_API_READ_ONLY_TOKEN="..."
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
   - Click "Deploy"

3. **Connect Vercel KV**
   - After deployment, go to your project settings
   - Click "Storage" tab
   - Click "Connect Store" → Select your KV database
   - Or create a new one directly from here
   - Vercel will automatically inject the environment variables

4. **Redeploy (if needed)**
   - If you created the KV database after first deploy
   - Go to "Deployments" tab
   - Click "..." on the latest deployment → "Redeploy"

### Manual Deploy with CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Environment Variables

Required for production:

```env
KV_URL=                           # Vercel KV connection URL
KV_REST_API_URL=                  # REST API endpoint
KV_REST_API_TOKEN=                # Write token
KV_REST_API_READ_ONLY_TOKEN=      # Read-only token
```

These are automatically set when you connect Vercel KV storage to your project.

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
- Vercel KV (Upstash Redis) handles all data
- Sessions auto-expire after 24 hours
- No database migrations needed

## Costs

Everything runs on free tiers:

- **Vercel Hosting**: Free tier includes
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS

- **Vercel KV**: Free tier includes
  - 256 MB storage
  - 10,000 commands/day
  - More than enough for small to medium teams

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
- Check your KV environment variables are set correctly
- Ensure KV database is connected in Vercel dashboard
- Verify the KV store wasn't deleted

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

## Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using Claude Code
