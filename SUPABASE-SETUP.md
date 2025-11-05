# 🔥 Supabase Real-Time Setup Guide

This branch demonstrates how to use **Supabase Real-Time subscriptions** instead of polling for live updates.

## What's Different?

### Redis + Polling (main branch)
```typescript
// Poll every 2 seconds
setInterval(fetchSession, 2000);
```
- ✅ Simple, serverless-friendly
- ✅ Works everywhere
- ⚠️ 2-second delay for updates
- ⚠️ Wastes bandwidth on unchanged data

### Supabase + Real-Time (this branch)
```typescript
// Subscribe to live updates
supabaseClient
  .channel(`session:${sessionId}`)
  .on('postgres_changes', {...})
  .subscribe();
```
- ✅ **Instant** push updates (WebSocket)
- ✅ Only sends data when it changes
- ✅ Learn modern real-time tech
- ⚠️ More complex setup
- ⚠️ Additional service to manage

## How Supabase Real-Time Works

### Architecture

```
┌──────────────────────────────────────────────┐
│ Browser (Client)                             │
│                                              │
│  1. User votes "5"                           │
│     ↓                                        │
│  2. POST /api/session/xxx/vote               │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Vercel Serverless Function                   │
│                                              │
│  3. Update Supabase via HTTP REST API        │
│     supabase.from('sessions').update(...)    │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Supabase (PostgreSQL + Realtime Server)     │
│                                              │
│  4. Database updated                         │
│  5. Realtime Server detects change           │
│  6. Broadcasts to all subscribers            │
│     via WebSocket                            │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ All Connected Browsers                       │
│                                              │
│  7. Receive update instantly!                │
│     No polling needed                        │
│     UI updates in real-time                  │
└──────────────────────────────────────────────┘
```

### The Magic: PostgreSQL's `LISTEN/NOTIFY`

Supabase uses PostgreSQL's built-in pub/sub:
1. Database change happens
2. PostgreSQL triggers a `NOTIFY` event
3. Supabase Realtime Server receives it
4. Broadcasts via WebSocket to subscribed clients

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project
   - Choose a name (e.g., "scrumpoker")
   - Set a strong database password
   - Select a region (closest to your users)
   - Free tier is perfect for this!

5. Wait ~2 minutes for project to provision

### 2. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase-schema.sql` from this repo
4. Paste into the editor
5. Click **Run**

This creates:
- `sessions` table with JSON support for participants
- Row Level Security (RLS) policies
- Indexes for performance
- **Real-time publication** (the key part!)

### 3. Enable Real-Time (Double-Check)

1. Go to **Database** → **Replication**
2. Find the `sessions` table
3. Make sure "Real-time" is **enabled** (toggle on)
4. This allows clients to subscribe to changes

### 4. Get Your API Keys

