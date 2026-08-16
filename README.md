# ⚡ CodePulse

### Competitive Programming Intelligence Platform

> **Connect. Analyze. Improve.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://code-pulse-ojlk.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge\&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge\&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge\&logo=postgresql)](https://www.postgresql.org/)

**CodePulse** is a full-stack competitive programming intelligence platform that connects coding profiles, aggregates activity from multiple platforms, and transforms raw submissions into **actionable analytics, topic mastery insights, personalized recommendations, and AI-powered coaching**.

Unlike a simple problem counter, CodePulse is designed to answer:

> **What are you good at, where are you weak, and what should you solve next?**

### 🌐 Live Application

**[🚀 Open CodePulse →](https://code-pulse-ojlk.vercel.app/)**

---

## 📸 Product Tour

### 🏠 Landing Page

The entry point to CodePulse, introducing the platform and its competitive programming analytics experience.



> ![CodePulse Landing Page](image.png)

---

### 🔐 Authentication

Secure authentication powered by **Auth.js**, supporting credentials and OAuth providers.

#### Login Page

![alt text](image-1.png)

#### Sign Up Page

![alt text](image-2.png)

---

### 🔵 Google Authentication

Sign in securely using a Google account through OAuth.

![alt text](image-3.png)

---

### ⚫ GitHub Authentication

Authenticate using GitHub OAuth and connect the development ecosystem with CodePulse.


---

### 📊 Dashboard Overview

The central command center for a user's competitive programming journey.

View important information in one place:

* Total solved problems
* Platform statistics
* Difficulty distribution
* Recent activity
* Streaks
* Progress signals
* Personalized insights

![CodePulse Dashboard](./public/screenshots/dashboard-overview.png)

![alt text](image-4.png)

---

### 📈 Analytics Dashboard

CodePulse transforms normalized submission data into meaningful performance analytics.

![CodePulse Analytics](./public/screenshots/analytics.png)

> **Screenshot:** `![alt text](image-5.png)

Analytics include:

* Solved problem statistics
* Acceptance rate
* Difficulty distribution
* Platform performance
* Progress trends
* Daily activity
* Streak calculations

---

### 🧠 Topic Mastery Analysis

Identify strengths and weaknesses across competitive programming topics.

![Topic Mastery](./public/screenshots/topic-mastery.png)

> **Screenshot:** ![alt text](image-6.png)

Instead of only tracking problem counts, CodePulse derives mastery signals from accepted problem activity.

```text
Arrays          ██████████  Strong
Binary Search   ████████░░  Improving
Graphs          ██████░░░░  Developing
Dynamic Prog.   ████░░░░░░  Weak Area
```

These signals directly influence recommendations and AI coaching.

---

### 🎯 Personalized Recommendations

CodePulse analyzes user performance and identifies areas that deserve attention.


The recommendation engine considers signals such as:

* Topic mastery
* Weak areas
* Solving history
* Difficulty distribution
* Learning priorities

```text
Your Activity
      ↓
Analytics Engine
      ↓
Strength / Weakness Detection
      ↓
Recommendation Engine
      ↓
What to Learn Next
```

---

### 🗺️ Personalized Learning Roadmap

CodePulse helps transform analytics into a structured next step.

![Learning Roadmap](./public/screenshots/roadmap.png)

> **Screenshot:** ![alt text](image-11.png)

The roadmap experience helps users focus on:

* Priority topics
* Recommended patterns
* Problems to practice
* Learning progression

---

### 🤖 AI Competitive Programming Coach

The AI coach uses computed analytics to generate personalized guidance.

![AI Coach](./public/screenshots/ai-coach.png)

> **Screenshot:** ![alt text](image-7.png)

The coach can provide:

* Weekly study plans
* Readiness assessments
* Priority recommendations
* Focus areas
* Suggested next actions

Example:

```text
Your Binary Search performance has improved recently.

Dynamic Programming remains one of your weakest areas.

Recommended focus:
1. Basic 1D DP
2. Knapsack patterns
3. LIS and subsequence problems
```

### Graceful AI Fallback

If an AI provider is unavailable or not configured, CodePulse falls back to deterministic analytics-based recommendations.

```text
Analytics
    │
    ▼
AI Available?
   / \
 Yes  No
  │    │
  ▼    ▼
AI Coach   Analytics-Based
Response   Fallback
   \         /
    └───┬───┘
        ▼
       User
```

---

### 🔗 Platform Profile Management

Users can manage their competitive programming identities from a single profile.

![Profile Settings](./public/screenshots/profile-settings.png)

> **Screenshot:** ![alt text](image-8.png)

Supported profile identifiers include:

* LeetCode
* Codeforces
* CodeChef
* GeeksforGeeks
* AtCoder
* GitHub

---

### 🔄 Platform Synchronization

CodePulse separates external platform collection from user-facing requests.


Current platform synchronization architecture includes:

```text
User Requests Refresh
        │
        ▼
Refresh Request Recorded
        │
        ▼
platform/refresh.requested
        │
        ▼
┌───────────────────────────┐
│   Inngest Background Job  │
└─────────────┬─────────────┘
              │
      ┌───────┴────────┐
      ▼                ▼
  LeetCode        Codeforces
      │                │
      └───────┬────────┘
              ▼
       Normalize Data
              │
              ▼
        PostgreSQL
              │
              ▼
   Recompute Analytics
              │
              ▼
     Updated Dashboard
```

Slow and failure-prone external API calls do not block normal dashboard requests.

---

### 🎯 Personal Goals

Users can set and track their competitive programming goals.

![Goals](./public/screenshots/goals.png)

> **Screenshot:** ![alt text](image-9.png)

Goals help turn long-term improvement into measurable progress.

---

### 🏆 Achievements

Track milestones and accomplishments throughout the competitive programming journey.


---

### 🏅 Contest Discovery

Discover and track competitive programming contests.

![Contests](./public/screenshots/contests.png)

> **Screenshot:** ![alt text](image-10.png)

---

# ✨ Core Features

| Feature            | Description                                             |
| ------------------ | ------------------------------------------------------- |
| 🔐 Authentication  | Credentials, Google OAuth, and GitHub OAuth             |
| 🔗 Profile Linking | Manage identifiers across multiple coding platforms     |
| 🔄 Background Sync | Event-driven platform synchronization                   |
| 📊 Analytics       | Solved counts, acceptance rate, difficulty mix, streaks |
| 🧠 Topic Mastery   | Identify strong and weak competitive programming topics |
| 🎯 Recommendations | Personalized practice recommendations                   |
| 🗺️ Roadmap        | Analytics-driven learning direction                     |
| 🤖 AI Coach        | Personalized study guidance and readiness assessment    |
| 🔥 Streak Tracking | Track consistent problem-solving activity               |
| 🎯 Goals           | Define and monitor learning goals                       |
| 🏆 Achievements    | Track important competitive programming milestones      |
| 🏅 Contests        | Contest discovery and related experiences               |
| ⚡ Caching          | Redis-powered read-through caching                      |
| 🔁 Background Jobs | Retryable and concurrency-controlled workflows          |

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────────┐
                         │       Next.js App         │
                         │ App Router + React 19 UI  │
                         └─────────────┬────────────┘
                                       │
                  ┌────────────────────┼────────────────────┐
                  │                    │                    │
           Server-rendered        Route Handlers       Server Actions
           dashboard pages           /api/*           auth and updates
                  │                    │                    │
                  └────────────────────┴────────────────────┘
                                       │
                         ┌─────────────▼─────────────┐
                         │       Domain Modules       │
                         │                            │
                         │ auth · sync · analytics    │
                         │ goals · learning · AI      │
                         │ recommendations            │
                         └───────┬───────────┬────────┘
                                 │           │
                 ┌───────────────▼───┐   ┌───▼────────────────┐
                 │ PostgreSQL + Prisma│   │ Upstash Redis      │
                 │ Source of Truth    │   │ Read-Through Cache │
                 └───────────────┬───┘   └────────────────────┘
                                 │
                         Events / Scheduled Work
                                 │
                         ┌───────▼───────────┐
                         │      Inngest       │
                         │ Sync Orchestration │
                         └───────┬───────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │ LeetCode / Codeforces APIs│
                    └───────────────────────────┘
```

---

# 🧩 Architecture Philosophy

CodePulse uses a **modular monolith with event-driven background processing**.

The application is not unnecessarily split into microservices. Instead, major domains are isolated into independent modules while maintaining the simplicity of a single deployment.

```text
Next.js Application
        │
        ├── Authentication Module
        ├── Platform Integration Module
        │      ├── LeetCode
        │      └── Codeforces
        ├── Synchronization Module
        ├── Analytics Module
        ├── Recommendation Module
        ├── Learning Module
        └── AI Module
                 │
                 ▼
        Event-Driven Background Jobs
                 │
                 ▼
        PostgreSQL + Redis
```

This provides:

* Clear separation of concerns
* Independent domain boundaries
* Easier testing and maintenance
* Extensible platform integrations
* Background processing
* A path to future service extraction if scale requires it

---

# 🔄 Data Flow

```text
User Links Platform Profiles
           │
           ▼
User Requests Synchronization
           │
           ▼
RefreshLog Records Pending Work
           │
           ▼
platform/refresh.requested Event
           │
           ▼
       Inngest Worker
           │
    ┌──────┴───────┐
    ▼              ▼
LeetCode      Codeforces
    │              │
    └──────┬───────┘
           ▼
   Normalize Activity
           │
           ▼
   PostgreSQL Storage
           │
           ▼
 Analytics Computation
           │
           ▼
Persisted Analytics Model
           │
    ┌──────┼─────────────┐
    ▼      ▼             ▼
Dashboard Roadmap     AI Coach
```

---

# 🧠 Analytics Engine

CodePulse converts raw activity into explainable learner signals.

| Metric          | Method                                                   |
| --------------- | -------------------------------------------------------- |
| Solved Problems | Unique accepted problem records                          |
| Difficulty Mix  | Accepted problems grouped by difficulty                  |
| Topic Mastery   | Bounded logarithmic score from accepted problem coverage |
| Weak Topics     | Mastery below the defined weakness threshold             |
| Strong Topics   | Mastery above the defined strength threshold             |
| Acceptance Rate | Unique accepted ÷ unique attempted problems              |
| Streaks         | Consecutive days with solved activity                    |

### Persisted Read Model

Analytics are not recomputed for every dashboard request.

```text
Platform Activity
       │
       ▼
PostgreSQL
       │
       ▼
Analytics Computation
       │
       ▼
Persisted Analytics Snapshot
       │
       ├──► Dashboard
       ├──► Recommendations
       └──► AI Coach
```

This makes expensive derived data explicit and keeps dashboard reads efficient.

---

# 🔌 Platform Integration Design

Provider-specific logic is isolated behind dedicated integration modules.

```text
                    CodePulse Core
                          │
                          ▼
                Platform Integration Layer
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     LeetCode        Codeforces      Future Adapters
     Integration      Integration
          │               │
          └───────┬───────┘
                  ▼
          Normalized Data Model
                  │
                  ▼
           Analytics Engine
                  │
          ┌───────┴────────┐
          ▼                ▼
    Recommendations     AI Coach
```

This prevents provider-specific response formats from leaking into the analytics or UI layers.

---

# 🗄️ Data Model

```text
User ──1:1── Profile ──1:N── Submission ──N:1── Problem
  │              │                  │
  │              ├──1:N── Rating    └── Platform + Topic Metadata
  │              │
  │              └──1:1── Analytics
  │
  ├──1:N── DailyStats
  ├──1:N── Goal
  ├──1:N── Achievement
  └──1:N── RefreshLog
```

> **Design principle:** Raw platform activity is stored separately from derived learner intelligence, allowing analytics to evolve and be recomputed without re-ingesting historical data.

---

# 🛠️ Technology Stack

| Layer           | Technologies                                     |
| --------------- | ------------------------------------------------ |
| Application     | Next.js 16, React 19, TypeScript, App Router     |
| UI              | Tailwind CSS, Radix UI                           |
| Visualization   | Recharts                                         |
| Authentication  | Auth.js, Google OAuth, GitHub OAuth, Credentials |
| Database        | PostgreSQL                                       |
| ORM             | Prisma 7 + PostgreSQL Driver Adapter             |
| Background Jobs | Inngest Events, Cron Scheduling, Retries         |
| Caching         | Upstash Redis                                    |
| AI              | OpenAI + Deterministic Analytics Fallback        |
| Validation      | Zod                                              |
| Deployment      | Vercel                                           |

---

# ⚙️ Key Engineering Decisions

| Concern          | Design                            | Why                                                           |
| ---------------- | --------------------------------- | ------------------------------------------------------------- |
| Architecture     | Modular monolith                  | Strong boundaries without unnecessary microservice complexity |
| Data Sync        | Event-driven jobs                 | External APIs do not block user-facing requests               |
| Database         | PostgreSQL + Prisma               | Type-safe relational persistence                              |
| Analytics        | Persisted read model              | Avoid repeated expensive calculations                         |
| Cache            | Redis read-through cache          | Faster reads without making Redis a correctness dependency    |
| Failure Handling | `Promise.allSettled`              | One provider failure does not block others                    |
| Background Work  | Inngest                           | Retryable, scheduled, concurrency-controlled workflows        |
| AI               | Provider + deterministic fallback | Recommendations remain available during AI failures           |
| Validation       | Zod                               | Reject malformed input at application boundaries              |

---

# 🛡️ Reliability & Scaling

### Idempotency

Platform records use stable identifiers and uniqueness constraints to reduce duplicate data during repeated synchronization.

### Concurrency Control

Refresh workflows use controlled concurrency to avoid overwhelming external providers.

### Failure Isolation

```text
Platform Synchronization
        │
        ├── LeetCode      ✅
        ├── Codeforces    ❌
        └── Remaining Work Continues
```

One provider failure does not prevent successful providers from updating.

### Retryable Workflows

Background jobs can retry failed work independently.

### Cache Fail-Open

```text
Redis Available?
    │
   / \
 Yes  No
 │     │
 ▼     ▼
Cache PostgreSQL
 │      │
 └──┬───┘
    ▼
 Response
```

The database remains the source of truth.

---

# 📂 Project Structure

```text
src/
├── app/                 # App Router pages, API routes, server actions
├── components/          # UI, charts, auth and dashboard components
│
├── modules/
│   ├── analytics/       # Derived learner metrics
│   ├── auth/            # Authentication and validation
│   ├── ai/              # Personalized coach and fallback
│   ├── learning/        # Learning experiences
│   ├── recommendations/ # Personalized roadmap selection
│   ├── sync/            # Event-driven synchronization
│   ├── leetcode/        # LeetCode integration
│   └── codeforces/      # Codeforces integration
│
├── jobs/                # Inngest functions and scheduled jobs
│
├── shared/
│   ├── db/
│   ├── cache/
│   ├── logger/
│   ├── types/
│   └── utils/
│
└── hooks/

prisma/
├── schema.prisma
└── migrations/

public/
└── screenshots/
    ├── landing-page.png
    ├── login-page.png
    ├── signup-page.png
    ├── google-auth.png
    ├── github-auth.png
    ├── dashboard-overview.png
    ├── analytics.png
    ├── topic-mastery.png
    ├── recommendations.png
    ├── ai-coach.png
    ├── roadmap.png
    ├── profile-settings.png
    ├── platform-sync.png
    ├── goals.png
    ├── achievements.png
    └── contests.png
```

---

# 🚀 Getting Started

## Prerequisites

* Node.js 20+
* PostgreSQL 14+
* Inngest development server recommended
* Optional Upstash Redis
* Optional OpenAI API key

## Installation

```bash
git clone https://github.com/gnshx/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
npm install
```

Create `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/codepulse"

AUTH_SECRET="your-long-random-secret"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

OPENAI_API_KEY=""

INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

Run database migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

Start the application:

```bash
npm run dev
```

Start local background jobs:

```bash
npx inngest-cli@latest dev
```

---

# 🧪 Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

# 🗺️ Roadmap

* [ ] Add first-class ingestion adapters for additional platforms
* [ ] Incremental synchronization for large submission histories
* [ ] Pagination for high-volume platform activity
* [ ] Integration tests for provider adapters
* [ ] Analytics calculation tests
* [ ] Authorization boundary tests
* [ ] Job duration and retry observability
* [ ] Cache hit-rate monitoring
* [ ] Provider failure categorization
* [ ] Stronger submission-level idempotency
* [ ] Expand recommendation intelligence

---

# 🎓 Engineering Concepts Demonstrated

```text
✓ Full-Stack TypeScript
✓ Next.js App Router
✓ Server Rendering
✓ Server Actions
✓ Route Handlers
✓ OAuth Authentication
✓ External API Integration
✓ Data Normalization
✓ Relational Database Design
✓ PostgreSQL
✓ Prisma ORM
✓ Event-Driven Architecture
✓ Background Jobs
✓ Scheduled Jobs
✓ Retryable Workflows
✓ Concurrency Control
✓ Failure Isolation
✓ Redis Caching
✓ Persisted Read Models
✓ Analytics Pipelines
✓ Domain-Based Architecture
✓ Input Validation
✓ AI Integration
✓ Graceful Degradation
✓ Production Deployment
```

---

# 🌐 Live Demo

### **[🚀 Try CodePulse](https://code-pulse-ojlk.vercel.app/)**

---

# 💡 The Core Idea

> **Raw activity tells you what you did. Analytics tells you how you are doing. Recommendations tell you what to do next.**

```text
          CONNECT
             │
             ▼
      Coding Platforms
             │
             ▼
          ANALYZE
             │
             ▼
    Personalized Insights
             │
             ▼
          IMPROVE
             │
             ▼
    Roadmaps + AI Coaching
```

### Built to help competitive programmers move from **tracking progress** to **understanding and improving it**.

---

⭐ If you found CodePulse useful, consider giving the repository a star.
