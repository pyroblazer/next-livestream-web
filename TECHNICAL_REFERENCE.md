# MeLive Technical Reference

A deep dive into the protocols, libraries, architecture, and design decisions behind this livestreaming platform.

---

## Table of Contents

1. [How Livestreaming Works](#how-livestreaming-works)
2. [Streaming Protocols: RTMP vs WHIP](#streaming-protocols-rtmp-vs-whip)
3. [LiveKit](#livekit)
4. [Clerk](#clerk)
5. [Next.js App Router Architecture](#nextjs-app-router-architecture)
6. [Prisma & MySQL](#prisma--mysql)
7. [UploadThing](#uploadthing)
8. [Zustand (State Management)](#zustand-state-management)
9. [Tailwind CSS & shadcn/ui](#tailwind-css--shadcnui)
10. [Server Actions Pattern](#server-actions-pattern)
11. [Key Architectural Decisions](#key-architectural-decisions)
12. [Full Tech Stack Summary](#full-tech-stack-summary)

---

## How Livestreaming Works

At a high level, livestreaming involves four stages:

```
[Broadcaster] --> [Ingest Server] --> [Media Server] --> [Viewers]
   (OBS)          (receives stream)    (LiveKit)        (browser)
```

1. **Capture** — The broadcaster uses software like OBS to capture their screen, camera, and microphone.
2. **Ingest** — OBS sends the encoded video/audio to an ingest server using a protocol like RTMP or WHIP.
3. **Distribution** — The media server (LiveKit) processes the stream and distributes it to all connected viewers in real time via WebRTC.
4. **Playback** — Viewers connect to the media server and receive the stream through a `<video>` element in the browser.

### The Ingress

An **ingress** is LiveKit's term for an entry point that receives an external media stream. When a broadcaster generates stream credentials through the dashboard, the app creates an ingress on the LiveKit server. The ingress receives the RTMP/WHIP stream from OBS and converts it into a LiveKit room that viewers can join.

Each ingress produces:
- **Server URL** — The address of the LiveKit ingest server
- **Stream Key** — A secret token that authenticates the broadcaster

### The Room

A LiveKit **room** is a real-time communication space. In this app, each streamer has one room identified by their database user ID. When a streamer starts broadcasting, the ingress creates a room and publishes the broadcaster's audio/video tracks. Viewers join the room as participants to receive those tracks.

### Live Status Sync

LiveKit fires webhooks to the app when an ingress starts or ends:
- `ingress_started` → sets `isLive = true` in the database
- `ingress_ended` → sets `isLive = false` in the database

This is how the home page knows which streams are live without polling.

---

## Streaming Protocols: RTMP vs WHIP

### RTMP (Real-Time Messaging Protocol)

Originally developed by Macromedia (later Adobe Flash), RTMP is the industry standard for ingesting live video.

**How it works:**
- Uses a persistent TCP connection (usually port 1935)
- The broadcaster sends FLV-formatted video/audio chunks to the server
- The server transcodes the stream into multiple quality layers (e.g., 1080p, 720p, 480p) for adaptive bitrate streaming

**In this app:**
- Configured with `H264_1080P_30FPS_3_LAYERS` video encoding (3 transcoded quality layers at 1080p/30fps)
- Audio encoded with `OPUS_STEREO_96KBPS`
- Works with OBS, Streamlabs, XSplit, and any software that supports RTMP

**When to use RTMP:** Best for most streamers using desktop broadcasting software. The server-side transcoding ensures viewers on slow connections get a lower-quality stream instead of buffering.

### WHIP (WebRTC-HTTP Ingestion Protocol)

WHIP is a modern standard (IETF draft) for ingesting WebRTC streams over HTTP.

**How it works:**
- Uses WebRTC as the underlying transport (UDP-based)
- The broadcaster sends an HTTP POST with an SDP offer, the server responds with an SDP answer
- Media flows directly over WebRTC peer connections

**In this app:**
- Configured with `bypassTranscoding = true` — no server-side transcoding
- Lower latency than RTMP (sub-second vs 2-5 seconds)
- The stream is passed through to viewers as-is

**When to use WHIP:** Best when latency is critical (e.g., interactive streams, IRL streaming from a browser). Avoid if you need adaptive bitrate transcoding, since WHIP bypasses it.

### Comparison

| Feature | RTMP | WHIP |
|---|---|---|
| Transport | TCP | UDP (WebRTC) |
| Latency | 2-5 seconds | Sub-second |
| Transcoding | Yes (3 layers) | No (bypass) |
| Adaptive bitrate | Yes | No |
| Software support | OBS, Streamlabs, etc. | Browser, WHIP clients |
| Recommended for | Desktop streaming | Low-latency browser streaming |

---

## LiveKit

[LiveKit](https://livekit.io) is an open-source real-time audio/video infrastructure built on WebRTC. It handles all the complexity of media distribution, room management, and participant signaling.

### What LiveKit provides

- **SFU (Selective Forwarding Unit)** — Routes audio/video tracks from publishers to subscribers without decoding/re-encoding (unless transcoding is enabled)
- **Room management** — Creating, listing, and deleting rooms
- **Ingress management** — Accepting external RTMP/WHIP streams and converting them to WebRTC
- **Token-based authentication** — JWT tokens control who can join rooms and what they can do
- **Data channels** — Low-latency messaging between participants (used for chat)
- **Webhooks** — Server-to-server notifications for events like ingress start/end

### How this app uses LiveKit

**Server side** (`actions/ingress.ts`, `actions/token.ts`):
- `IngressClient` and `RoomServiceClient` manage ingresses and rooms
- `AccessToken` generates JWT tokens for viewers with scoped permissions

**Client side** (`components/stream-player/`):
- `<LiveKitRoom>` wraps the entire stream player — handles the WebSocket connection to LiveKit
- `useRemoteParticipant()` detects if the host is broadcasting
- `useTracks()` subscribes to the host's camera and microphone tracks
- Track `.attach()` binds the MediaStream to a `<video>` element for playback
- `useChat()` sends/receives messages over the data channel

### Token permissions

The app issues two types of tokens:

| Token type | Can publish audio/video | Can send data (chat) | Used by |
|---|---|---|---|
| Viewer token | No | Yes | Everyone watching |
| Host publisher token | Yes (via ingress) | Yes | The streamer's OBS/WHIP client |

Viewers get `canPublish: false, canPublishData: true` — they can chat but can't broadcast. The broadcaster publishes through the ingress, not through the viewer token.

### Identity handling

When the streamer views their own stream page, they join as `host-{userId}` instead of `{userId}` to avoid colliding with their own publisher identity (the ingress publishes under `{userId}`). This dual-identity pattern lets streamers preview their own stream and participate in their own chat.

---

## Clerk

[Clerk](https://clerk.com) is a managed authentication provider that handles user registration, sign-in, sessions, and user management UI.

### What Clerk handles

- **Sign-up / Sign-in UI** — Pre-built, customizable components rendered at `/sign-in` and `/sign-up`
- **Session management** — JWT-based sessions with automatic refresh
- **User profiles** — Avatar, username, email stored in Clerk's database
- **OAuth providers** — Can be configured for Google, GitHub, etc.
- **User button** — A dropdown widget with account management and sign-out

### How this app integrates Clerk

**Root layout** wraps everything in `<ClerkProvider>` with the dark theme:
```tsx
<ClerkProvider appearance={{ baseTheme: dark }}>
```

**Middleware** (`middleware.ts`) protects routes:
- Public routes (home, stream pages, search, webhooks) are accessible without login
- Everything else (dashboard, server actions) requires authentication
- Clerk's `authMiddleware` handles redirects to `/sign-in` automatically

**Server-side user access** uses `currentUser()` from `@clerk/nextjs`:
- Returns the authenticated Clerk user (id, username, imageUrl)
- Returns `null` if not authenticated

### Webhook sync

Clerk fires webhooks to keep the app's database in sync:
- `user.created` → Creates a User + Stream record
- `user.updated` → Syncs username and profile image
- `user.deleted` → Resets LiveKit ingresses, deletes the user and all related data (cascade)

Webhooks are verified using [Svix](https://svix.com) signatures (`CLERK_WEBHOOK_SECRET`).

### Local development fallback

Clerk webhooks can't reach `localhost` directly. The app handles this gracefully — if an authenticated Clerk user doesn't exist in the database yet (webhook hasn't fired), `getSelf()` auto-creates them on first access. This eliminates the need for a tunnel like ngrok during development.

---

## Next.js App Router Architecture

The app uses Next.js 14 with the **App Router** pattern — a file-system-based routing approach built on React Server Components.

### Route groups

Next.js route groups (folders in parentheses) share a layout without affecting the URL:

```
app/
  (auth)/           → /sign-in, /sign-up
  (browse)/         → /, /:username, /search
  (dashboard)/      → /u/:username/...
```

Each route group has its own layout with shared UI:

| Group | Layout | Shared UI |
|---|---|---|
| `(auth)` | Centered card with logo | Logo, Clerk components |
| `(browse)` | Navbar + Sidebar + Container | Browse navbar, collapsible sidebar, content area |
| `(dashboard)` | Navbar + Sidebar + Container | Dashboard navbar, creator sidebar, content area |

### Server Components vs Client Components

- **Server Components** (default in App Router) — Render on the server, can directly access the database and Clerk auth. Used for layouts, pages, and data-fetching components.
- **Client Components** (`"use client"`) — Render in the browser, can use React hooks, browser APIs, and state. Used for interactive UI like the stream player, chat, and sidebar toggles.

**Pattern:** Server components fetch data and pass it as props to client components. For example, the stream page (server component) looks up the user in the database and passes the data to `<StreamPlayer>` (client component), which connects to LiveKit.

### Suspense boundaries

Data-fetching components are wrapped in `<Suspense>` with skeleton fallbacks. This allows the page shell to render immediately while the data loads, showing skeleton placeholders until the server component resolves.

---

## Prisma & MySQL

[Prisma](https://prisma.io) is a type-safe ORM that generates a client from a schema definition.

### Database schema

```
User 1──1 Stream
User 1──* Follow (as follower or following)
User 1──* Block (as blocker or blocked)
```

**User** — Core account data. Links to Clerk via `externalUserId`. Has one Stream.

**Stream** — All stream configuration: name, thumbnail, LiveKit credentials, live status, chat settings. Created automatically when a user is created.

**Follow** — Many-to-many relationship between users. Composite unique key `[followerId, followingId]` prevents duplicate follows.

**Block** — Many-to-many relationship. Cascade deletes ensure cleanup.

### Prisma features used

- **Full-text search** — The `name` field on Stream has a full-text index for search functionality
- **Cascade deletes** — Deleting a user automatically removes their stream, follows, and blocks
- **Singleton client** — The Prisma client is cached globally to prevent multiple connections during development hot reloads

---

## UploadThing

[UploadThing](https://uploadthing.com) is a file upload service for Next.js that handles storage, CDN delivery, and type-safe uploads.

### How it's used

The app uses UploadThing for a single purpose: **stream thumbnail uploads**.

**Upload flow:**
1. Streamer opens the "Edit stream info" modal on their dashboard
2. An `<UploadDropzone>` component accepts a single image (max 4MB)
3. UploadThing middleware authenticates the user via `getSelf()`
4. On upload complete, the file URL is saved to `Stream.thumbnailUrl`
5. The thumbnail appears on the stream card on the home page

The Tailwind config is wrapped with `withUt()` from UploadThing to inject its styles.

---

## Zustand (State Management)

[Zustand](https://zustand-demo.pmnd.rs) is a minimal state management library. The app uses three independent stores:

| Store | State | Purpose |
|---|---|---|
| `useSidebar` | `collapsed` | Browse sidebar collapse state |
| `useCreatorSidebar` | `collapsed` | Dashboard sidebar collapse state |
| `useChatSidebar` | `collapsed`, `variant` | Chat panel collapse + chat/community toggle |

All stores follow the same pattern — a boolean `collapsed` state with `onExpand()`/`onCollapse()` actions. The chat sidebar adds a `variant` field to switch between message view and participant list.

The `Container` components in both browse and dashboard layouts use `useMediaQuery` to auto-collapse the sidebar on screens narrower than 1024px.

---

## Tailwind CSS & shadcn/ui

### Tailwind CSS

Utility-first CSS framework. The config extends Tailwind with:

- **CSS variable-based theming** — All colors reference CSS custom properties (e.g., `hsl(var(--background))`), making theme switching trivial
- **Container queries** — Centered, 2rem padding, max 1400px at 2xl breakpoint
- **Animations** — Via the `tailwindcss-animate` plugin

### shadcn/ui

[shadcn/ui](https://ui.shadcn.com) is a collection of reusable components built on [Radix UI](https://www.radix-ui.com) primitives. Unlike a traditional component library, shadcn/ui copies component source code directly into the project, giving full control over styling and behavior.

**Components used:** Alert, Avatar, Button, Dialog, Input, Label, ScrollArea, Select, Separator, Skeleton, Slider, Switch, Table, Textarea, Tooltip.

### Theme system

Colors are defined as HSL values in CSS custom properties:

```css
.dark {
  --background: 226.7 12.7% 13.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --secondary: 226.7 12.7% 17.5%;
  /* ... */
}
```

Tailwind references these in its config:
```js
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  // ...
}
```

The app enforces dark mode via `forcedTheme="dark"` in the ThemeProvider — there is no light/dark toggle.

---

## Server Actions Pattern

Next.js Server Actions (`"use server"`) let client components call server-side functions directly, without manual API routes.

### How the app uses them

The `actions/` directory contains server actions that follow a consistent pattern:

1. **Authenticate** — Call `getSelf()` to verify the user and get their database record
2. **Validate** — Check business rules (can't follow/block yourself, not already following, etc.)
3. **Mutate** — Perform the database operation via Prisma
4. **Revalidate** — Call `revalidatePath()` to refresh affected pages' cached data

**Example — Following a user:**
```ts
"use server";
export const onFollow = async (id: string) => {
  const self = await getSelf();          // 1. Authenticate
  const userToFollow = await getUserById(id);  // 2. Validate
  if (self.id === userToFollow.id) throw new Error("...");
  const follow = await followUser(id);   // 3. Mutate
  revalidatePath("/");                   // 4. Revalidate
  revalidatePath(`/${userToFollow.username}`);
  return follow;
};
```

### Service/Action split

Business logic lives in `lib/*-service.ts` (plain async functions). Server actions in `actions/*.ts` add the `"use server"` directive, authentication, and revalidation on top. This separation keeps the service functions reusable (they're also called from webhooks and other services).

---

## Key Architectural Decisions

### Room = User ID

Each streamer's LiveKit room is named after their database user ID. This simplifies lookups — knowing the user ID immediately tells you the room name, and vice versa. It also ensures uniqueness since user IDs are UUIDs.

### Ingress lifecycle

When a broadcaster regenerates their stream credentials, the app deletes all existing ingresses and rooms before creating a new one. This prevents stale connections and ensures a clean state, but it means regenerating keys will interrupt any active stream.

### Data channel for chat

Chat messages travel over LiveKit's WebRTC data channel (via `canPublishData: true`), not a separate WebSocket server. This keeps the architecture simple — one connection (LiveKit) handles both video and chat. The trade-off is that chat is only available while connected to the room.

### Guest access

Unauthenticated viewers can watch streams and view chat. The `createViewerToken` action catches authentication failures and assigns a random guest identity (`guest#<number>`). Guests can see messages but appear as anonymous in the participant list.

### Cascade deletes

The Prisma schema uses `onDelete: Cascade` on all foreign keys. Deleting a user removes their stream, follows, and blocks automatically. This keeps the database clean but means user deletion is permanent and thorough.

### Optimistic UI refresh

After mutations (follow, block, update settings), server actions call `revalidatePath()` for all affected routes. Next.js refetches the server components for those paths, updating the UI without a full page reload. The client components maintain their state during revalidation.

---

## Full Tech Stack Summary

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.0.3 | React framework with App Router, SSR, server actions |
| React | ^18 | UI library |
| TypeScript | ^5 | Type safety |

### Media & Streaming
| Technology | Version | Purpose |
|---|---|---|
| LiveKit (server SDK) | ^1.2.7 | Ingress management, room management, token generation |
| LiveKit (client) | ^1.15.4 | WebRTC room connection in the browser |
| @livekit/components-react | ^1.4.2 | React hooks for LiveKit (useChat, useTracks, etc.) |

### Authentication
| Technology | Version | Purpose |
|---|---|---|
| @clerk/nextjs | ^4.27.3 | Auth provider with pre-built UI |
| @clerk/themes | ^1.7.9 | Dark theme for Clerk components |
| Svix | ^1.14.0 | Webhook signature verification |

### Database
| Technology | Version | Purpose |
|---|---|---|
| Prisma | ^5.6.0 | Type-safe ORM |
| MySQL | — | Relational database (via Aiven) |

### UI & Styling
| Technology | Version | Purpose |
|---|---|---|
| Tailwind CSS | ^3.3.0 | Utility-first CSS |
| shadcn/ui | — | Component library (Radix UI based) |
| Radix UI | various | Accessible UI primitives |
| tailwindcss-animate | ^1.0.7 | Animation utilities |
| next-themes | ^0.2.1 | Theme management |
| Lucide React | ^0.294.0 | Icon library |

### File Uploads
| Technology | Version | Purpose |
|---|---|---|
| UploadThing | ^6.0.4 | File upload API |
| @uploadthing/react | ^6.0.2 | Upload components |

### State & Data
| Technology | Version | Purpose |
|---|---|---|
| Zustand | ^4.4.7 | Client-side state management |
| @tanstack/react-table | ^8.10.7 | Data table (community/blocked users) |
| date-fns | ^2.30.0 | Date formatting |

### Utilities
| Technology | Version | Purpose |
|---|---|---|
| jwt-decode | ^4.0.0 | Decode LiveKit JWTs client-side |
| string-to-color | ^2.2.2 | Deterministic color from username |
| query-string | ^8.1.0 | URL query parameter parsing |
| sonner | ^1.2.4 | Toast notifications |
| usehooks-ts | ^2.9.1 | React hooks (useMediaQuery, useIsClient) |
