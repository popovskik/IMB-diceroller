"""Streamlit version of the MADA demo (dice + weather), pure Python.

Run locally:
    cd streamlit_app
    pip install -r requirements.txt
    # put your key in .streamlit/secrets.toml  (see secrets.toml.example)
    streamlit run streamlit_app.py

Deploy: Streamlit Community Cloud, entrypoint = streamlit_app/streamlit_app.py.
Add OPENWEATHER_API_KEY in the app's Advanced settings -> Secrets.
"""

import random

import requests
import streamlit as st

OWM_URL = "https://api.openweathermap.org/data/2.5/weather"
DICE_UNICODE = {1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅"}

st.set_page_config(page_title="MADA Demo — Dice & Weather", page_icon="🎲", layout="centered")


def get_api_key():
    # st.secrets behaves like a dict; guard so a missing key gives a friendly message.
    try:
        return st.secrets["OPENWEATHER_API_KEY"]
    except (KeyError, FileNotFoundError):
        return None


def fetch_weather(city: str):
    api_key = get_api_key()
    if not api_key:
        return None, "No OPENWEATHER_API_KEY configured (set it in Secrets)."
    try:
        resp = requests.get(
            OWM_URL,
            params={"q": city, "appid": api_key, "units": "metric"},
            timeout=10,
        )
    except requests.RequestException as exc:
        return None, f"Weather service error: {exc}"
    if resp.status_code == 404:
        return None, "City not found."
    if resp.status_code == 401:
        return None, "Invalid OpenWeatherMap API key."
    if not resp.ok:
        return None, f"Weather service returned HTTP {resp.status_code}."
    d = resp.json()
    return {
        "city": d.get("name", city),
        "country": d.get("sys", {}).get("country", ""),
        "temperature": round(d["main"]["temp"], 1),
        "feels_like": round(d["main"]["feels_like"], 1),
        "description": d["weather"][0]["description"].title(),
        "humidity": d["main"]["humidity"],
        "wind_speed": d["wind"].get("speed", 0),
    }, None


st.title("🎲 + 🌤️ MADA Demo")
st.caption("Same app, deployed on Streamlit Community Cloud.")

# ----------------------------- Dice -----------------------------
st.header("Throw the dice")

if "dice" not in st.session_state:
    st.session_state.dice = (1, 1)
if "thrown" not in st.session_state:
    st.session_state.thrown = False

label = "🎲 Throw again" if st.session_state.thrown else "🎲 Throw dice"
if st.button(label, use_container_width=True):
    st.session_state.dice = (random.randint(1, 6), random.randint(1, 6))
    st.session_state.thrown = True

d1, d2 = st.session_state.dice

# A small CSS spin animation that re-triggers on each rerun (i.e. each throw).
st.markdown(
    f"""
    <style>
    @keyframes mada-roll {{
        0%   {{ transform: rotate(0deg)   scale(0.6); opacity: 0.3; }}
        60%  {{ transform: rotate(540deg) scale(1.15); opacity: 1; }}
        100% {{ transform: rotate(720deg) scale(1); }}
    }}
    .mada-dice {{
        display: flex; gap: 28px; justify-content: center; margin: 12px 0 4px;
    }}
    .mada-die {{
        font-size: 96px; line-height: 1;
        animation: mada-roll 0.8s ease-out;
    }}
    </style>
    <div class="mada-dice">
        <span class="mada-die">{DICE_UNICODE[d1]}</span>
        <span class="mada-die">{DICE_UNICODE[d2]}</span>
    </div>
    """,
    unsafe_allow_html=True,
)

c1, c2, c3 = st.columns(3)
c1.metric("Die 1", d1)
c2.metric("Die 2", d2)
c3.metric("Sum", d1 + d2)

st.divider()

# ----------------------------- Weather -----------------------------
st.header("Current temperature")

with st.form("weather_form"):
    city = st.text_input("City", placeholder="e.g. London", label_visibility="collapsed")
    submitted = st.form_submit_button("Get temperature", use_container_width=True)

# st.form submits on Enter inside the text box OR on the button click.
if submitted and city.strip():
    with st.spinner(f"Fetching weather for {city.strip()}…"):
        data, error = fetch_weather(city.strip())
    if error:
        st.error(error)
    else:
        st.subheader(f"{data['city']}, {data['country']}")
        wc1, wc2 = st.columns(2)
        wc1.metric("Temperature", f"{data['temperature']} °C")
        wc2.metric("Feels like", f"{data['feels_like']} °C")
        st.write(
            f"**{data['description']}** · Humidity {data['humidity']}% · "
            f"Wind {data['wind_speed']} m/s"
        )
elif submitted:
    st.warning("Please enter a city name.")
