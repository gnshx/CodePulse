# Better CP

## Competitive Programming Intelligence Platform

> **Connect. Analyze. Improve.**

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

## Beyond a problem counter

Most trackers show activity. Better CP turns activity into an informed next action.

```text
Raw coding activity
        ↓
Platform synchronization
        ↓
Normalized data model
        ↓
Analytics engine
        ↓
Strength and weakness detection
        ↓
Personalized roadmap and AI coaching
```

This makes questions such as these answerable from a learner's actual history:

- Which topics are strongest, and which need deliberate practice?
- Is progress consistent, or has practice volume slowed down?
- What is the highest-value next pattern or problem set?
- How are difficulty mix, streaks, and contest performance evolving?

## Architecture

### Architecture philosophy

Better CP is a **modular monolith with event-driven background processing**. It keeps the deployment and operational simplicity of one Next.js application, while isolating authentication, integrations, synchronization, analytics, recommendations, and coaching into domain modules.

This avoids premature distributed-system complexity while preserving clear boundaries for testing, ownership, and future service extraction.

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

```text
User requests refresh
        ↓
RefreshLog records pending work
        ↓
platform/refresh.requested event
        ↓
Inngest worker
        ↓
LeetCode and Codeforces fetch steps run independently
        ↓
Normalize and persist activity
        ↓
Recompute the Analytics read model
        ↓
Dashboard, roadmap, and coach read the new projection
```

The worker uses parallel steps, retryable execution, and a concurrency limit. Platform collection is kept out of user-facing request paths, and one provider's failure does not prevent other work from finishing.

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

## Technology stack

| Layer | Technologies |
| --- | --- |
| Application | Next.js 16, React 19, TypeScript, App Router |
| UI and visualization | Tailwind CSS, Radix UI, Recharts |
| Identity | Auth.js, OAuth (Google and GitHub), credentials authentication |
| Data | PostgreSQL, Prisma 7, PostgreSQL driver adapter |
| Async workflows | Inngest events, cron scheduling, retries, concurrency controls |
| Performance | Upstash Redis read-through caching |
| Intelligence | OpenAI with deterministic analytics-based fallback |
| Deployment | Vercel |

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

> **Design principle:** raw platform activity is stored separately from derived learner intelligence, so the analytics methodology can evolve and be recomputed without re-ingesting history.

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

## Reliability and scaling

- **Idempotency:** platform records use stable platform identifiers and composite uniqueness for problems; refreshes are tracked independently in `RefreshLog`.
- **Concurrency control:** the user-refresh function limits concurrent executions to five.
- **Failure isolation:** `Promise.allSettled` lets one provider failure avoid blocking other configured fetches; Inngest retries failed work twice.
- **Fan-out safety:** the daily job selects up to 500 profiled users per run before emitting individual refresh events.
- **Caching:** cache failures fail open to the database path; cache invalidation happens after analytics recomputation.
- **Graceful degradation:** Redis, OAuth providers, and OpenAI are optional. Core credential login and deterministic coaching remain available with the corresponding configuration absent.

The current domain boundaries support future extraction of platform synchronization, analytics computation, or coaching workloads only when scale or team topology justifies the extra operational cost.

## Engineering focus

This project demonstrates the systems concepts that matter in a production full-stack application:

- Full-stack TypeScript with server rendering, route handlers, and server actions.
- OAuth, credential authentication, authorization boundaries, and secure environment configuration.
- External API integration, data normalization, and relational schema design.
- Event-driven background processing, retries, controlled concurrency, and failure isolation.
- Persisted read models, caching, cache fail-open behavior, and data-driven recommendations.
- AI integration with deterministic graceful degradation.

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

## The core idea

> Raw activity tells you what you did. Analytics tells you how you are doing. Recommendations tell you what to do next.

Better CP connects these layers to help competitive programmers move from tracking progress to understanding and improving it.

## License

Private project. Add a license before distributing or accepting external contributions.
