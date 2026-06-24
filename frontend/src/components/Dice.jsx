import { useState, useEffect } from 'react'
import './Dice.css'

// Cube face rotation to bring each value to the front.
const FACE_ROTATION = {
  1: { x: 0,   y: 0   },
  2: { x: 0,   y: 180 },
  3: { x: 0,   y: -90 },
  4: { x: 0,   y: 90  },
  5: { x: -90, y: 0   },
  6: { x: 90,  y: 0   },
}

const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function Face({ value }) {
  const on = PIPS[value]
  return (
    <div className={`dice-face face-${value}`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className={on.includes(i) ? 'pip on' : 'pip'} />
      ))}
    </div>
  )
}

export default function Dice({ value, rolling, impact }) {
  // landed: false while tumbling, true once settled on the correct face
  const [landed, setLanded] = useState(true)

  useEffect(() => {
    if (rolling) setLanded(false)
  }, [rolling])

  const r = FACE_ROTATION[value] || FACE_ROTATION[1]

  const handleAnimEnd = (e) => {
    // Only react to the tumble animation on the cube itself, not child animations
    if (e.target === e.currentTarget) setLanded(true)
  }

  const cubeClass = [
    'dice-cube',
    rolling && !landed ? 'tumbling' : '',
    landed && !rolling ? 'settled' : '',
    impact ? 'impact' : '',
  ].filter(Boolean).join(' ')

  const cubeStyle = landed
    ? { transform: `rotateX(${r.x}deg) rotateY(${r.y}deg)` }
    : {}

  return (
    <div className="dice-scene">
      <div className={cubeClass} style={cubeStyle} onAnimationEnd={handleAnimEnd}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Face key={n} value={n} />
        ))}
      </div>
    </div>
  )
}
