# MeLive User Guide

Everything you need to know to create an account, watch streams, chat, and go live.

---

## Table of Contents

1. [Creating an Account](#creating-an-account)
2. [Signing In](#signing-in)
3. [Signing Out](#signing-out)
4. [Browsing Streams](#browsing-streams)
5. [Watching a Stream](#watching-a-stream)
6. [Using Chat](#using-chat)
7. [Following a Streamer](#following-a-streamer)
8. [Searching for Streams](#searching-for-streams)
9. [Going Live (Creator Guide)](#going-live-creator-guide)
10. [Managing Your Stream](#managing-your-stream)
11. [Chat Settings](#chat-settings)
12. [Managing Your Community](#managing-your-community)

---

## Creating an Account

1. Click **"Login"** in the top-right corner of the navbar.
2. On the sign-in page, click **"Sign up"** at the bottom of the form.
3. Fill in your details (email, username, password) as prompted by the registration form.
4. Complete any verification steps (email confirmation, etc.).
5. After signing up, you'll be redirected to the home page and automatically logged in.

> You can browse streams and watch content without an account, but you'll need one to follow streamers, participate in chat, and go live.

---

## Signing In

1. Click **"Login"** in the top-right corner of the navbar.
2. Enter your credentials on the sign-in page.
3. After successful authentication, you'll be redirected to the home page.

> If you were trying to follow a streamer or join chat before signing in, you'll be automatically redirected back to that page after logging in.

---

## Signing Out

1. Click your **profile avatar** in the top-right corner of the navbar (this opens the user menu).
2. Click **"Sign out"** from the dropdown.
3. You'll be redirected to the home page.

---

## Browsing Streams

The **home page** displays a grid of recommended streams. Streams that are currently live are shown with a **"LIVE"** badge and appear first.

**Using the sidebar:**
- **Expanded view** (desktop): The left sidebar shows two sections:
  - **Following** — Users you follow who are currently live will show a red "LIVE" badge.
  - **Recommended** — Suggested streamers to check out.
- Click any user in the sidebar to go to their stream.
- Click the **collapse arrow** (left arrow icon) next to "For you" to minimize the sidebar.
- Click the **expand arrow** (right arrow icon) to bring it back.

> On mobile devices, the sidebar auto-collapses to show only avatars.

---

## Watching a Stream

1. Find a stream from the home page, sidebar, or search results.
2. Click on the stream card or username to open the stream page.
3. The video player will load automatically:
   - **Live streams** — Video starts playing immediately (audio is muted by default).
   - **Offline streams** — You'll see an offline icon with the message "<username> is offline".

**Video controls** (hover over the video to reveal):
- **Volume** — Click the speaker icon to unmute/mute. Use the slider to adjust volume.
- **Fullscreen** — Click the maximize icon to enter fullscreen mode. Press Escape or click again to exit.

**Stream info** (below the video):
- Streamer avatar and username
- Stream name
- Live viewer count (or "Offline" status)
- Follow/Unfollow button
- "About" section with the streamer's bio and follower count

---

## Using Chat

Chat appears in the right panel when viewing a stream.

**Sending a message:**
1. Type your message in the text input at the bottom of the chat panel.
2. Press Enter or click the **"Chat"** button to send.

**Chat features:**
- Each viewer gets a **unique color** for their username, generated from their name.
- Messages display a timestamp (HH:MM format).
- Newest messages appear at the bottom.

**Chat restrictions you may encounter:**
- **"Followers only"** — You must follow the streamer to send messages.
- **"Slow mode"** — After sending a message, you must wait 3 seconds before sending another.
- **"Chat is disabled"** — The streamer has turned off chat entirely.

**Toggling chat visibility:**
- Click the **collapse arrow** in the chat header to hide the chat panel.
- A floating chat icon appears in the top-right area to bring it back.
- On mobile, chat is always visible and cannot be collapsed.

**Community view:**
- Click the **users icon** in the chat header to see all participants in the stream.
- Use the search bar to filter participants by name.

> Guests (not logged in) can view chat but appear as "guest#<number>".

---

## Following a Streamer

1. Go to any streamer's page.
2. Click the **"Follow"** button (heart icon) below the stream header.
3. A confirmation toast will appear: "You are now following <username>".

**To unfollow:**
- Click the **"Unfollow"** button (filled heart icon).
- A confirmation toast will appear: "You have unfollowed <username>".

> You cannot follow yourself. Following/unfollowing updates the sidebar and follower count in real time.

---

## Searching for Streams

1. Use the **search bar** in the top navbar (center of the screen).
2. Type your search query and press Enter or click the search icon.
3. The results page shows matching streams with:
   - Thumbnail image
   - Streamer username and verified badge
   - Stream name
   - Relative timestamp
4. Click any result to go to that stream.

> Search works without being logged in.

---

## Going Live (Creator Guide)

### Step 1: Access your dashboard

1. Log in to your account.
2. Click **"Dashboard"** in the top-right navbar (clapperboard icon).
3. You'll be taken to your creator dashboard at `/u/<your-username>`.

### Step 2: Generate stream credentials

1. In the dashboard sidebar, click **"Keys"**.
2. On the Keys & URLs page, click **"Generate connection"**.
3. Choose your connection type:
   - **RTMP** — Standard protocol. Works with OBS, Streamlabs, and most streaming software. Provides transcoding at H.264 1080p 30fps with 3 quality layers.
   - **WHIP** — WebRTC-based protocol. Lower latency but bypasses transcoding.
4. Acknowledge the warning (generating new credentials will reset any active streams).
5. Click **"Generate"**.

### Step 3: Configure your streaming software

After generating, two values will appear:

- **Server URL** — The ingest server address.
- **Stream Key** — Your unique stream key (hidden by default; click the eye icon to reveal).

**In OBS Studio:**
1. Go to **Settings > Stream**.
2. Set Service to **"Custom"**.
3. Paste the **Server URL** into the Server field.
4. Paste the **Stream Key** into the Stream Key field.
5. Click **Apply** and **OK**.
6. Click **"Start Streaming"** in OBS.

Your stream will go live on MeLive within a few seconds.

> Use the copy buttons next to each field to quickly grab the values.

---

## Managing Your Stream

From your dashboard stream page (`/u/<your-username>`), you can:

**Edit stream info:**
1. Click **"Edit"** on the "Edit your stream info" card.
2. Change your **stream name** in the text field.
3. Upload or remove a **thumbnail image**:
   - To upload: Click the upload area and select an image.
   - To remove: Click the trash icon on the current thumbnail.
4. Click **"Save"** to apply changes.

**Edit your bio:**
1. Click **"Edit"** on the "About" card.
2. Write or update your bio in the text area.
3. Click **"Save"** to apply changes.

---

## Chat Settings

Navigate to **Dashboard > Chat** (`/u/<your-username>/chat`) to configure:

| Setting | Description |
|---|---|
| **Enable chat** | Turn chat on or off entirely. When disabled, viewers see "Chat is disabled". |
| **Delay chat** | Enable slow mode. Viewers must wait 3 seconds between messages. |
| **Must be following to chat** | Restrict chat to followers only. Non-followers see "Only followers can chat". |

Toggle each setting with the switch. Changes take effect immediately and a confirmation toast appears.

---

## Managing Your Community

Navigate to **Dashboard > Community** (`/u/<your-username>/community`) to manage blocked users.

**Blocking a user during a live stream:**
1. In the chat panel, click the **users icon** to switch to Community view.
2. Hover over the user you want to block.
3. Click the **minus-circle icon** that appears.
4. The user is immediately removed from the stream and added to your blocked list.

> Blocked users cannot view your stream page at all — they will see a 404 page instead.

**Unblocking a user:**
1. Go to **Dashboard > Community**.
2. Find the user in the blocked users table.
3. Click **"Unblock"** next to their name.
4. A confirmation toast appears and the user is removed from the blocked list.

The blocked users table supports:
- Sorting by username or date blocked
- Filtering by username
- Pagination with Previous/Next buttons

---

## Tips

- The app uses **dark mode** exclusively — no theme toggle is needed.
- The sidebar and chat panel are **collapsible** — use the toggle arrows to maximize the video area.
- If you lose your stream key, you can generate a new one from **Dashboard > Keys**, but this will reset any active stream.
- Your stream is publicly accessible at `/<your-username>` — share this link with your audience.
