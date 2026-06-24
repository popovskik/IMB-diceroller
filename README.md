# MADA 2026 — Task 3: Dice & Weather Demo 🎲🌤️

One small app — **React** frontend, **Python** backend — built to be deployed
**three different ways** so you can compare providers and modes:

| # | Target | What runs | Difficulty |
|---|--------|-----------|------------|
| 1 | **Streamlit Community Cloud** | Pure-Python rewrite (`streamlit_app/`) | ⭐ easiest |
| 2 | **Vercel** | React (`frontend/`) + Python serverless (`api/`) | ⭐⭐ |
| 3 | **VPS + nginx** | React static build + FastAPI (`backend/`) | ⭐⭐⭐ |

### Features
- **Dice:** click *Throw dice* → two 3D dice revolve and land showing each value (1–6) and the sum. *Throw again* re-rolls.
- **Weather:** type a city, press **Enter** or **Get temperature** → shows the current temperature (plus feels-like, humidity, wind).

---

## 0. Get a free weather API key (do this first)

We use **OpenWeatherMap**'s free "Current Weather Data" API.

1. Go to <https://openweathermap.org/> and click **Sign in → Create an Account**.
2. Confirm your email.
3. Open **My API keys** (menu under your username, or <https://home.openweathermap.org/api_keys>).
   A "Default" key is created automatically — copy it.
4. ⏳ **Wait ~10 minutes to 2 hours** — brand-new keys take a little while to activate.
   Until then you'll get `401 Invalid API key`. This is normal.
5. Free tier limits: 60 calls/minute, 1,000,000/month — far more than this demo needs.

> Keep this key **secret**. It only ever goes into a backend env var / secret —
> never into the React code.

Quick test once active (replace `YOUR_KEY`):
```
https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY&units=metric
```

---

## 1. Run it locally first (recommended)

You need **Node 18+** and **Python 3.9+**.

**Terminal A — backend (FastAPI):**
```bash
cd backend
python -m venv .venv
# Windows PowerShell:  .venv\Scripts\Activate.ps1
# macOS/Linux:         source .venv/bin/activate
pip install -r requirements.txt

# set your key (PowerShell):
$env:OPENWEATHER_API_KEY="your_key_here"
# (cmd:  set OPENWEATHER_API_KEY=your_key_here)
# (bash: export OPENWEATHER_API_KEY=your_key_here)

uvicorn main:app --reload --port 8000
```

**Terminal B — frontend (React/Vite):**
```bash
cd frontend
npm install
npm run dev
```
Open <http://localhost:5173>. The Vite dev server proxies `/api` → `localhost:8000`,
so the city search talks to your FastAPI backend automatically.

**Or run the Streamlit version locally:**
```bash
cd streamlit_app
pip install -r requirements.txt
cp .streamlit/secrets.toml.example .streamlit/secrets.toml   # then edit in your key
streamlit run streamlit_app.py
```

---

## 2. Publish to GitHub (needed for Streamlit & easiest for Vercel)

Git is already initialized in this folder. Create the remote and push:

**Option A — GitHub CLI (`gh`):**
```bash
gh auth login            # one-time, if not already authenticated
gh repo create mada-task3-demo --public --source=. --remote=origin --push
```

**Option B — Web UI:**
1. Go to <https://github.com/new>, name it e.g. `mada-task3-demo`, **Public**,
   do **not** add a README/.gitignore (we already have them), click *Create*.
2. Then run (replace `YOUR_USERNAME`):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mada-task3-demo.git
   git branch -M main
   git push -u origin main
   ```

> The repo can be **public**. Your API key is **not** in it (it's gitignored and only
> lives in each platform's secret store).

---

## 3. Deploy to Streamlit Community Cloud  ⭐

1. Go to <https://share.streamlit.io> and sign in **with GitHub**; authorize it.
2. **Create app → Deploy a public app from GitHub.**
3. Fill in:
   - **Repository:** `YOUR_USERNAME/mada-task3-demo`
   - **Branch:** `main`
   - **Main file path:** `streamlit_app/streamlit_app.py`
4. Click **Advanced settings → Secrets** and paste:
   ```toml
   OPENWEATHER_API_KEY = "your_key_here"
   ```
5. **Deploy.** You get a public `*.streamlit.app` URL. Dependencies install from
   `streamlit_app/requirements.txt` automatically.

---

## 4. Deploy to Vercel  ⭐⭐

The repo root has `vercel.json` (builds the React app) and `api/weather.py`
(Python serverless function). Vercel auto-detects the Python function because of the
root `requirements.txt`.

1. Go to <https://vercel.com> and sign in **with GitHub**.
2. **Add New → Project →** import `mada-task3-demo`.
3. Vercel reads `vercel.json`, so leave the build settings as detected
   (build = `cd frontend && npm install && npm run build`, output = `frontend/dist`).
4. **Environment Variables →** add `OPENWEATHER_API_KEY = your_key_here`.
5. **Deploy.** The frontend is served from `/`, and the browser calls `/api/weather`,
   which runs `api/weather.py`.

> CLI alternative: `npm i -g vercel`, then `vercel` in this folder, and add the env var
> with `vercel env add OPENWEATHER_API_KEY`.

---

## 5. Deploy to a VPS with nginx  ⭐⭐⭐

On an Ubuntu-style VPS (`ssh` in first). This serves the built React app as static
files and reverse-proxies `/api` to FastAPI.

**a) Get the code and build the frontend:**
```bash
git clone https://github.com/YOUR_USERNAME/mada-task3-demo.git
cd mada-task3-demo/frontend
npm install && npm run build      # outputs frontend/dist
```

**b) Run the backend as a service.** Install deps:
```bash
cd ../backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt gunicorn
```
Create `/etc/systemd/system/mada.service`:
```ini
[Unit]
Description=MADA FastAPI backend
After=network.target

[Service]
WorkingDirectory=/home/youruser/mada-task3-demo/backend
Environment=OPENWEATHER_API_KEY=your_key_here
ExecStart=/home/youruser/mada-task3-demo/backend/.venv/bin/gunicorn \
  -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000 main:app
Restart=always

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mada
```

**c) nginx site** at `/etc/nginx/sites-available/mada` (symlink into `sites-enabled`):
```nginx
server {
    listen 80;
    server_name your-domain-or-ip;

    # Serve the built React app
    root /home/youruser/mada-task3-demo/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;     # SPA fallback
    }

    # Proxy API calls to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/mada /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
Visit `http://your-domain-or-ip`. For HTTPS, add a free cert:
`sudo certbot --nginx -d your-domain`.

---

## Project layout

```
business_requirements.md   my build/deploy playbook (read for the "why")
README.md                  this file
vercel.json                Vercel build config
requirements.txt           Vercel Python deps (requests)
api/weather.py             Vercel serverless function
frontend/                  React + Vite app
backend/                   FastAPI app (local dev + VPS)
streamlit_app/             pure-Python Streamlit app
```

All three backends answer the same call:
`GET /api/weather?city=London → { city, country, temperature, unit, description, ... }`.

## Troubleshooting
- **`401 Invalid API key`** → key not active yet (wait) or wrong/missing env var.
- **`City not found`** → check spelling; try `"London,GB"` to disambiguate.
- **Weather works locally but not deployed** → the platform's `OPENWEATHER_API_KEY`
  env var/secret isn't set (or you didn't redeploy after adding it).
- **Dice spin but the page errors** → that's the weather call; the dice are 100% client-side and need no backend.
