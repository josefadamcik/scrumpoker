# Scrum Poker - Requirements & Design Document

## 1. Project Overview

### 1.1 Purpose
Scrum Poker is a serverless web application that enables distributed agile teams to perform planning poker estimation sessions in real-time. The application provides instant synchronization between participants using WebSocket-based real-time updates via Supabase.

### 1.2 Target Users
- Agile development teams
- Scrum masters and product owners
- Remote-first teams requiring collaborative estimation tools

### 1.3 Key Differentiators
- **Serverless architecture**: No server infrastructure to manage
- **Real-time updates**: WebSocket-based instant synchronization (no polling)
- **Zero configuration**: Instant session creation with shareable links
- **Free tier deployment**: Runs entirely on free tiers of Vercel and Supabase
- **Privacy-focused**: No accounts required, sessions auto-expire after 24 hours

---

## 2. Business Requirements

### 2.1 Core Value Proposition
Provide a simple, fast, and free planning poker tool that requires no setup or registration, enabling teams to start estimating work immediately.

### 2.2 Success Metrics
- Session creation time < 2 seconds
- Real-time update latency < 500ms
- Support for up to 50 concurrent participants per session
- 99.9% uptime on free tier infrastructure

### 2.3 Constraints
- Must run on free tiers (Vercel + Supabase)
- No user authentication system
- No persistent user data (GDPR-friendly)
- Sessions auto-expire after 24 hours

---

## 3. Functional Requirements

### 3.1 Session Management

#### 3.1.1 Create Session (FR-001)
**Actor**: Session Creator
**Description**: User creates a new planning poker session

**Acceptance Criteria**:
- User can optionally provide a nickname (30 char max)
- If no nickname provided, system generates random nickname (format: AdjectiveNoun)
- System generates unique session ID (12 chars, URL-safe)
- System creates session with 24-hour expiration
- Creator is automatically added as first participant
- Returns shareable session URL

**Technical Implementation**:
- API: `POST /api/session`
- Bot detection via `botid` library
- Session ID generation via `nanoid` library
- Creator info stored in localStorage
- Reference: `app/api/session/route.ts:7-57`

#### 3.1.2 Join Session (FR-002)
**Actor**: Participant
**Description**: User joins an existing session via shared link

**Acceptance Criteria**:
- User accesses session via URL: `/session/{sessionId}`
- User can provide custom nickname or get random one
- System validates session exists and hasn't expired
- Participant added to session participants list
- Participant info stored in browser localStorage

**Technical Implementation**:
- API: `POST /api/session/[id]/join`
- Participant ID generation via `nanoid`
- Reference: `app/session/[id]/page.tsx:46-53`

#### 3.1.3 Session Expiration (FR-003)
**Description**: Sessions automatically expire after 24 hours

**Acceptance Criteria**:
- Sessions expire 24 hours after creation
- Expired sessions return "not found" error
- Database cleanup function available for scheduled execution

**Technical Implementation**:
- TTL: 24 hours (SESSION_TTL constant)
- Database: `expires_at` field with index
- Cleanup function: `delete_expired_sessions()`
- Reference: `lib/types.ts:35`, `supabase-schema.sql:49-57`

### 3.2 Voting Operations

#### 3.2.1 Submit Vote (FR-004)
**Actor**: Participant
**Description**: Participant selects a card to vote

**Acceptance Criteria**:
- Available cards: 0, 1, 2, 3, 5, 8, 13, 21, ?, ☕
- Participant can change vote before reveal
- Other participants see "voted" indicator but not the card value
- Real-time updates propagate to all participants

**Technical Implementation**:
- API: `POST /api/session/[id]/vote`
- Vote validation against CARDS array
- Updates session.participants[participantId].vote
- Reference: `app/api/session/[id]/vote/route.ts:7-65`

#### 3.2.2 Reveal Votes (FR-005)
**Actor**: Session Creator
**Description**: Creator reveals all votes to participants