1. Go to **Settings** → **API**
2. Find these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (keep this secret!)
```

### 5. Configure Environment Variables

Create `.env.local` in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

**Important**:
- `NEXT_PUBLIC_*` vars are exposed to the browser (safe for anon key)
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only (never exposed)

### 6. Run the App

```bash
npm run dev
```

Open http://localhost:3000 and test!

### 7. Test Real-Time Updates

1. Open the app in **two browser windows** side-by-side
2. Create a session in window 1
3. Copy the URL and open in window 2
4. Join in both windows
5. **Vote in one window**
6. **Watch the other window update INSTANTLY!** 🔥

Check your browser console - you'll see:
```
🔌 Setting up real-time subscription for session: xxx
📡 Subscription status: SUBSCRIBED
🔥 Real-time update received: {...}
```

## Code Comparison

### Before (Polling)

```typescript
// app/session/[id]/page.tsx
useEffect(() => {
  const interval = setInterval(fetchSession, 2000);
  return () => clearInterval(interval);
}, [hasJoined, sessionId]);
```

### After (Real-Time)

```typescript
// app/session/[id]/page.tsx
useEffect(() => {
  const channel = supabaseClient
    .channel(`session:${sessionId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'sessions',
      filter: `id=eq.${sessionId}`,
    }, (payload) => {
      setSession(convertToSession(payload.new));
    })
    .subscribe();

  return () => {
    supabaseClient.removeChannel(channel);
  };
}, [hasJoined, sessionId]);
```

## How It Works Under the Hood

### 1. Client Subscribes
```typescript
supabaseClient.channel(`session:${sessionId}`).subscribe()
```
- Opens WebSocket connection to Supabase Realtime Server
- Sends filter: `id=eq.${sessionId}`
- Server remembers this client cares about this session

### 2. User Votes
```typescript
await supabase.from('sessions').update({ participants })
```
- API route updates database via HTTP
- PostgreSQL executes UPDATE
- Triggers internal notification

### 3. Real-Time Broadcast
- Realtime Server detects DB change
- Checks: "Who subscribed to this row?"
- Sends update via WebSocket to all subscribers
- **No polling needed!**

### 4. Client Receives Update
```typescript
.on('postgres_changes', (payload) => {
  setSession(payload.new); // Update React state
})
```
- UI re-renders instantly
- All participants see the change simultaneously

## Debugging Tips

### Check Subscription Status

Open browser console and look for:
```javascript
// Good
📡 Subscription status: SUBSCRIBED

// Bad - check your RLS policies
📡 Subscription status: TIMED_OUT
```

### Enable Verbose Logging

In `lib/supabase-client.ts`:
```typescript
export const supabaseClient = createClient(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    log_level: 'debug', // Add this
  },
});
```

### Common Issues

**1. Not receiving updates**
- Check Realtime is enabled in Database → Replication
- Verify RLS policies allow reading
- Check browser console for errors

**2. "TIMED_OUT" status**
- Usually RLS policy blocking
- Make sure `SELECT` policy exists and allows access

**3. Multiple duplicate updates**
- Normal! Supabase may send initial state
- Use React's dependency array carefully

## Deployment to Vercel

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

Vercel serverless functions work perfectly with Supabase.

## Costs (Free Tier)

**Supabase Free Tier Includes**:
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- Realtime connections: 200 concurrent
- **Perfect for learning and small teams!**

## Why This is Cool for Learning

### You Learn About:

1. **WebSockets** - Persistent bidirectional connections
2. **Pub/Sub patterns** - Event-driven architecture
3. **PostgreSQL real-time** - Database-driven events
4. **Client-server communication** - Beyond REST APIs
5. **State synchronization** - Multi-client real-time apps

### Real-World Use Cases:

- Chat applications
- Collaborative editing (like Google Docs)
- Live dashboards
- Multiplayer games
- Live sports scores
- Stock tickers

## Comparison: Polling vs Real-Time

| Feature | Polling (Redis) | Real-Time (Supabase) |
|---------|----------------|---------------------|
| **Update Speed** | 2 seconds | Instant (<100ms) |
| **Server Load** | Constant requests | Only on changes |
| **Bandwidth** | High (lots of unchanged data) | Low (only changes) |
| **Setup Complexity** | Simple ⭐ | Moderate ⭐⭐⭐ |
| **Serverless Friendly** | Perfect ✅ | Works well ✅ |
| **Learning Value** | Good | Excellent |
| **Scalability** | Good | Excellent |

## Next Steps for Experimentation

Want to explore more? Try:

1. **Presence** - Show who's currently online
   ```typescript
   channel.on('presence', { event: 'sync' }, ...)
   ```

2. **Broadcast** - Send messages between clients
   ```typescript
   channel.send({ type: 'broadcast', event: 'cursor', payload })
   ```

3. **Insert events** - React to new sessions being created
   ```typescript
   .on('postgres_changes', { event: 'INSERT', ... })
   ```

## Conclusion

This branch demonstrates that real-time subscriptions are:
- ✅ Possible with Next.js and Vercel
- ✅ Not that hard to set up
- ✅ Provide much better UX
- ✅ Great for learning modern real-time patterns

But for a simple planning poker app, polling is actually fine! This is about **exploring technology**, not necessarily the "best" solution for this specific use case.

---

## Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Postgres LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

Happy experimenting! 🚀
