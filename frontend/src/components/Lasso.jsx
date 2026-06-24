import './Lasso.css'

export default function Lasso({ phase, onClick }) {
  const clickable = phase === 'idle' || phase === 'landed'
  const label = phase === 'idle' ? 'Throw dice' : phase === 'landed' ? 'Throw again' : null

  return (
    <div
      className={`lasso-wrapper phase-${phase}`}
      onClick={clickable ? onClick : undefined}
      role="button"
      aria-label={label || undefined}
      tabIndex={clickable ? 0 : -1}
      onKeyDown={(e) => e.key === 'Enter' && clickable && onClick()}
    >
      <svg
        className="lasso-svg"
        viewBox="0 0 160 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="knot-g" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#f0c870" />
            <stop offset="100%" stopColor="#7a5010" />
          </radialGradient>
        </defs>

        {/* === Coiled handle — 3 stacked rings === */}
        <ellipse cx="80" cy="186" rx="20"  ry="6.5" stroke="#5a3a08" strokeWidth="4"   fill="none" />
        <ellipse cx="80" cy="178" rx="24"  ry="7.5" stroke="#88501a" strokeWidth="4.5" fill="none" />
        <ellipse cx="80" cy="169" rx="27"  ry="8.5" stroke="#a87028" strokeWidth="5"   fill="none" />

        {/* === Rope from coil up to honda === */}
        <path
          className="rope-tail"
          d="M 80 162 C 75 147 86 132 80 118"
          stroke="#c8924a"
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* === Honda knot === */}
        <circle cx="80" cy="111" r="7.5" fill="url(#knot-g)" />
        <circle cx="80" cy="111" r="7.5" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" />

        {/* === Spinning loop === */}
        <g className="loop-group">
          {/* Far (top) arc — darker, drawn first so near arc sits on top */}
          <path
            d="M 30,65 A 50,22 0 0,0 130,65"
            stroke="#7a5010"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Near (bottom) arc — bright gold */}
          <path
            d="M 30,65 A 50,22 0 0,1 130,65"
            stroke="#d4a040"
            strokeWidth="6.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Spoke: rope from loop base to honda */}
          <line
            x1="80" y1="87"
            x2="80" y2="111"
            stroke="#b07830"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </svg>

      <span className="lasso-label">{label ?? ' '}</span>
    </div>
  )
}
