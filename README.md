# Dino Player

A mobile-first YouTube video player application built for the **Dino Ventures Frontend Engineer Assignment**.

Inspired by the YouTube mobile app — featuring smooth gesture interactions, drag-to-minimize, a persistent mini-player, auto-play next with countdown, virtual lists, and a polished dark UI.

---

## Features

### Core Requirements

| Feature | Details |
|---|---|
| **Video Feed** | Home page with 29 videos grouped across 3 categories |
| **Video Cards** | Thumbnail, title, duration badge, category icon — lazy-loaded |
| **Smooth Transitions** | Home page scales/fades as fullscreen player opens (spring physics) |
| **Fullscreen Player** | YouTube IFrame API with custom overlay UI — native controls hidden |
| **Custom Controls** | Play/Pause, Skip ±10s, draggable seekbar, time/duration display |
| **Auto-play on open** | Video starts playing immediately when a card is tapped |
| **In-Player Video List** | Tap "Up Next" or swipe up to reveal same-category video list |
| **Filtering** | In-player list shows only videos from the currently playing category |
| **Switch + Auto-play** | Tapping a video in the list switches playback immediately |
| **Drag-to-Minimize** | Drag the player downward → docks into a bottom mini-player |
| **Mini Player** | Live video preview (continuous playback), title, play/pause, close, progress |
| **Persistence** | Mini-player persists while browsing home — single YouTube iframe instance |
| **Restoration** | Tap mini-player → restores to fullscreen |

### Bonus Features (All Implemented)

| Bonus | Details |
|---|---|
| **Auto-play Next** | When video ends, a 5-second countdown card appears with a cancel option |
| **Virtualization** | `@tanstack/react-virtual` on both home feed and in-player list |
| **Browser PiP API** | PiP button in fullscreen header (falls back to mini-player if unsupported) |
| **Visual Skip Feedback** | Animated ripple + chevron icons on ±10s skip |

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Virtualization | @tanstack/react-virtual |
| Video | YouTube IFrame Player API |

---

## Project Structure

```
src/
├── App.tsx                        # Root — mounts PlayerContainer + HomePage
├── context/
│   └── PlayerContext.tsx          # Global player state (video, category, playerState)
├── hooks/
│   └── useYouTubePlayer.ts        # YouTube IFrame API hook
├── data/
│   └── videos.ts                  # Dataset (29 videos, 3 categories)
├── types/index.ts                 # TypeScript interfaces
├── utils/format.ts                # formatTime, extractVideoId
└── components/
    ├── home/
    │   ├── HomePage.tsx            # Virtualized feed
    │   ├── CategorySection.tsx     # Section header + video grid
    │   └── VideoCard.tsx           # Card with thumbnail, title, badge
    └── player/
        ├── PlayerContainer.tsx     # Unified persistent player (fullscreen ↔ mini)
        ├── PlayerControls.tsx      # Fullscreen overlay UI
        ├── ProgressBar.tsx         # Pointer-draggable seek bar
        ├── SkipFeedback.tsx        # ±10s animated ripple feedback
        ├── VideoList.tsx           # In-player list (virtualized)
        └── AutoPlayNext.tsx        # Countdown card for auto-play
```

---

## Key Architecture Decision: Persistent YouTube Iframe

The YouTube player `<div>` is **never unmounted** while the player is open. A single `motion.div` wrapper animates between:

- **Fullscreen**: `position: fixed; inset: 0` — covers the entire screen
- **Mini**: `position: fixed; bottom: 20px; left: 12px; width: 112px; height: 64px`

This means the video **truly continues playing** when you minimize — there is no iframe teardown/reconstruction.

---

## Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/dino-player.git
cd dino-player
npm install
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build
npm run preview
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

---

## Design Notes

- **Mobile-first**: `max-w-md` (448px) centered on desktop, full-width on mobile. All touch targets ≥ 44px.
- **60fps animations**: Only `transform` and `opacity` are animated (GPU composited). No layout-triggering properties.
- **No YouTube default controls**: `controls=0` in playerVars. All UX is custom-built on top of the IFrame API.
- **Controls auto-hide**: Fade out after 3.5s of inactivity; tap to reveal.
- **Swipe to dismiss mini-player**: Horizontal swipe (>120px) closes the player entirely.
