# AI Chat Assistant

A Bengali-friendly AI chat application with a React frontend and an Express backend. The frontend lets you choose from the models exposed by an OpenAI-compatible API, chat with the selected model, and start a fresh conversation.

## Requirements

- Node.js and npm
- An API key and base URL for an OpenAI-compatible model provider

## Setup

Install dependencies in each app directory:

```powershell
cd backend
npm install
cd ..\web
npm install
```

Create `backend/.env` with your provider configuration:

```dotenv
API_KEY=your_api_key
BASE_URL=https://your-provider.example/v1
MODEL=your-default-model
PORT=3000
```

`PORT` is set to `3000` to match the Vite development proxy. The backend loads this file from the `backend` directory. The frontend and backend Vercel projects use Vercel environment variables instead of this file.

## Run locally

Start the backend in one terminal:

```powershell
cd backend
npm run dev:server
```

Start the frontend in another terminal:

```powershell
cd web
npm run dev
```

Open the local URL printed by Vite. The development server forwards `/api` requests to the backend.

## Available scripts

In `backend`:

- `npm run dev:server` — run the API with automatic restarts
- `npm run typecheck` — type-check the backend

In `web`:

- `npm run dev` — start the Vite development server
- `npm run build` — type-check and build the frontend
- `npm run lint` — lint the frontend
- `npm run preview` — preview a production build

## API

The backend listens on `127.0.0.1` and exposes:

- `GET /api/health` — health check
- `GET /api/models` — available models and the configured default
- `POST /api/chat` — send a chat message history and optional model ID

Chat requests use JSON with a non-empty `messages` array. Each message has a `role` (`user` or `assistant`) and string `content`; an optional `model` must be available from the provider.

## Deploy to Vercel

Deploy the frontend and backend as two Vercel projects from the same Git repository:

1. Import the repository into Vercel and set the project **Root Directory** to `backend`. Vercel detects the Express app. Add these environment variables for Production, Preview, and Development as needed:
   - `API_KEY` — your provider API key
   - `BASE_URL` — the provider's OpenAI-compatible API base URL
   - `MODEL` — the default model ID
   - `FRONTEND_ORIGIN` — the exact deployed frontend origin, such as `https://your-chat.vercel.app` (no trailing slash)
2. Deploy the same repository as a second Vercel project with **Root Directory** set to `web`. Vercel detects Vite; use `npm run build` and `dist` if prompted.
3. Set `VITE_API_BASE_URL` in the frontend project's environment variables to the backend deployment origin, such as `https://your-api.vercel.app` (no trailing slash), then redeploy the frontend.

The frontend sends API requests to that backend origin. During local development, leave `VITE_API_BASE_URL` unset to use the Vite proxy. Keep `API_KEY` only in the backend project's environment variables; never add it to the frontend.
