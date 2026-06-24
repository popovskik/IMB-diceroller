import './Bull.css'

export default function Bull({ phase }) {
  return (
    <div className={`bull-track phase-${phase}`} aria-hidden="true">
      <div className="bull-figure">
        <svg className="bull-svg" viewBox="0 0 150 90" xmlns="http://www.w3.org/2000/svg">

          {/* Tail — curves up on the left */}
          <path
            d="M 20 44 Q 8 28 13 36 Q 6 18 16 28"
            stroke="#2d1500" strokeWidth="5" fill="none" strokeLinecap="round"
          />

          {/* Main body */}
          <ellipse cx="65" cy="54" rx="47" ry="25" fill="#1a0a00" />

          {/* Shoulder hump */}
          <ellipse cx="84" cy="38" rx="30" ry="19" fill="#1a0a00" />

          {/* Neck */}
          <ellipse cx="107" cy="42" rx="21" ry="17" fill="#1a0a00" />

          {/* Head — lowered for charging */}
          <ellipse cx="125" cy="31" rx="19" ry="13" fill="#1a0a00" />

          {/* Muzzle */}
          <ellipse cx="141" cy="37" rx="10" ry="8" fill="#3d2000" />
          <circle cx="138" cy="34" r="2.5" fill="#1a0800" />
          <circle cx="144" cy="34" r="2.5" fill="#1a0800" />

          {/* Horns */}
          <path
            d="M 122 19 Q 131 4 139 11"
            stroke="#c8a040" strokeWidth="4.5" fill="none" strokeLinecap="round"
          />
          <path
            d="M 128 18 Q 136 5 139 13"
            stroke="#c8a040" strokeWidth="3" fill="none" strokeLinecap="round"
          />

          {/* Eye */}
          <circle cx="130" cy="25" r="3.5" fill="#fff" />
          <circle cx="131" cy="25" r="2" fill="#0a0000" />

          {/* Ear */}
          <ellipse
            cx="118" cy="18" rx="6" ry="4"
            fill="#2d1500" transform="rotate(-25, 118, 18)"
          />

          {/* Front legs — extended forward */}
          <path
            d="M 104 68 Q 112 78 108 89"
            stroke="#1a0a00" strokeWidth="9" fill="none" strokeLinecap="round"
          />
          <path
            d="M 118 66 Q 127 76 131 88"
            stroke="#1a0a00" strokeWidth="9" fill="none" strokeLinecap="round"
          />

          {/* Back legs — extended backward */}
          <path
            d="M 33 68 Q 23 78 19 89"
            stroke="#1a0a00" strokeWidth="9" fill="none" strokeLinecap="round"
          />
          <path
            d="M 49 70 Q 47 80 44 89"
            stroke="#1a0a00" strokeWidth="9" fill="none" strokeLinecap="round"
          />

          {/* Dust cloud */}
          <ellipse cx="22" cy="86" rx="14" ry="5"  fill="rgba(210,165,80,0.45)" />
          <ellipse cx="47" cy="88" rx="9"  ry="4"  fill="rgba(210,165,80,0.3)"  />
          <ellipse cx="98" cy="87" rx="11" ry="4"  fill="rgba(210,165,80,0.35)" />
        </svg>
      </div>
    </div>
  )
}
