# SketchFlow Hub

# Application Prompt: Sketch-Core Support & Action Control Hub

## 1. Vision & Visual Theme

Build a production-ready, ultra-premium white-themed frontend application in React, TypeScript, and Tailwind CSS.

- Visual Style: Paper-white canvas with a subtle hand-drawn / sketch aesthetic (clean architectural blueprint/Excalidraw feel).

- Theme Palette: 

  - Background: Pure White (`#FFFFFF`) & Paper White (`#FBFBFB`)

  - Outlines & Text: Dark Charcoal Ink (`#1A1A1A`)

  - Grid & Accent Lines: Soft Graphite (`#E5E5E5`)

  - Accent Color: Electric Blue Ink (`#2563EB`)

- Animations: Micro-wobble on hover, hand-drawn outline tracing effects on load (Framer Motion), floating background grid particles, and fluid SSE stream typing animations for AI responses.

---

## 2. Complete API Endpoint Coverage & Wiring

Create a centralized API client (`src/lib/api.ts`) matching all endpoints defined in the OpenAPI spec:

1. POST /api/chat

   - Summary: Stream agent response as Vercel AI SDK compatible SSE events.

   - Body: `{ messages: ChatMessageIn[], thread_id?: string, user_id?: string }`

2. GET /api/threads

   - Summary: List existing thread sessions.

   - Query Params: `limit` (number, default 100).

3. GET /api/threads/{thread_id}

   - Summary: Fetch historical messages and state for a specific thread.

4. DELETE /api/threads/{thread_id}

   - Summary: Delete a specific thread session.

5. GET /api/users

   - Summary: Query and list user records.

   - Query Params: `department` (string), `role` (string), `active` (boolean), `query` (string).

6. GET /api/actions

   - Summary: List agent tool executions and logs.

   - Query Params: `tool` (string), `limit` (number, default 50), `offset` (number, default 0).

7. GET /api/health

   - Summary: Health check status.

8. GET /api/stats

   - Summary: Agent performance and system statistics.

---

## 3. UI Views & Layout Structure

### Top Navigation Header

- Displays live system status via `GET /api/health`.

- Displays real-time metrics via `GET /api/stats`.

- Navigation tabs for switching views.

### View 1: Autonomous Agent Chat Studio (`POST /api/chat`)

- Interactive stream panel for real-time AI assistant responses.

- Render role badges: `user`, `assistant`, `system`, and `tool`.

- Tool executions must render inside custom hand-sketched collapsible accordions showing inputs/outputs.

- Inputs for selecting active `thread_id` or `user_id` context.

### View 2: Threads & Sessions Management (`/api/threads`)

- Left Panel: List threads fetched via `GET /api/threads`.

- Right Panel: View loaded thread details (`GET /api/threads/{thread_id}`).

- Action Button: Delete thread button (`DELETE /api/threads/{thread_id}`) with confirmation modal.

### View 3: User Directory & Access Control (`GET /api/users`)

- Dynamic search/filter toolbar (Department dropdown, Role input, Active toggle, Search input).

- Interactive user cards formatted in hand-sketched grid cards with role tags and active state indicators.

### View 4: Action Execution & Tool Call Logs (`GET /api/actions`)

- Search bar for specific tool names, offset pagination controls, and limit selection.

- Detailed visual log timeline showing inputs, execution parameters, and status payloads.

---

## 4. UI Components & Sketch Design Tokens

- Component Borders: Hand-sketched irregular stroke styling (`border: 2px solid #1A1A1A`, custom irregular border-radius like `255px 15px 225px 15px/15px 225px 15px 255px`).

- Icons: Lucide stroke-style line art.

- Error Toasting: Display custom sketch-framed toast notifications for 422 HTTPValidationErrors and general network failures.

- Fallback Mode: Include rich mock responses for all endpoints in `src/lib/api.ts` so the frontend can be tested seamlessly offline or without an active backend connection.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9deac040-fd52-4cbd-b966-741568244f6c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
