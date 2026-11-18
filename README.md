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

`PORT` is set to `3000` to match the Vite development proxy. The backend loads this file from the `backend` directory.

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
