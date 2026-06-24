"""Vercel Python serverless function: GET /api/weather?city=<name>

Vercel auto-detects this file (because there is a root requirements.txt) and
exposes it at /api/weather. It must define a class named `handler` that
subclasses BaseHTTPRequestHandler.

The OpenWeatherMap API key is read from the OPENWEATHER_API_KEY environment
variable (set it in Vercel: Project -> Settings -> Environment Variables).
"""

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import os

import requests

OWM_URL = "https://api.openweathermap.org/data/2.5/weather"


def fetch_weather(city: str, api_key: str):
    """Return (payload_dict, None) on success or (None, (status, message))."""
    resp = requests.get(
        OWM_URL,
        params={"q": city, "appid": api_key, "units": "metric"},
        timeout=10,
    )
    if resp.status_code == 404:
        return None, (404, "City not found")
    if resp.status_code == 401:
        return None, (500, "Invalid or missing OpenWeatherMap API key")
    resp.raise_for_status()
    d = resp.json()
    payload = {
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
    return payload, None


class handler(BaseHTTPRequestHandler):
    def _send(self, status: int, body: dict):
        data = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):  # CORS preflight
        self._send(204, {})

    def do_GET(self):
        params = parse_qs(urlparse(self.path).query)
        city = (params.get("city", [""])[0] or "").strip()
        if not city:
            return self._send(400, {"error": "Missing 'city' query parameter"})

        api_key = os.environ.get("OPENWEATHER_API_KEY")
        if not api_key:
            return self._send(500, {"error": "Server is missing OPENWEATHER_API_KEY"})

        try:
            payload, err = fetch_weather(city, api_key)
        except requests.RequestException as exc:
            return self._send(502, {"error": f"Weather service error: {exc}"})

        if err:
            status, message = err
            return self._send(status, {"error": message})
        return self._send(200, payload)
