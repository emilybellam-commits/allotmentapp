// The signature of the whole design: SVG turbulence displacement filters
// that make every map feature and pin look hand-inked.
export function WobbleDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="sk" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" />
      </filter>
      <filter id="sk2" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
      </filter>
      <linearGradient id="fbWash" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#be7896" stopOpacity=".32" />
        <stop offset=".5" stopColor="#9678b4" stopOpacity=".32" />
        <stop offset="1" stopColor="#c8a05a" stopOpacity=".32" />
      </linearGradient>
    </svg>
  )
}
