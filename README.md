# Better CP

Better CP is a full-stack competitive-programming intelligence platform. It connects a learner's coding profiles, normalizes activity into a single data model, computes progress signals, and turns those signals into a focused practice roadmap and coaching guidance.

The project is designed around a production-oriented concern: external programming platforms are slow and inconsistent, while the learning experience should be fast, personalized, and reliable.

**Live application:** [code-pulse-ojlk.vercel.app](https://code-pulse-ojlk.vercel.app/)

## Product capabilities

- Account authentication with credentials, Google, and GitHub through Auth.js.
- Linked-profile support for LeetCode, Codeforces, GeeksforGeeks, CodeChef, AtCoder, and GitHub identifiers.
- Platform synchronization for LeetCode and Codeforces, including submissions, problem metadata, and rating history.
- A unified analytics view: solved counts, difficulty distribution, topic mastery, acceptance rate, streaks, and platform statistics.
- Data-driven recommendations built from learner weaknesses and a curated NeetCode-style curriculum.
- AI coaching that produces a weekly study plan, readiness assessment, and highest-priority next action, with a deterministic fallback when no model key is configured.
- Personal goals, achievements, contest discovery, dashboard views, and user settings.

## Architecture

```text
                         ┌──────────────────────────┐
                         │       Next.js App         │
                         │ App Router + React 19 UI  │
                         └─────────────┬────────────┘
                                       │
                  ┌────────────────────┼────────────────────┐
                  │                    │                    │
           Server-rendered        Route handlers       Server actions
           dashboard pages        /api/*               auth and updates
                  │                    │                    │
                  └────────────────────┴────────────────────┘
                                       │
                         ┌─────────────▼─────────────┐
                         │       Domain modules       │
                         │ auth · sync · analytics    │
                         │ goals · learning · AI      │
                         └───────┬───────────┬────────┘
                                 │           │
                 ┌───────────────▼───┐   ┌───▼────────────────┐
                 │ PostgreSQL + Prisma│   │ Upstash Redis      │
                 │ source of truth    │   │ read-through cache │
                 └────────────────────┘   └────────────────────┘
                                 ▲
                                 │ events / scheduled work
                         ┌───────┴───────────┐
                         │      Inngest       │
                         │ sync orchestration │
                         └───────┬───────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │ LeetCode / Codeforces APIs│
                    └───────────────────────────┘
```

### Why this shape?

The request path stays focused on user-facing reads and writes. Slow, failure-prone platform collection is moved to Inngest functions, where it can be retried and rate-limited independently. PostgreSQL stores normalized, durable records; Redis is an optional cache that accelerates expensive reads without becoming a correctness dependency.

### Data flow

1. A user links platform handles in the profile settings.
2. A sync request records a pending refresh and emits `platform/refresh.requested`.
3. The Inngest worker fetches configured platforms in parallel steps, then recomputes analytics and marks the refresh complete.
4. The analytics engine deduplicates accepted problems, calculates difficulty and topic signals, derives streaks and acceptance rate, and persists an analytics snapshot.
5. Dashboard, roadmap, and coach experiences read that snapshot. Cached analytics and AI responses reduce repeated database/model work.

## Key engineering decisions

| Concern | Design | Rationale |
| --- | --- | --- |
| Authentication | Auth.js with Prisma adapter and JWT sessions | Supports OAuth and credentials while keeping user identity in the application database. |
| Database access | Prisma 7 with the PostgreSQL driver adapter | Type-safe persistence and a clear schema boundary around domain data. |
| Background work | Inngest events and a daily cron | Separates long-running platform I/O from web requests; jobs are retryable and concurrency-limited. |
| Cache strategy | Optional Upstash Redis read-through cache | Keeps the app functional locally without Redis while lowering latency and provider load in production. |
| External integrations | Platform-specific service modules | Prevents provider API details from leaking into pages, route handlers, or analytics logic. |
| AI resiliency | OpenAI output with an analytics-based fallback | Users receive actionable coaching even during key misconfiguration or provider failure. |
| Input validation | Zod schemas at API boundaries | Rejects malformed profile and credential payloads before persistence. |

## Repository map

```text
src/
├── app/                 # App Router pages, API routes, and server actions
├── components/          # UI, charts, auth, dashboard, and platform components
├── modules/             # Domain services and integration adapters
│   ├── analytics/       # Derived learner metrics and cache invalidation
│   ├── auth/            # Auth.js configuration, password utilities, validation
│   ├── ai/              # Personalized coach and model fallback
│   ├── learning/        # Live analytics used by learning experiences
│   ├── recommendations/ # Curriculum and personalized roadmap selection
│   ├── sync/            # Event-driven platform refresh requests
│   ├── leetcode/        # LeetCode integration
│   └── codeforces/      # Codeforces integration and ratings
├── jobs/                # Inngest event functions and scheduled jobs
├── shared/              # Prisma client, Redis cache, types, logging, utilities
└── hooks/               # Client-side React hooks
prisma/
├── schema.prisma        # Relational data model
└── migrations/          # Versioned database migrations
```

## Data model

The relational core separates identity, linked profiles, raw learning activity, and derived projections:

```text
User ──1:1── Profile ──1:N── Submission ──N:1── Problem
  │              │                  │
  │              ├──1:N── Rating    └── platform + topic metadata
  │              └──1:1── Analytics
  ├──1:N── DailyStats
  ├──1:N── Goal
  ├──1:N── Achievement
  └──1:N── RefreshLog
```

`Analytics` is a persisted read model, not merely a response assembled on every page load. This makes the dashboard inexpensive to render and gives background sync a single, explicit projection to refresh.

## Analytics methodology

- **Solved problems:** unique accepted problem records.
- **Difficulty mix:** unique accepted problems grouped by Easy, Medium, and Hard.
- **Topic mastery:** a bounded logarithmic score from accepted-problem coverage, preventing early volume from looking like complete mastery.
- **Weak and strong topics:** mastery below 40 and at least 75, respectively.
- **Acceptance rate:** unique accepted problems divided by unique attempted problems.
- **Streaks:** consecutive days with solved activity, calculated from daily statistics.

These signals inform both the recommendations engine and the AI coach. They are deliberately explainable: each headline metric can be traced to stored platform activity.

## Local development

### Prerequisites

- Node.js 20 or later
- PostgreSQL 14 or later
- An Inngest development server for local background jobs (recommended)
- Optional: Upstash Redis and an OpenAI API key

### Install and configure

```bash
npm install
```

Create `.env` with the values required for your environment. Do not commit this file.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/better_cp"
AUTH_SECRET="generate-a-long-random-secret"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional OAuth providers
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Optional performance and AI integrations
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
OPENAI_API_KEY=""

# Required when connecting a deployed Inngest service
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

Apply the existing migration and generate the Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Start the web application:

```bash
npm run dev
```

In a second terminal, start Inngest for local event delivery and scheduled functions:

```bash
npx inngest-cli@latest dev
```

The application runs at [http://localhost:3000](http://localhost:3000). Inngest discovers functions through `http://localhost:3000/api/inngest`.

## Operational playbook

### Development database changes

After updating `prisma/schema.prisma`, create a named migration and regenerate the client:

```bash
npx prisma migrate dev --name describe_the_change
npx prisma generate
```

### Production deployment

1. Provide all required environment variables in the deployment environment.
2. Run `npx prisma migrate deploy` as a release step.
3. Build and deploy the Next.js application.
4. Configure Inngest to invoke `/api/inngest` and validate its signing configuration.
5. Monitor refresh failures and external-provider rate limits using `RefreshLog` and platform observability.

For the current Vercel deployment, use `https://code-pulse-ojlk.vercel.app` as the production base URL. Set `AUTH_URL`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_APP_URL` to that base URL in the Production environment. When Google OAuth is enabled, register `https://code-pulse-ojlk.vercel.app/api/auth/callback/google` as an authorized redirect URI in Google Cloud Console.

### Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## API surface

| Endpoint | Purpose | Access |
| --- | --- | --- |
| `GET /api/auth/*` and `POST /api/auth/*` | Auth.js authentication handlers | Public / provider flow |
| `GET /api/user/profile` | Read the current user's profile | Authenticated |
| `POST /api/user/profile` | Validate and update linked handles and profile fields | Authenticated |
| `GET /api/analytics` | Return the current user's computed analytics | Authenticated |
| `GET/POST/PUT /api/inngest` | Inngest function registration and invocation | Inngest-managed |

## Scaling and reliability considerations

- **Idempotency:** platform records use stable platform identifiers and composite uniqueness for problems; refreshes are tracked independently in `RefreshLog`.
- **Concurrency control:** the user-refresh function limits concurrent executions to five.
- **Failure isolation:** `Promise.allSettled` lets one provider failure avoid blocking other configured fetches; Inngest retries failed work twice.
- **Fan-out safety:** the daily job selects up to 500 profiled users per run before emitting individual refresh events.
- **Caching:** cache failures fail open to the database path; cache invalidation happens after analytics recomputation.
- **Graceful degradation:** Redis, OAuth providers, and OpenAI are optional. Core credential login and deterministic coaching remain available with the corresponding configuration absent.

## Security notes

- Keep `.env` and all provider secrets outside source control.
- Require authenticated sessions for profile and analytics routes.
- Validate credentials and profile-update payloads with Zod.
- Use a production-grade, high-entropy `AUTH_SECRET` and HTTPS-only deployment configuration.
- Treat third-party platform data as untrusted input; normalize it in integration modules before it reaches analytics or UI code.

## Roadmap

- Add first-class ingestion adapters for the remaining stored platform handles.
- Introduce integration tests for provider adapters, analytics calculations, and authorization boundaries.
- Add observability for job duration, retry rate, cache hit rate, and provider failure categories.
- Harden ingestion idempotency with provider submission identifiers and database-level uniqueness where supported.
- Add pagination and incremental synchronization for high-volume competitive-programming histories.

## License

Private project. Add a license before distributing or accepting external contributions.
