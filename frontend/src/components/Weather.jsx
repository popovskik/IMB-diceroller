import { useState } from 'react'
import './Weather.css'

// Empty by default -> same-origin /api (works on Vercel, on the VPS via nginx,
// and in dev via the Vite proxy). Override with VITE_API_BASE if needed.
const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function Weather() {
  const [city, setCity] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchWeather = async () => {
    const q = city.trim()
    if (!q || loading) return
    setLoading(true)
    setError('')
    setData(null)
    try {
      let res
      try {
        res = await fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(q)}`)
      } catch {
        throw new Error('Could not reach the server. Is the backend running?')
      }
      let json
      try {
        json = await res.json()
      } catch {
        throw new Error(`Server returned an unexpected response (${res.status})`)
      }
      if (!res.ok) {
        // Vercel function uses {error}, FastAPI uses {detail}.
        throw new Error(json.error || json.detail || `Request failed (${res.status})`)
      }
      setData(json)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') fetchWeather()
  }

  return (
    <div className="weather">
      <div className="weather-input-row">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Enter a city, e.g. London"
          aria-label="City name"
        />
        <button className="btn weather-btn" onClick={fetchWeather} disabled={loading}>
          {loading ? '…' : 'Get temperature'}
        </button>
      </div>

      {error && <p className="weather-error">⚠️ {error}</p>}

      {data && (
        <div className="weather-result">
          <div className="weather-main">
            <img
              alt={data.description}
              src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
              width="64"
              height="64"
            />
            <div>
              <div className="weather-temp">{data.temperature}{data.unit}</div>
              <div className="weather-place">
                {data.city}{data.country ? `, ${data.country}` : ''}
              </div>
            </div>
          </div>
          <p className="weather-desc">{data.description}</p>
          <div className="weather-meta">
            <span>Feels like {data.feels_like}{data.unit}</span>
            <span>Humidity {data.humidity}%</span>
            <span>Wind {data.wind_speed} m/s</span>
          </div>
        </div>
      )}
    </div>
  )
}
