# riff.fm

**Your media. Your stats. Your story.**

An all-in-one media stats platform — starting with music, expanding to movies, anime, books, games, and more. Free and open source.

## Features

### 🎵 Music Stats (Live)
- **Spotify Integration** — Sign in with Spotify, import your full streaming history
- **Top Lists** — Ranked artists, songs, albums, and genres with play counts and listening time
- **Listening Clock** — 24×7 heatmap showing when you listen most
- **Activity Heatmap** — GitHub-style contribution graph of your listening habits
- **Time Machine** — View stats across different time ranges (4 weeks, 6 months, 1 year, all time)
- **Genre Analysis** — Breakdown of your genre distribution with visualizations
- **Recent Plays** — Your latest listening activity
- **Data Import** — Upload your Spotify extended streaming history JSON for lifetime stats
- **Public Profiles** — Share your stats with a public profile link
- **Friends** — Add friends, compare stats, see what they're listening to
- **Privacy Controls** — Full control over what's visible on your profile

### 🎬 Coming Soon
- Movies & TV (TMDB + Letterboxd import)
- Anime (AniList + MyAnimeList)
- Books & Manga (Open Library + Goodreads)
- YouTube & Podcasts
- Games
- Articles & Essays
- Knowledge Graph

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (Spotify, GitHub, Google)
- **Styling**: Tailwind CSS + Radix UI primitives
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or use Docker)
- Spotify Developer Account (for OAuth)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/riff.fm.git
cd riff.fm
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Fill in your values in `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/riff_fm"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
SPOTIFY_CLIENT_ID="from-spotify-developer-dashboard"
SPOTIFY_CLIENT_SECRET="from-spotify-developer-dashboard"
```

### 3. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres

# Push schema to database
npm run db:push

# Or use migrations
npm run db:migrate
```

### 4. Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://localhost:3000/api/auth/callback/spotify` to Redirect URIs
4. Copy Client ID and Client Secret to `.env`

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data Import

You can import your Spotify extended streaming history:

1. Request your data from [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Download the "Account data" zip
3. Go to Settings → Data Management → Import
4. Upload the streaming history JSON files

The import processes:
- `Streaming_History_Audio_*.json` — All audio streams
- `Streaming_History_Video_*.json` — Music video streams

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/spotify/stats` | GET | Computed stats (accepts `?timeRange=`) |
| `/api/spotify/import` | POST | Import streaming history JSON |
| `/api/spotify/callback` | GET | Spotify OAuth callback |
| `/api/user/profile` | GET/PUT | Get/update user profile |
| `/api/user/friends` | GET/POST/PUT/DELETE | Friend management |

## Project Structure

```
riff.fm/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── auth/signin/        # Sign in page
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── page.tsx        # Overview
│   │   │   ├── top-artists/    # Top artists
│   │   │   ├── top-songs/      # Top songs
│   │   │   ├── top-albums/     # Top albums
│   │   │   ├── genres/         # Genre analysis
│   │   │   ├── timeline/       # Timeline view
│   │   │   ├── friends/        # Friends & social
│   │   │   └── settings/       # Settings & privacy
│   │   ├── [username]/         # Public profiles
│   │   ├── explore/            # Explore page
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn-style base components
│   │   ├── layout/             # Navbar, Footer
│   │   ├── dashboard/          # Stats, Charts, Lists
│   │   ├── landing/            # Hero, Features
│   │   └── profile/            # Profile components
│   ├── lib/
│   │   ├── auth.ts             # NextAuth config
│   │   ├── db.ts               # Prisma client
│   │   ├── spotify.ts          # Spotify API client
│   │   ├── stats.ts            # Stats computation
│   │   ├── utils.ts            # Utility functions
│   │   └── constants.ts        # App constants
│   └── types/
│       └── index.ts            # TypeScript types
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

## Database Models

- **User** — Auth user with Spotify/GitHub/Google IDs
- **Artist/Album/Track** — Spotify metadata
- **ListeningHistory** — Every stream with timestamp, duration, platform, skip/shuffle data
- **Friend** — Social connections with status (pending/accepted/rejected)
- **PrivacySettings** — Per-user visibility controls
- **CustomList** — Future: movies, books, games, mixed lists
- **ImportedData** — Import tracking

## License

MIT — do whatever you want with it.
