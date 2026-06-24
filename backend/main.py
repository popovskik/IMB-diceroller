"""FastAPI backend for local development and VPS deployment.

Run locally:
    cd backend
    python -m venv .venv && source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
    pip install -r requirements.txt
    set OPENWEATHER_API_KEY=...        # Windows (PowerShell: $env:OPENWEATHER_API_KEY="...")
    uvicorn main:app --reload --port 8000

Implements the same contract as the Vercel function:
    GET /api/weather?city=<name>
"""

import os

import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

OWM_URL = "https://api.openweathermap.org/data/2.5/weather"

app = FastAPI(title="MADA Demo API", version="1.0.0")

# Permissive CORS so the Vite dev server (different origin) can call us in dev.
# On the VPS, nginx serves the frontend from the same origin, so this is harmless.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/weather")
def weather(city: str = Query(..., min_length=1)):
    city = city.strip()
    if not city:
        raise HTTPException(status_code=400, detail="Missing 'city' query parameter")

    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Server is missing OPENWEATHER_API_KEY")

    try:
        resp = requests.get(
            OWM_URL,
            params={"q": city, "appid": api_key, "units": "metric"},
            timeout=10,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Weather service error: {exc}")

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="City not found")
    if resp.status_code == 401:
        raise HTTPException(status_code=500, detail="Invalid or missing OpenWeatherMap API key")
    resp.raise_for_status()

    d = resp.json()
    return {
        "city": d.get("name", city),
        "country": d.get("sys", {}).get("country", ""),
        "temperature": round(d["main"]["temp"], 1),
        "feels_like": round(d["main"]["feels_like"], 1),
        "unit": "°C",
        "description": d["weather"][0]["description"],
        "icon": d["weather"][0]["icon"],
        "humidity": d["main"]["humidity"],
        "wind_speed": d["wind"].get("speed", 0),
    }
