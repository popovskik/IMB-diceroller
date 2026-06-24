import { useState, useRef } from 'react'
import Dice from './components/Dice.jsx'
import Lasso from './components/Lasso.jsx'
import Bull from './components/Bull.jsx'
import Weather from './components/Weather.jsx'
import './App.css'

const randDie = () => 1 + Math.floor(Math.random() * 6)

// Timing (ms)
const WINDING_MS   = 320
const THROW_MS     = 380
// Bull starts running when the lasso visually reaches it (~60% through throw)
const BULL_START   = WINDING_MS + Math.round(THROW_MS * 0.58)  // ~540 ms
// Bull reaches the dice area ~420 ms after it starts charging
const DICE_HIT_MS  = BULL_START + 420                           // ~960 ms
const ROLL_MS      = 950
const SETTLE_MS    = 180

export default function App() {
  // phase: idle | winding | throwing | bull_running | rolling | landed
  const [phase, setPhase] = useState('idle')
  const [dice, setDice]   = useState([1, 1])
  const [impact, setImpact] = useState(false)
  const timers = useRef([])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }

  const handleThrow = () => {
    if (['winding', 'throwing', 'bull_running', 'rolling'].includes(phase)) return
    clearTimers()
    setPhase('winding')
    setImpact(false)

    later(() => setPhase('throwing'),    WINDING_MS)
    later(() => setPhase('bull_running'), BULL_START)

    later(() => {
      setDice([randDie(), randDie()])
      setPhase('rolling')
      setImpact(true)
      later(() => setImpact(false), 250)
    }, DICE_HIT_MS)

    later(() => setPhase('landed'), DICE_HIT_MS + ROLL_MS + SETTLE_MS)
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

        {/* Horizontal stage: lasso — bull runs through — dice */}
        <div className="stage">
          <div className="stage-lasso">
            <Lasso phase={phase} onClick={handleThrow} />
          </div>

          {/* Bull is absolutely positioned inside the stage */}
          <Bull phase={phase} />

          <div className="stage-dice">
            <Dice value={d1} rolling={phase === 'rolling'} impact={impact} />
            <Dice value={d2} rolling={phase === 'rolling'} impact={impact} />
          </div>
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
