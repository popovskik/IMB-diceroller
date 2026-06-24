import { useState, useRef } from 'react'
import Dice from './components/Dice.jsx'
import Lasso from './components/Lasso.jsx'
import Weather from './components/Weather.jsx'
import './App.css'

const randDie = () => 1 + Math.floor(Math.random() * 6)

// Timing (ms)
const WINDING_MS  = 320   // lasso spins up
const THROW_MS    = 550   // lasso-throw CSS animation duration
const IMPACT_MS   = WINDING_MS + Math.round(THROW_MS * 0.55) // when lasso hits dice
const ROLL_MS     = 950   // dice tumble duration (matches CSS)
const SETTLE_MS   = 180   // dice settle into face

export default function App() {
  const [phase, setPhase] = useState('idle')
  // phase: idle | winding | throwing | rolling | landed

  const [dice, setDice] = useState([1, 1])
  const [impact, setImpact] = useState(false)
  const timers = useRef([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const later = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }

  const handleThrow = () => {
    if (phase === 'winding' || phase === 'throwing' || phase === 'rolling') return
    clearTimers()

    setPhase('winding')
    setImpact(false)

    // Start the throw animation after winding
    later(() => setPhase('throwing'), WINDING_MS)

    // Lasso hits dice → roll
    later(() => {
      setDice([randDie(), randDie()])
      setPhase('rolling')
      setImpact(true)
      later(() => setImpact(false), 250)
    }, IMPACT_MS)

    // Dice settle → landed
    later(() => setPhase('landed'), IMPACT_MS + ROLL_MS + SETTLE_MS)
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
          <Dice value={d1} rolling={phase === 'rolling'} impact={impact} />
          <Dice value={d2} rolling={phase === 'rolling'} impact={impact} />
        </div>

        <div className="dice-results" aria-live="polite">
          {phase === 'rolling' ? (
            <span className="rolling-text">Rolling…</span>
          ) : (
            <>
              <span className="chip">Die 1: <b>{d1}</b></span>
              <span className="chip">Die 2: <b>{d2}</b></span>
              <span className="chip sum">Sum: <b>{d1 + d2}</b></span>
            </>
          )}
        </div>

        <div className="lasso-area">
          <Lasso phase={phase} onClick={handleThrow} />
        </div>
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