**Acceptance Criteria**:
- Only session creator can reveal votes
- All participant votes become visible
- System calculates and displays statistics (average, min, max)
- Vote history recorded with round number and timestamp

**Technical Implementation**:
- API: `POST /api/session/[id]/reveal`
- Sets session.revealed = true
- Appends to session.voteHistory array
- Statistics calculated client-side from revealed votes
- Reference: `app/api/session/[id]/reveal/route.ts`

#### 3.2.3 Reset Round (FR-006)
**Actor**: Session Creator
**Description**: Creator resets votes for new estimation round

**Acceptance Criteria**:
- Only session creator can reset
- All participant votes cleared (set to null)
- Revealed state set to false
- Previous round preserved in vote history
- Round counter incremented

**Technical Implementation**:
- API: `POST /api/session/[id]/reset`
- Clears all votes: participants[id].vote = null
- Sets session.revealed = false
- Reference: `app/api/session/[id]/reset/route.ts`

### 3.3 Real-Time Features

#### 3.3.1 Real-Time Session Updates (FR-007)
**Description**: All participants receive instant updates when session state changes

**Acceptance Criteria**:
- Updates delivered via WebSocket (no polling)
- Update latency < 500ms
- Updates include: new votes, reveals, resets, new participants
- Graceful handling of connection drops and reconnections

**Technical Implementation**:
- Supabase Real-Time with PostgreSQL change data capture
- Client subscribes to `postgres_changes` events on sessions table
- Automatic reconnection handled by Supabase SDK
- Reference: `hooks/useRealtime.ts:9-54`

#### 3.3.2 Presence Tracking (FR-008)
**Description**: Show which participants are currently connected

**Acceptance Criteria**:
- Participants see online/offline status of other participants
- Status updates when users join/leave
- Visual indicator (e.g., green dot) for connected users

**Technical Implementation**:
- Supabase Presence feature with separate channel
- Track presence per session: `presence:{sessionId}`
- Each participant tracks their own presence
- Reference: `hooks/usePresence.ts:16-78`

### 3.4 UI/UX Requirements

#### 3.4.1 Responsive Design (FR-009)
**Acceptance Criteria**:
- Mobile-first responsive design
- Works on devices from 320px to 2560px width
- Touch-friendly card selection on mobile
- Readable text and adequate spacing on all devices

**Technical Implementation**:
- Tailwind CSS with mobile-first breakpoints
- Grid layout with responsive columns (md:grid-cols-3)

#### 3.4.2 Dark Mode Support (FR-010)
**Acceptance Criteria**:
- Automatic dark mode detection via system preference
- All UI elements readable in both light and dark modes
- Smooth transitions between modes

**Technical Implementation**:
- Tailwind dark mode with 'media' strategy
- Dark variant classes throughout components

#### 3.4.3 Loading States (FR-011)
**Acceptance Criteria**:
- Loading spinners for async operations
- Skeleton screens for initial page load
- Disabled states for buttons during operations
- Error messages for failed operations

**Technical Implementation**:
- LoadingState component for full-page loading
- Button disabled states
- Reference: `components/LoadingState.tsx`

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **Initial page load**: < 2 seconds on 3G connection
- **Time to interactive**: < 3 seconds
- **Real-time update latency**: < 500ms
- **API response time**: < 200ms (p95)

### 4.2 Scalability
- Support 50+ concurrent participants per session
- Support 100+ concurrent sessions
- Database size: within Supabase free tier (500 MB)
- Bandwidth: within Vercel free tier (100 GB/month)

### 4.3 Reliability
- 99.9% uptime
- Graceful degradation if real-time unavailable
- Automatic reconnection after network interruptions
- No data loss during session (until expiration)

### 4.4 Security
- **Bot protection**: botid library prevents automated abuse
- **Input validation**: All user inputs sanitized and validated
- **CORS**: Properly configured for API routes
- **RLS**: Row-level security enabled on Supabase (though currently permissive)
- **No secrets in client**: Environment variables properly scoped

