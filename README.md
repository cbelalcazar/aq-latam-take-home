# AfterQuery: AI Interviewer Infrastructure Benchmark

Welcome to the **AfterQuery AI Interviewer** technical assessment. This platform is designed to capture professional expertise through dynamic reasoning traces and expert-grounded benchmarks.

---

## 🛠️ Assignment Overview
- **Objective**: Build a voice-driven AI Interviewer platform for domain experts.
- **Repository**: Developed as part of the AfterQuery Infrastructure Team evaluation via Candidate Code.
- **Deployment**: [https://aq-latam-take-home-zeta.vercel.app/](https://aq-latam-take-home-zeta.vercel.app/)

---

## 🚀 Key Features & Implementation

### 1. Voice-First Agentic Interface
- **Web Speech API Integration**: Real-time voice recognition and synthesis for an immersive, low-latency interview experience.
- **Manual Review Flow**: Implemented a "Captured Signal" review state to ensure data integrity before AI processing.
- **Auto-Silence Detection**: Intelligent microphone management with synchronous locking to prevent race conditions.

### 2. Expert Reasoning Infrastructure (Stretch Goal #1)
- **Reasoning Trace Panel**: Real-time observability into the AI's internal logic, displaying detected skills, knowledge gaps, and heuristic intent for every turn.
- **Grounding & Dynamic Follow-ups**: The engine asks at least 6 role-specific questions, including targeted follow-ups based on historical context.

### 3. Structured Data Control (Stretch Goal #2)
- **Role-Specific Question Packs**: Injected high-fidelity technical and behavioral question banks for each position (Backend, PM, Finance) to guide the model's epistemological trajectory.

---

## 🧠 Architectural Decisions (The "Founding Engineer" Approach)

### Frontend: Deterministic State Management
- **Zustand + Finite State Machine (FSM)**: Migrated from fragmented `useState` to a centralized store and a formal FSM. This eliminates impossible states and ensures a robust sequence: `IDLE` → `THINKING` -> `SPEAKING` -> `LISTENING` -> `REVIEWING`.
- **Custom Hooks Abstraction**: Decoupled UI from logic via `useVoiceInput` and `useAIEngine` hooks, allowing for future model/provider hot-swapping.
- **Editorial UI/UX**: Designed with AfterQuery's "Light Mode Editorial" aesthetic—focusing on whitespace, high-contrast typography, and a "living document" grainy texture.

### Backend: Infrastructure Scalability
- **Provider Pattern**: Implemented an `LLMProvider` interface to decouple the business logic from specific API SDKs (currently orchestrated via **OpenRouter**).
- **Prompt Engineering Factory**: Centralized all AI instructions into a `PromptFactory` to facilitate rapid research experimentation and template versioning.
- **Validation & Telemetry**: Every API request is validated via **Zod** and wrapped in a **Telemetry layer** that logs structured JSON metadata, including latency and execution steps.

---

## 🏃 Getting Started

### 1. Environment Variables
Create a `.env.local` file:
```env
OPENROUTER_API_KEY=your_sk_key_here
```

### 2. Local Development
```bash
npm install
npm run dev
```

### 3. Production Build
```bash
npm run build
```

---
*Built with Pragmatic Rigor for the AfterQuery Software Engineer (Infrastructure) Technical Assessment.*
