import './Dice.css'

// Cube rotation that brings each face value to the front.
// Must match the per-face transforms in Dice.css.
const FACE_ROTATION = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: 180 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  6: { x: 90, y: 0 },
}

// Which of the 9 grid cells hold a pip, per value (3x3 grid, index 0..8).
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

export default function Dice({ value, spin, rolling }) {
  const r = FACE_ROTATION[value] || FACE_ROTATION[1]
  // Adding spin*360 on each throw makes the cube keep rotating forward (revolving),
  // while still landing on the correct face. Extra turns while rolling add flair.
  const extra = rolling ? 360 : 0
  const transform =
    `rotateX(${r.x + spin * 360 + extra}deg) ` +
    `rotateY(${r.y + spin * 360 + extra}deg)`

  return (
    <div className="dice-scene">
      <div className={`dice-cube${rolling ? ' rolling' : ''}`} style={{ transform }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Face key={n} value={n} />
        ))}
      </div>
    </div>
  )
}