### 4.5 Privacy
- No user accounts or authentication
- No tracking or analytics beyond Vercel defaults
- Session data auto-deleted after 24 hours
- Local storage only for participant session state

### 4.6 Accessibility
- Semantic HTML
- Keyboard navigation support
- ARIA labels where appropriate
- Color contrast ratios meeting WCAG AA

---

## 5. Technical Architecture

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Next.js App (React 19 + TypeScript)                   │  │
│  │  - App Router (Next.js 15)                             │  │
│  │  - Tailwind CSS                                        │  │
│  │  - Custom Hooks (useSession, useRealtime, etc.)       │  │
│  └────────────────────────────────────────────────────────┘  │
│           │                                    ▲               │
│           │ HTTPS/REST                         │ WebSocket     │
│           ▼                                    │               │
└───────────────────────────────────────────────────────────────┘
            │                                    │
            ▼                                    │
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  API Routes (Serverless Functions)                     │  │
│  │  - /api/session (POST) - Create session               │  │
│  │  - /api/session/[id] (GET) - Get session              │  │
│  │  - /api/session/[id]/join (POST) - Join               │  │
│  │  - /api/session/[id]/vote (POST) - Vote               │  │
│  │  - /api/session/[id]/reveal (POST) - Reveal           │  │
│  │  - /api/session/[id]/reset (POST) - Reset             │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            │                                    ▲
            │ PostgreSQL Protocol                │ WebSocket
            ▼                                    │
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                   │  │
│  │  - sessions table (JSONB for participants)            │  │
│  │  - Row Level Security enabled                         │  │
│  │  - Indexes on id and expires_at                       │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Real-Time Server                                      │  │
│  │  - PostgreSQL CDC (Change Data Capture)               │  │
│  │  - WebSocket connections                               │  │
│  │  - Presence tracking                                   │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Technology Stack

**Frontend**:
- **Framework**: Next.js 15.5.6 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.6.0
- **Styling**: Tailwind CSS 3.4.0
- **Utilities**:
  - `clsx` + `tailwind-merge` for className management
  - `nanoid` for ID generation
  - `botid` for bot detection

**Backend**:
- **Platform**: Vercel (serverless functions)
- **Database**: Supabase (PostgreSQL)
- **Real-Time**: Supabase Real-Time (WebSocket)
- **Client Library**: `@supabase/supabase-js` 2.45.0

**Monitoring**:
- `@vercel/analytics` 1.5.0
- `@vercel/speed-insights` 1.2.0

### 5.3 Deployment Architecture

**Hosting**: Vercel
- Static pages: Edge network CDN
- API routes: Serverless functions (AWS Lambda)
- Automatic HTTPS
- Git-based deployments

**Database**: Supabase
- PostgreSQL 15+
- Managed service with connection pooling
- Real-Time engine for WebSocket broadcasts
- Automatic backups (paid tier)

---

## 6. Data Model

### 6.1 Database Schema

#### sessions table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique session identifier (12 chars) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Session creation timestamp |
| participants | JSONB | NOT NULL, DEFAULT '{}' | Map of participant ID to Participant object |
| revealed | BOOLEAN | NOT NULL, DEFAULT false | Whether votes are revealed |
| creator_id | TEXT | NOT NULL | ID of session creator |
| expires_at | TIMESTAMPTZ | NOT NULL | Expiration timestamp (created_at + 24h) |
| vote_history | JSONB | DEFAULT '[]' | Array of past rounds |

**Indexes**:
- `sessions_id_idx` on `id` (primary key)
- `sessions_expires_at_idx` on `expires_at` (for cleanup queries)

**Real-Time**:
- Table published to `supabase_realtime` publication
- Enables change data capture for WebSocket broadcasts

