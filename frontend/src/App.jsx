import { useState } from 'react'
import Dice from './components/Dice.jsx'
import Weather from './components/Weather.jsx'
import './App.css'

const ROLL_MS = 900

export default function App() {
  const [dice, setDice] = useState([1, 1])
  const [spin, setSpin] = useState(0)
  const [rolling, setRolling] = useState(false)

  const roll = () => {
    if (rolling) return
    setDice([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)])
    setSpin((s) => s + 1) // each throw adds a full forward turn -> the dice "revolve"
    setRolling(true)
    setTimeout(() => setRolling(false), ROLL_MS)
  }

  const [d1, d2] = dice

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎲 Dice &amp; Weather</h1>
        <p>A tiny React + Python demo, deployed every which way.</p>
      </header>

      <section className="card">
        <h2>Throw the dice</h2>
        <div className="dice-tray">
          <Dice value={d1} spin={spin} rolling={rolling} />
          <Dice value={d2} spin={spin} rolling={rolling} />
        </div>

        <div className="dice-results" aria-live="polite">
          {rolling ? (
            <span className="rolling-text">Rolling…</span>
          ) : (
            <>
              <span className="chip">Die 1: <b>{d1}</b></span>
              <span className="chip">Die 2: <b>{d2}</b></span>
              <span className="chip sum">Sum: <b>{d1 + d2}</b></span>
            </>
          )}
        </div>

        <button className="btn" onClick={roll} disabled={rolling}>
          {spin === 0 ? 'Throw dice' : 'Throw again'}
        </button>
      </section>

      <section className="card">
        <h2>Current temperature</h2>
        <Weather />
      </section>

      <footer className="app-footer">
        React frontend · Python backend · MADA 2026 / Task 3
      </footer>
    </div>
  )
}
