# TeLos

### AI-powered technical interview simulator and assessment platform

TeLos is an open-source technical interview calibration studio built to bridge the gap between static algorithmic drills and live engineering interviews. It combines conversational voice interaction with real-time speech telemetry, 47 company-specific preparation guides, a multi-language coding workbench, and proctored technical assessments with browser-side attention signals.

---

<div align="center">

[![CI](https://github.com/piyush23-eng/TeLos/actions/workflows/ci.yml/badge.svg)](https://github.com/piyush23-eng/TeLos/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg?style=flat-square)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?style=flat-square)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=flat-square)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.2-2D3748.svg?style=flat-square)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**[Live Demo](https://telos.onrender.com)** • **[GitHub Repository](https://github.com/piyush23-eng/TeLos)** • **[Demo Video / Walkthrough](docs/images/demo.gif)**

</div>

---

## Screenshots & Demo

| Candidate Dashboard | Live AI Interview Session |
| :---: | :---: |
| ![Candidate Dashboard](docs/images/dashboard.png) | ![Live AI Interview](docs/images/interview.png) |

| Post-Interview Debrief Scorecard | Proctored Coding Assessment |
| :---: | :---: |
| ![Debrief Scorecard](docs/images/scorecard.png) | ![Proctored Assessment](docs/images/assessment.png) |

---

## Why TeLos?

Most technical interview preparation tools are fragmented. Candidates solve algorithmic puzzles on one platform, study system design theory on another, practice behavioral answers with generic chatbots, and take timed assessments on separate evaluation portals. 

TeLos unifies these distinct workflows into a single cohesive simulator:

1. **Context-Grounded Dialogue:** Rather than serving disconnected trivia questions, the AI interviewer ingests your resume, target company, and focus domain to conduct a progressive, multi-phase technical conversation.
2. **Delivery & Cadence Telemetry:** Technical competence is only half the battle in senior loops. TeLos tracks speaking pace (WPM), filler word frequency, and conversational balance in real time.
3. **Integrated Evaluation:** When a session concludes, you immediately receive a structured rubric debrief contrasting your verbatim responses with calibrated architectural model answers.

---

## Key Features

### 🎙️ AI Voice Interviews
* **Adaptive Questioning:** Generates dynamic follow-up questions tailored to your background, target role, and past answers in the conversation transcript.
* **Low-Latency Streaming:** Utilizes Server-Sent Events (SSE) to stream LLM tokens to the client with sub-second response latency.
* **Barge-In Interruption:** Lets you cut in and clarify requirements or redirect the conversation at any time, mimicking real human conversation dynamics.
* **Audio Visualizer:** Canvas-rendered acoustic visualizer indicating microphone activity and speech synthesis status.
* **Technical Scratchpad:** Built-in code and notes editor alongside the video avatar so you can sketch architecture topologies and algorithms during the interview.

### 📊 Interview Analytics
* **Speech Rate (WPM):** Calculates spoken words-per-minute dynamically to help you avoid rushing or stalling.
* **Filler Word Detection:** Tracks common vocal hesitation markers (*"um"*, *"like"*, *"basically"*, *"you know"*).
* **6-Dimension Evaluation:** Produces structured scores across Overall Readiness, Technical Depth, Systems Architecture, Communication, Edge Cases, and Speaking Cadence.
* **Comparative Feedback:** Direct side-by-side analysis contrasting "What You Said" with "What You Should Say" for senior engineering standards.
* **Markdown Export:** Generates formatted `.md` debrief scorecards for offline tracking and portfolio review.

### 🏢 Company Preparation
* **47 Structured Blueprints:** Tailored 6-week preparation roadmaps across 17 global technology companies (Google, Amazon, Meta, Microsoft, Apple, Netflix, Uber, Stripe, etc.) and 30 Indian product and fintech companies (Razorpay, Flipkart, Swiggy, Zomato, PhonePe, Cred, Zerodha, etc.).
* **Role Competency Mapping:** Highlights company-specific expectations, Bar Raiser rubrics, and authentic past interview themes.

### 💻 Coding Practice
* **24 Curated Drills:** Practical algorithmic and system implementation problems spanning data structures, caching, distributed locks, rate limiting, and concurrency.
* **Polyglot Runner:** Multi-language execution supporting JavaScript, Python 3, C++, C, and Java.
* **Dual Execution Strategy:** Runs code locally when host compilers are available, with automated fallbacks to cloud compiler services (Paiza and Wandbox) when local tooling is missing.

### 🛡️ Assessment Integrity
* **Browser-Side Attention Signals:** Leverages MediaPipe FaceLandmarker running locally in WebAssembly to monitor head orientation and gaze direction without sending video streams to any server.
* **Integrity Monitoring:** Detects tab switches, clipboard paste events, and loss of window focus.
* **Timed Multi-Task Environment:** 75-minute proctored assessment screens with question navigators and live solution testing.

---

## Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend Client (React 18 + TypeScript + Vite)"]
        UI["Studio / Dashboard / Drills / Assessment UI"]
        Vision["MediaPipe WebAssembly (Face & Gaze Landmarks)"]
        Audio["Web Audio & Speech Synthesis Engine"]
    end

    subgraph Server ["Backend Gateway (Node.js + Express + TypeScript)"]
        Auth["Session Auth & Scrypt Password Hashing"]
        SSE["SSE Token Streamer (/api/interviewer/next/stream)"]
        Debrief["Debrief & Evaluation Engine (/api/interview/debrief)"]
        Runner["Constrained Code Runner (/api/run)"]
        RateLimit["Sliding-Window Rate Limiter"]
    end

    subgraph Persistence ["Persistence Layer"]
        Prisma["Prisma ORM"]
        Postgres[("PostgreSQL Database")]
        MemStore["In-Memory State Fallback"]
    end

    subgraph External ["External Services"]
        LLM["OpenRouter / LLM Providers (Llama 3.3 70B, Gemini)"]
        Speech["Deepgram Nova-3 / ElevenLabs (Optional TTS/STT)"]
        CloudRunners["Paiza / Wandbox Cloud Compiler APIs"]
    end

    UI <--> |SSE Streaming & REST| Server
    Vision -.-> |Integrity Events| UI
    Audio <--> UI

    Auth --> Prisma
    Debrief --> LLM
    SSE --> LLM
    Server -.-> |Optional Cloud Voice| Speech
    Runner --> CloudRunners
    Prisma --> Postgres
    Prisma -.-> |Offline Fallback| MemStore
```

---

## Engineering Highlights

* **Real-Time Token Streaming with SSE:** Uses Server-Sent Events (`text/event-stream`) to stream LLM responses token-by-token directly to the speech synthesis queue, avoiding multi-second delays before playback starts.
* **Multi-Provider LLM Orchestration:** Implements an adaptable intelligence provider supporting OpenRouter, Gemini, OpenAI, Anthropic, and local Ollama models, with a heuristic transcript-grounded fallback if external APIs are unavailable.
* **Conversational Turn-Taking & Interruption:** Implements abort controllers and audio playback cancellation to enable real-time barge-in when a candidate begins speaking.
* **Client-Side Cadence Mathematics:** Computes speaking pace and vocal filler frequency client-side using deterministic regex tokenization and time-windowed speech telemetry.
* **High-Resilience Persistence Layer:** Integrates Prisma ORM with PostgreSQL, backed by an in-memory storage fallback to ensure the platform remains fully functional during local development or database maintenance.
* **Dual-Tier Constrained Code Runner:** Executes user submissions within restricted local child processes with stripped environments and execution timeouts (4,000 ms), routing automatically to cloud compilation APIs when compilers are absent.
* **Privacy-Preserving Attention Telemetry:** Processes facial and gaze landmarks entirely within the candidate's browser using MediaPipe FaceLandmarker in WebAssembly, preventing raw video data from ever leaving the client.
* **Automated CI/CD Pipeline:** Enforces type safety (`tsc -b`), full-suite Vitest unit tests, and production build verification on every commit via GitHub Actions.

---

## Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 6, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js 20, Express 4, TypeScript, Server-Sent Events (SSE) |
| **AI & LLM Services** | OpenRouter (Llama 3.3 70B, Gemini 2.0 Flash), Deepgram Nova-3, ElevenLabs |
| **Database & ORM** | PostgreSQL 16, Prisma ORM 6 |
| **Computer Vision** | MediaPipe FaceLandmarker (WebAssembly / GPU delegate) |
| **Code Execution** | Node.js `child_process` / `vm`, OpenJDK 17/21, GCC 13, Paiza / Wandbox APIs |
| **DevOps & Deployment** | Docker (multi-stage Alpine), Render, GitHub Actions |
| **Testing** | Vitest 3, TypeScript compiler (`tsc -b`) |

---

## Project Structure

```
TeLos/
├── server/
│   ├── index.ts              # Express API gateway, authentication, rate limits, & SSE
│   ├── intelligence.ts       # LLM provider orchestration, prompt templates, & debriefs
│   ├── runner.ts             # Polyglot constrained execution & cloud compiler fallbacks
│   ├── intelligence.test.ts  # Unit tests for debrief analysis & fallback logic
│   ├── runner.test.ts        # Unit tests for code runner & execution restrictions
│   └── mockData.ts           # Curated problem catalog, personas, & sample sessions
├── src/
│   ├── components/
│   │   ├── VoiceOrbVisualizer.tsx    # Canvas-rendered acoustic voice orb visualizer
│   │   └── HumanInterviewerAvatar.tsx # Photorealistic avatar with audio lip-syncing
│   ├── App.tsx               # Main application routing and feature workflows
│   ├── Assessment.tsx        # Proctored coding assessment interface with MediaPipe
│   ├── AuthModal.tsx         # User authentication & candidate profile dialog
│   ├── UserDashboard.tsx     # Candidate telemetry history, streaks, & metrics
│   ├── apiConfig.ts          # Centralized API URL resolution & client safe storage
│   ├── companyPrepData.ts    # 47 Curated company interview playbooks
│   ├── problemCatalog.ts     # 24 Practice problems with test cases
│   ├── voiceMetrics.ts       # WPM cadence math, filler parser & report exporter
│   ├── voiceMetrics.test.ts  # Unit tests for speech cadence math & debrief generation
│   ├── roadmap.css           # Modern brutalist theme & dark mode styles
│   └── styles.css            # Base styles and resets
├── docs/
│   └── images/               # Repository screenshots & visual assets
├── scripts/
│   ├── keepalive.ts          # Automated health check probe
│   └── setup-jdk.mjs         # OpenJDK runtime bootstrapper
├── prisma/
│   ├── schema.prisma         # PostgreSQL data models (User, Session, Question, Score)
│   └── seed.ts               # Database seeder
├── .github/
│   └── workflows/
│       ├── ci.yml            # Automated CI testing, linting, and build pipeline
│       └── keepalive.yml     # Scheduled cron probe for cloud database
├── Dockerfile                # Multi-stage production container configuration
├── render.yaml               # Cloud deployment blueprint
└── package.json              # Project scripts and dependencies
```

---

## Getting Started

### Prerequisites
* **Node.js**: `v20.x` or later
* **npm**: `v10.x` or later
* **Compilers (Optional):** `python3`, `g++`, `javac` (cloud runners will execute automatically if local compilers are absent)

### 1. Clone the Repository
```bash
git clone https://github.com/piyush23-eng/TeLos.git
cd TeLos
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` and configure your API keys:
```env
# Required for live AI interviews and dynamic debrief reports
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: PostgreSQL Database (defaults to in-memory fallback if omitted)
DATABASE_URL="postgresql://username:password@localhost:5432/telos?schema=public"
```

### 3. Initialize Database Schema
```bash
npx prisma generate
npx prisma db push
npm run seed
```

### 4. Run Automated Tests & Typecheck
```bash
npm run lint
npm test
```

### 5. Start Development Server
```bash
# Starts both frontend (Vite :5173) and backend API (Express :8787)
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Environment Variables

| Variable | Description | Default / Requirement |
| :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | Core API key for LLM interview prompts and debrief reports | **Required** for AI interview features |
| `DATABASE_URL` | PostgreSQL connection string | *Optional* (falls back to resilient in-memory storage) |
| `PORT` | Backend server port | *Optional* (defaults to `8787`) |
| `AUTH_SESSION_SECRET` | HMAC secret for signing authentication tokens | *Optional* (defaults to development secret) |
| `OPENROUTER_MODEL` | Default LLM model identifier | *Optional* (defaults to `meta-llama/llama-3.3-70b-instruct`) |
| `DEEPGRAM_API_KEY` | Optional speech-to-text service key | *Optional* (falls back to native Web Speech API) |
| `ELEVENLABS_API_KEY` | Optional text-to-speech voice key | *Optional* (falls back to native Web Speech Synthesis) |

---

## Deployment

### Docker Deployment
Build and launch the containerized application locally or on any cloud server:
```bash
# Build the production container image
docker build -t telos .

# Run container with environment variables
docker run -p 8787:8787 -e OPENROUTER_API_KEY="your_key" telos
```

### Render Deployment
This repository contains a [`render.yaml`](render.yaml) blueprint:
1. Connect your repository to [Render](https://render.com).
2. Create a new **Blueprint** service pointing to the repository.
3. Configure `OPENROUTER_API_KEY` and optional `DATABASE_URL` in the Render dashboard.

---

## Testing

TeLos uses [Vitest](https://vitest.dev/) for unit and integration testing:

```bash
# Run all test suites
npm test

# Run typecheck and linting
npm run lint

# Run production build verification
npm run build
```

The automated test suite exercises:
* **Speech Metrics (`src/voiceMetrics.test.ts`):** Words-per-minute pace math, vocal filler detection regexes, session telemetry bounds, and markdown report generation.
* **Code Execution Restrictions (`server/runner.test.ts`):** JavaScript sandbox execution, error handling, and security blocking of dangerous OS/subprocess calls.
* **Intelligence & Debriefs (`server/intelligence.test.ts`):** Model selection, transcript-grounded analysis fallback, and prompt structure verification.

---

## Known Limitations

* **External API Latency:** Real-time conversational latency is influenced by the network round-trip time to third-party LLM providers (e.g. OpenRouter, Gemini).
* **Code Execution Scope:** The local and cloud execution environments are designed for single-file algorithmic programs and standard library modules. System calls, network access, and background daemons are restricted.
* **Browser Speech Recognition Support:** Client-side speech recognition utilizes the browser's Web Speech API. Performance is optimal in Chromium-based browsers (Chrome, Edge, Brave); Safari and Firefox gracefully fall back to speech synthesis and manual text input.
* **Attention Telemetry Constraints:** MediaPipe attention signals provide ambient focus indicators based on facial landmarks. They are designed for self-guided integrity awareness, not biometric identity verification.
* **Scoring Rubrics:** Automated debrief scores are generated by LLMs against structured rubrics. They serve as practice benchmarks rather than official hiring guarantees.

---

## Future Improvements

* [ ] WebAssembly-isolated micro-sandboxes for native zero-cloud code execution.
* [ ] Multi-interviewer panel simulations (e.g. concurrent System Architect + Engineering Manager).
* [ ] Audio waveform playback streaming directly through Web Audio API worklets.
* [ ] Expanded mobile and tablet touch optimizations for the coding workbench.

---

## License

Created by Piyush. Licensed under the [MIT License](LICENSE).
