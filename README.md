# Soulace Application

This repository contains two separate apps:

- `soulace-backend-main` (Node.js + Express + MongoDB)
- `soulace-frontend-main` (React + Vite)

## Prerequisites

- Node.js 18+ (recommended)
- npm
- MongoDB connection string (Atlas or local)

## 1) Initialize the Backend

```bash
cd soulace-backend-main
npm install
```

Create a `.env` file in `soulace-backend-main`:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
```

`GROQ_API_KEY` is optional for startup. If it is not set, chatbot responses use a fallback message instead of calling Groq.

Run the backend:

```bash
npm run dev
```

If you do not use `nodemon`, run:

```bash
npm start
```

Backend health check:

- `http://localhost:5001/api/health`

## 2) Initialize the Frontend

Open a new terminal and run:

```bash
cd soulace-frontend-main
npm install
```

Create a `.env` file in `soulace-frontend-main`:

```env
VITE_API_BASE_URL=http://localhost:5001
```

Run the frontend:

```bash
npm run dev
```

Frontend local URL:

- `http://localhost:3000`

## Startup Order

1. Start backend (`soulace-backend-main`)
2. Start frontend (`soulace-frontend-main`)

The frontend is configured to call/proxy API requests to the backend URL above.

## Troubleshooting

- If you see CORS errors on login and `localhost:5000` is used by another app/process, change backend port and frontend API URL:

```env
# soulace-backend-main/.env
PORT=5001
CLIENT_URL=http://localhost:3000
```

```env
# soulace-frontend-main/.env
VITE_API_BASE_URL=http://localhost:5001
```
# soulace