Reference: `supabase-schema.sql:4-75`

### 6.2 TypeScript Types

#### Card Type
```typescript
type Card = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '21' | '?' | '☕';
```
Represents the planning poker card values.

#### Participant Interface
```typescript
interface Participant {
  id: string;              // Unique participant ID
  nickname: string;        // Display name
  vote: Card | null;       // Current vote (null if not voted)
  joinedAt: number;        // Timestamp (ms) when joined
  isConnected?: boolean;   // Presence indicator (client-side only)
  lastSeen?: number;       // Last seen timestamp (client-side only)
}
```

#### VoteRecord Interface
```typescript
interface VoteRecord {
  participantId: string;   // Who voted
  nickname: string;        // Display name at time of vote
  vote: Card;              // The vote cast
}
```

#### RoundHistory Interface
```typescript
interface RoundHistory {
  roundNumber: number;     // Sequential round number
  revealedAt: number;      // Timestamp when revealed
  votes: VoteRecord[];     // Votes in this round
}
```

#### Session Interface
```typescript
interface Session {
  id: string;                              // Session ID
  createdAt: number;                       // Creation timestamp (ms)
  participants: Record<string, Participant>; // Map of participantId -> Participant
  revealed: boolean;                       // Reveal state
  creatorId: string;                       // Creator participant ID
  voteHistory?: RoundHistory[];            // Past rounds
}
```

Reference: `lib/types.ts:1-36`

### 6.3 Local Storage Schema

Session-specific data stored in browser localStorage:

```javascript
// Key format: session_{sessionId}_participant
// Value: participantId (string)

// Key format: session_{sessionId}_nickname
// Value: nickname (string)

// Key format: session_{sessionId}_creator
// Value: creatorId (string) - only for creator
```

This enables participants to rejoin sessions across browser refreshes.

Reference: `app/page.tsx:29-31`

---

## 7. API Specification

### 7.1 Create Session
**Endpoint**: `POST /api/session`

**Request**:
```json
{
  "nickname": "John Doe" // Optional
}
```

**Response** (201 Created):
```json
{
  "sessionId": "ABC123XYZ789",
  "participantId": "DEF456UVW012",
  "nickname": "John Doe"
}
```

**Errors**:
- 401: Bot detected
- 500: Server error

**Reference**: `app/api/session/route.ts:7-57`

### 7.2 Get Session
**Endpoint**: `GET /api/session/[id]`

**Response** (200 OK):
```json
{
  "id": "ABC123XYZ789",
  "createdAt": 1678901234567,
  "participants": {
    "DEF456UVW012": {
      "id": "DEF456UVW012",
      "nickname": "John Doe",
      "vote": "5",
      "joinedAt": 1678901234567
    }
  },
  "revealed": false,
  "creatorId": "DEF456UVW012",
  "voteHistory": []
}
```

**Errors**:
- 404: Session not found
- 500: Server error

**Reference**: `app/api/session/[id]/route.ts`

### 7.3 Join Session
**Endpoint**: `POST /api/session/[id]/join`

**Request**:
```json
{
  "nickname": "Jane Smith" // Optional
}
```

**Response** (200 OK):
```json
{
  "participantId": "GHI789ABC345",
  "nickname": "Jane Smith"
}
```

**Errors**:
- 401: Bot detected
- 404: Session not found
- 500: Server error

**Reference**: `app/api/session/[id]/join/route.ts`

### 7.4 Submit Vote
**Endpoint**: `POST /api/session/[id]/vote`

