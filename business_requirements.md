# MADA 2026 — Task 3: Multi-Deployment Demo App

> **Purpose of this file:** This is the standing instruction set / playbook for *me*
> (the assistant) when working in this directory. It records what we are building,
> the architecture decisions, and the exact deployment recipes so any future session
> can continue without re-deriving context. The human-facing walkthrough lives in
> `README.md`.

---

## 1. Goal

Build **one small demo application** and deploy it several different ways, as a learning
exercise in shipping a website with different providers and modes:

1. **Streamlit Community Cloud** (pure Python, fastest path).
2. **Vercel** (React frontend + Python serverless functions).
3. **VPS + nginx** (React static build served by nginx, FastAPI backend behind a reverse proxy).

The application itself is intentionally simple so the *deployment* is the interesting part.

## 2. Features (the spec from the user)

1. **Weather**
   - An input field for a city name.
   - Fetch current temperature when the user presses **Enter** OR clicks **"Get temperature"**.
   - Display the temperature (and a bit of extra context: description, feels-like, humidity, wind).
   - Data comes from a **free** weather API.
2. **Dice**
   - A button to throw **two dice**.
   - While thrown, the two dice **animate / revolve**.
   - When they land, show **each individual result (1–6)** and the **sum**.
   - A button to **throw again**.
3. **Stack:** React frontend, Python backend.

## 3. Weather API decision

**Use [OpenWeatherMap](https://openweathermap.org/api) — "Current Weather Data" endpoint.**

- Free tier: 60 calls/min, 1,000,000 calls/month. Plenty for a demo.
- Accepts a **city name directly** (`?q=London`), so no separate geocoding step.
- Requires a free **API key** → this is why the user wants account-creation guidance
  (steps are in `README.md`).
- Endpoint: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={KEY}&units=metric`
- Response fields we use: `name`, `sys.country`, `main.temp`, `main.feels_like`,
  `main.humidity`, `weather[0].description`, `weather[0].icon`, `wind.speed`.

> **Alternative if the user dislikes signing up:** [Open-Meteo](https://open-meteo.com)
> needs **no key**, but requires a geocoding call to turn a city name into lat/lon.
> We chose OpenWeatherMap because the city-name lookup is one call and the API-key
> flow is itself part of the learning goal.

### Key handling rule (important)
The API key is **secret** and must **never** ship to the browser. It lives only on the
backend as an environment variable / secret:
- Vercel: Project → Settings → Environment Variables → `OPENWEATHER_API_KEY`.
- Streamlit: `.streamlit/secrets.toml` → `OPENWEATHER_API_KEY`.
- FastAPI/VPS: process env var `OPENWEATHER_API_KEY` (e.g. systemd `Environment=`).

The frontend only ever calls **our own** `/api/weather?city=...`; our backend adds the key.

## 4. Architecture

A single shared HTTP contract lets the same React frontend work against every backend:

```
GET /api/weather?city=<name>
  200 -> { city, country, temperature, feels_like, unit, description, icon, humidity, wind_speed }
  400 -> { error: "..." }   (missing/blank city)
  404 -> { error: "City not found" }
  500 -> { error: "..." }   (missing key / upstream failure)
```

Three backends implement that one contract:
- `api/weather.py` — Vercel serverless function (stdlib `BaseHTTPRequestHandler` + `requests`).
- `backend/main.py` — FastAPI app for local dev and the VPS.
- `streamlit_app/streamlit_app.py` — calls OpenWeatherMap directly (no separate API; it's one process).

The React frontend resolves its API base from `VITE_API_BASE`:
- Empty string (default) → same-origin `/api/weather` (Vercel, and VPS via nginx proxy).
- Local dev → Vite dev-server proxy forwards `/api` to `http://localhost:8000` (FastAPI).

## 5. Directory map

```
task 3/
├── business_requirements.md     <- this file
├── README.md                    <- human deployment walkthrough (the deliverable to read)
├── .gitignore
├── vercel.json                  <- Vercel: builds frontend, routes /api to Python
├── requirements.txt             <- ROOT: Vercel Python deps (requests). Do NOT put streamlit here.
├── api/
│   └── weather.py               <- Vercel Python serverless function
├── frontend/
│   ├── package.json
│   ├── vite.config.js           <- includes dev proxy /api -> :8000
│   ├── index.html
│   ├── .env.example             <- VITE_API_BASE
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── App.jsx
│       ├── App.css
│       └── components/
│           ├── Dice.jsx         <- 3D CSS cube dice, spins forward each throw
│           ├── Dice.css
│           ├── Weather.jsx
│           └── Weather.css
├── backend/
│   ├── main.py                  <- FastAPI; run with: uvicorn main:app --reload
│   ├── requirements.txt
│   └── .env.example
└── streamlit_app/
    ├── streamlit_app.py
    ├── requirements.txt         <- streamlit + requests (next to entrypoint = takes precedence)
    └── .streamlit/
        └── secrets.toml.example
```

## 6. Deployment recipes (summary — full steps in README.md)

### A. Streamlit Community Cloud
- Needs a **public GitHub repo**.
- App entrypoint: `streamlit_app/streamlit_app.py`.
- Deps auto-installed from `streamlit_app/requirements.txt` (precedence over root).
- Secret: add `OPENWEATHER_API_KEY` in the app's **Advanced settings → Secrets** (TOML).

### B. Vercel
- Connect the GitHub repo (or `vercel` CLI).
- `vercel.json` tells Vercel to build `frontend/` (Vite → `frontend/dist`) and expose `api/*.py`.
- Root `requirements.txt` supplies the Python function's deps.
- Env var: `OPENWEATHER_API_KEY` in Project Settings.

### C. VPS + nginx
- `npm run build` in `frontend/` → serve `frontend/dist` as static files.
- Run FastAPI with gunicorn/uvicorn (systemd unit), bound to `127.0.0.1:8000`.
- nginx serves static and reverse-proxies `/api/` → `127.0.0.1:8000`.
- Export `OPENWEATHER_API_KEY` in the service environment.

## 7. Git / GitHub
- Streamlit Cloud **requires** GitHub. Vercel strongly prefers it (auto-deploy on push).
- This repo is initialized with git; `.gitignore` excludes `node_modules`, build output,
  `.env`, and `secrets.toml`. **Never commit real keys.**
- Publish steps (gh CLI or web UI) are in `README.md`.

## 8. Conventions / gotchas to respect in future edits
- Keep the `/api/weather` response shape identical across all three backends.
- Never add `streamlit` to the **root** `requirements.txt` (it would bloat the Vercel
  function and risk the size limit). Streamlit deps stay in `streamlit_app/requirements.txt`.
- Frontend must call a relative `/api/...` path by default so it works unchanged on
  Vercel and the VPS.
- CORS: FastAPI and the Vercel function send permissive CORS headers so the React dev
  server (different origin) can call them during local development.
- All secrets via env/secrets only; `*.example` files are committed, real ones are gitignored.
