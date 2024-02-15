# MeLive - A Livestreaming App 

Built with Next.js 14, Livestreaming, React, Prisma, Stripe, Tailwind, MySQL

### Highlights:
- 🎥 Livestreaming with RTMP / WHIP protocols
- 🌐 Seamless Ingress Generation
- 🔗 Integration with Next.js app and OBS / Preferred streaming software
- 🔐 Robust Authentication System
- 🖼️ Thumbnail Upload Support
- 👁️ Real-time Live Viewer Count
- 🚦 Live Status Indicators
- 💬 Instant Chat using Sockets
- 🎨 Unique Colors for Each Viewer in Chat
- 👤 Comprehensive Following System
- 🚫 User Blocking Functionality
- 👢 Real-time Kicking of Participants
- 🎛️ Streamer / Creator Dashboard
- 🐢 Slow Chat Mode for Deliberate Conversations
- 🔒 Followers Only Chat Mode
- 📴 Chat Enable / Disable Feature
- 🔽 Collapsible Layout (Hide Sidebars, Chat, Theatre Mode, etc.)
- 📚 Sidebar for Following & Recommendations
- 🏠 Home Page Recommending Streams, Sorted by Live Status
- 🔍 Search Results Page with Distinct Layout
- 🔄 Synchronization of User Information to our DB using Webhooks
- 📡 Live Status Information Sync via Webhooks
- 🤝 Community Tab for Enhanced Interaction
- 🎨 Visually Pleasing Design
- ⚡ Lightning-fast Application
- 📄 Server-Side Rendering (SSR)
- 🗺️ Well-Organized Routes & Layouts
- 🗃️ MySQL Database Integration
- 🚀 Smooth Deployment Process

### Prerequisites

**Node version 18.17 or later**

### Cloning the repository

```shell
git clone https://github.com/pyroblazer/next-livestream-web.git
```

### Install packages

```shell
npm i
```

### Setup .env file


```js
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_WEBHOOK_SECRET=

DATABASE_URL=

LIVEKIT_API_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_WS_URL=

UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

### Setup Prisma

Add MySQL Database - (e.g. Aiven)

```shell
npx prisma generate
npx prisma db push
```

### Start the app

```shell
npm run dev
```

## Available commands

Running commands with npm `npm run [command]`

| command         | description                              |
| :-------------- | :--------------------------------------- |
| `dev`           | Starts a development instance of the app |