**Request**:
```json
{
  "participantId": "DEF456UVW012",
  "vote": "5" // Or null to clear vote
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

**Errors**:
- 400: Missing participantId or invalid vote
- 401: Bot detected
- 404: Session or participant not found
- 500: Server error

**Reference**: `app/api/session/[id]/vote/route.ts:7-65`

### 7.5 Reveal Votes
**Endpoint**: `POST /api/session/[id]/reveal`

**Request**:
```json
{
  "participantId": "DEF456UVW012" // Must be creator
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

**Side Effects**:
- Sets `revealed = true`
- Appends current round to `voteHistory`

**Errors**:
- 400: Missing participantId
- 401: Bot detected
- 403: Participant is not creator
- 404: Session not found
- 500: Server error

**Reference**: `app/api/session/[id]/reveal/route.ts`

### 7.6 Reset Round
**Endpoint**: `POST /api/session/[id]/reset`

**Request**:
```json
{
  "participantId": "DEF456UVW012" // Must be creator
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

**Side Effects**:
- Clears all participant votes
- Sets `revealed = false`

**Errors**:
- 400: Missing participantId
- 401: Bot detected
- 403: Participant is not creator
- 404: Session not found
- 500: Server error

**Reference**: `app/api/session/[id]/reset/route.ts`

---

## 8. Component Architecture

### 8.1 Page Components

#### Home Page (`app/page.tsx`)
**Purpose**: Landing page for creating new sessions

**Features**:
- Nickname input (optional)
- Create session button
- "How it works" section

**State**:
- `nickname`: string
- `loading`: boolean

**Navigation**: Redirects to `/session/{sessionId}` on creation

#### Session Page (`app/session/[id]/page.tsx`)
**Purpose**: Main voting interface

**Custom Hooks**:
- `useSession`: Fetches and manages session state
- `useParticipant`: Manages participant identity and localStorage
- `useRealtime`: Subscribes to session updates
- `usePresence`: Tracks connected participants
- `useSessionActions`: API calls for join, vote, reveal, reset

**Render Logic**:
1. If loading: Show LoadingState
2. If not joined: Show JoinForm
3. If session not found: Show error
4. Otherwise: Show voting interface

**Sub-components**:
- SessionHeader
- ParticipantsList
- VotingArea
- CreatorControls (if creator)
- ResultsStats (if revealed)
- VoteHistory (if available)

Reference: `app/session/[id]/page.tsx:22-137`

### 8.2 UI Components

#### Card (`components/ui/Card.tsx`)
Generic container component with styled borders and shadows.

#### Button (`components/ui/Button.tsx`)
Styled button with variants (primary, secondary) and states (disabled, loading).

#### Footer (`components/ui/Footer.tsx`)
Footer with attribution and Ko-fi support button.

#### LoadingState (`components/LoadingState.tsx`)
Full-page loading spinner for async operations.

### 8.3 Session Components

#### JoinForm (`components/session/JoinForm.tsx`)
**Purpose**: Form for joining a session

**Props**:
- `nickname`: Current nickname value
- `joining`: Loading state
- `onNicknameChange`: Update handler
- `onSubmit`: Form submit handler

#### SessionHeader (`components/session/SessionHeader.tsx`)
**Purpose**: Display session info and participant nickname

**Props**:
- `nickname`: Current participant's nickname
- `isCreator`: Whether user is session creator

#### ParticipantsList (`components/session/ParticipantsList.tsx`)
**Purpose**: List all participants with vote status

**Props**:
- `participants`: Array of Participant objects
- `revealed`: Whether votes are revealed
- `votedCount`: Number of participants who voted
- `totalCount`: Total participants
- `connectedParticipants`: Set of connected participant IDs

**Display**:
- Shows checkmark if voted (before reveal)
- Shows vote card if revealed
- Shows online indicator if connected

#### VotingArea (`components/session/VotingArea.tsx`)
**Purpose**: Display voting cards and current selection

**Props**:
- `revealed`: Whether votes are revealed
- `currentVote`: Participant's current vote
- `onVote`: Vote handler

**Features**:
- Renders all available cards
- Highlights selected card
- Disables voting when revealed

#### VotingCard (`components/session/VotingCard.tsx`)
**Purpose**: Individual voting card

**Props**:
- `value`: Card value
- `selected`: Whether this card is selected
- `onClick`: Click handler

#### CreatorControls (`components/session/CreatorControls.tsx`)
**Purpose**: Reveal and reset buttons for session creator

**Props**:
- `revealed`: Current reveal state
- `votedCount`: Number of votes cast
- `onReveal`: Reveal handler
- `onReset`: Reset handler

**Logic**:
- Reveal button disabled if no votes
- Reset button only shown when revealed

#### ResultsStats (`components/session/ResultsStats.tsx`)
**Purpose**: Display statistics after reveal

**Props**:
- `participants`: Array of Participant objects

**Calculations**:
- Filters numeric votes (excludes ?, ☕)
- Calculates average, min, max
- Shows distribution

#### VoteHistory (`components/session/VoteHistory.tsx`)
**Purpose**: Display past rounds

**Props**:
- `history`: Array of RoundHistory objects

**Display**:
- Collapsible sections per round
- Vote distribution for each round
- Timestamp and round number

### 8.4 Custom Hooks

#### useSession (`hooks/useSession.ts`)
**Purpose**: Manage session state and fetching

**Returns**:
- `session`: Session | null
- `setSession`: Update function
- `loading`: boolean
- `fetchSession`: Refetch function

#### useParticipant (`hooks/useParticipant.ts`)
**Purpose**: Manage participant identity via localStorage

**Returns**:
- `participantId`: string | null
- `nickname`: string
- `hasJoined`: boolean
- `setNickname`: Update function
- `saveParticipant`: Save to localStorage

#### useRealtime (`hooks/useRealtime.ts`)
**Purpose**: Subscribe to Supabase real-time updates

**Parameters**:
- `sessionId`: string
- `enabled`: boolean
- `onUpdate`: Callback for updates

**Implementation**:
- Creates channel: `session:{sessionId}`
- Subscribes to `postgres_changes` events
- Filters by `id=eq.{sessionId}`
- Calls `onUpdate` with transformed data

Reference: `hooks/useRealtime.ts:9-54`

#### usePresence (`hooks/usePresence.ts`)
**Purpose**: Track participant presence

**Parameters**:
- `sessionId`: string
- `participantId`: string | null
- `nickname`: string
- `enabled`: boolean

**Returns**:
- `connectedParticipants`: Set<string>

**Implementation**:
- Creates channel: `presence:{sessionId}`
- Tracks own presence
- Listens for join/leave events
- Updates set of connected IDs

Reference: `hooks/usePresence.ts:16-78`

#### useSessionActions (`hooks/useSessionActions.ts`)
**Purpose**: API calls for session mutations

**Parameters**:
- `sessionId`: string
- `participantId`: string | null
- `onSuccess`: Callback after successful mutation

**Returns**:
- `joining`: boolean
- `joinSession`: (nickname) => Promise
- `submitVote`: (vote) => Promise
- `revealVotes`: () => Promise
- `resetVotes`: () => Promise

---

## 9. Real-Time Communication

### 9.1 Architecture

**Flow**:
1. Client makes mutation via API (POST /api/session/[id]/vote)
2. API updates PostgreSQL database
3. PostgreSQL triggers real-time notification
4. Supabase Real-Time server receives notification
5. Real-Time server broadcasts to all subscribed clients via WebSocket
6. Clients receive update and re-render

**Advantages**:
- No polling overhead
- Sub-second latency
- Automatic reconnection
- Scales with Supabase infrastructure

### 9.2 Supabase Real-Time Configuration

**Database Setup**:
```sql
-- Enable real-time for sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
```

**Client Subscription**:
```typescript
supabaseClient
  .channel(`session:${sessionId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'sessions',
    filter: `id=eq.${sessionId}`
  }, (payload) => {
    // Handle update
  })
  .subscribe();
```

Reference: `hooks/useRealtime.ts:19-47`

### 9.3 Presence System

**Purpose**: Show which participants are currently viewing the session

**Implementation**:
- Separate channel from data updates: `presence:{sessionId}`
- Each client tracks their presence
- Presence synced across all clients
- Automatic cleanup on disconnect

**Events**:
- `sync`: Full state synchronization
- `join`: New participant connected
- `leave`: Participant disconnected

Reference: `hooks/usePresence.ts:29-69`

---

## 10. Deployment & Infrastructure

### 10.1 Vercel Deployment

**Setup**:
1. Connect GitHub repository to Vercel
2. Auto-detect Next.js configuration
3. Deploy

**Environment Variables** (set via Vercel dashboard or CLI):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Build Configuration**:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Free Tier Limits**:
- 100 GB bandwidth/month
- Unlimited deployments
- 100 GB-hours serverless function execution

### 10.2 Supabase Setup

**Database Setup**:
1. Create Supabase project
2. Run `supabase-schema.sql` in SQL Editor
3. Enable Real-Time for `sessions` table (Database → Replication)

**Environment Variables** (from Supabase dashboard):
- Project URL: Settings → API → Project URL
- Anon Key: Settings → API → anon/public key
- Service Role Key: Settings → API → service_role key

**Free Tier Limits**:
- 500 MB database
- 2 GB bandwidth
- 50,000 monthly active users
- 200 concurrent real-time connections

### 10.3 Local Development

**Prerequisites**:
- Node.js 18+
- npm 9+
- Vercel CLI (optional)

**Setup**:
```bash
# Install dependencies
npm install

# Pull environment variables from Vercel
vercel env pull .env.local

# Run development server
npm run dev
```

**Environment Variables** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 11. Security Considerations

### 11.1 Bot Protection
**Implementation**: `botid` library checks request patterns

**Coverage**:
- All mutation endpoints (POST /api/session, join, vote, reveal, reset)
- Returns 401 if bot detected

Reference: `app/api/session/route.ts:10-16`

### 11.2 Input Validation
**Measures**:
- Nickname max length: 30 chars
- Vote validation: Must be in CARDS array
- ParticipantId validation: Must exist in session
- CreatorId validation: Only creator can reveal/reset

Reference: `app/api/session/[id]/vote/route.ts:32-37`

### 11.3 Row-Level Security (RLS)
**Current Implementation**:
- RLS enabled on `sessions` table
- Permissive policies (anyone can read/write)

**Production Recommendation**:
- Restrict updates to session participants
- Implement JWT-based participant authentication
- Add rate limiting per participant

Reference: `supabase-schema.sql:16-41`

### 11.4 Secrets Management
**Measures**:
- Service role key stored in Vercel environment variables
- Not exposed to client
- Anon key is public but has restricted permissions

### 11.5 CORS & CSP
**Next.js Defaults**:
- API routes have same-origin policy
- Static assets served via CDN with proper headers

### 11.6 Session Isolation
**Measures**:
- Sessions identified by random 12-char ID (62^12 = 3.2e21 combinations)
- No enumeration endpoint
- Sessions auto-expire after 24 hours

---

## 12. Development Guidelines

### 12.1 Code Style
- TypeScript strict mode
- ESLint configuration: `next/core-web-vitals`
- Functional components with hooks
- Tailwind for styling (no CSS modules)

### 12.2 File Structure
```
scrumpoker/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes (serverless functions)
│   │   └── session/
│   │       ├── route.ts      # POST /api/session
│   │       └── [id]/
│   │           ├── route.ts      # GET /api/session/[id]
│   │           ├── join/
│   │           ├── vote/
│   │           ├── reveal/
│   │           └── reset/
│   ├── session/[id]/page.tsx # Session voting page
│   ├── page.tsx              # Home page
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # Generic UI components
│   └── session/              # Session-specific components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility libraries
│   ├── supabase.ts           # Server-side Supabase client
│   ├── supabase-client.ts    # Client-side Supabase client
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
└── supabase-schema.sql       # Database schema
```

### 12.3 State Management Strategy
**Local State**:
- Component state via `useState`
- Form state managed per component

**Server State**:
- Session data fetched via custom hooks
- Real-time updates via Supabase subscriptions
- No global state library needed

**Persistent State**:
- Participant identity in localStorage
- No cookies or server-side sessions

### 12.4 Testing Strategy
**Current Coverage**: None (minimal for MVP)

**Recommended**:
- Unit tests for utility functions (nanoid, nickname generation)
- Integration tests for API routes
- E2E tests for critical flows (create → join → vote → reveal)
- Real-time connection tests

**Tools**:
- Jest for unit tests
- Playwright for E2E tests
- Supabase local development for integration tests

### 12.5 Error Handling
**API Routes**:
- Try-catch blocks with proper error responses
- Consistent error format: `{ error: string }`
- HTTP status codes: 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)

**Client**:
- Loading states during async operations
- Error alerts for failed operations
- Graceful degradation if real-time unavailable

### 12.6 Performance Optimization
**Current**:
- Server-side rendering for initial page load
- Static generation for home page
- Real-time updates avoid polling overhead

**Future**:
- Image optimization (if adding images)
- Code splitting for session components
- Service worker for offline support
- Database indexes for common queries

---

## 13. Future Enhancements

### 13.1 Feature Ideas
- **Voting timer**: Auto-reveal after countdown
- **Custom card sets**: Fibonacci, T-shirt sizes, etc.
- **Session history**: View past sessions (requires authentication)
- **Export results**: Download CSV/PDF of voting history
- **Integrations**: Jira, Linear, GitHub Issues
- **Video/audio**: Embedded communication

### 13.2 Technical Improvements
- **Authentication**: Optional accounts for session history
- **Analytics**: Track session metrics (anonymized)
- **Rate limiting**: Prevent API abuse
- **Database cleanup**: Scheduled job to delete expired sessions
- **Monitoring**: Error tracking (Sentry), performance monitoring
- **Testing**: Comprehensive test coverage

### 13.3 Scaling Considerations
- **Database sharding**: If exceeding single Postgres instance
- **CDN caching**: For static assets
- **Edge functions**: Move API routes to edge for lower latency
- **WebSocket connection pooling**: If exceeding Supabase limits

---

## 14. Glossary

- **Planning Poker**: Agile estimation technique using cards
- **Session**: A single estimation session with multiple rounds
- **Participant**: A user who joins a session
- **Round**: One estimation cycle (vote → reveal → reset)
- **Card**: A voting value (Fibonacci, ?, ☕)
- **Reveal**: Action to show all votes
- **Real-Time**: WebSocket-based instant updates
- **Presence**: Tracking who is currently online
- **CDC**: Change Data Capture (PostgreSQL → Real-Time)
- **RLS**: Row-Level Security (Supabase)
- **Serverless**: Functions that run on-demand without servers

---

## 15. References

### 15.1 Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Real-Time Documentation](https://supabase.com/docs/guides/realtime)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

### 15.2 External Libraries
- `@supabase/supabase-js`: [GitHub](https://github.com/supabase/supabase-js)
- `nanoid`: [GitHub](https://github.com/ai/nanoid)
- `botid`: [NPM](https://www.npmjs.com/package/botid)

### 15.3 Key Files
- Database Schema: `supabase-schema.sql`
- Type Definitions: `lib/types.ts:1-36`
- Session Page: `app/session/[id]/page.tsx:22-137`
- Real-Time Hook: `hooks/useRealtime.ts:9-54`
- Presence Hook: `hooks/usePresence.ts:16-78`
- API Routes: `app/api/session/**/*.ts`

---

## 16. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-06 | Claude Code | Initial requirements & design document |

---

**End of Document**

This document serves as the comprehensive specification for Scrum Poker. It should be updated as the application evolves and new features are added.
