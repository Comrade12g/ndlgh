/** Animated SVG glyphs for the services grid. Pure SVG + CSS keyframes. */

export function ShipGlyph() {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-full">
      <defs>
        <linearGradient id="sg-sea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2E86DE" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0F2A52" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <rect x="0" y="50" width="120" height="30" fill="url(#sg-sea)" rx="4" />
      <path d="M0,58 Q30,52 60,58 T120,58 V80 H0 Z" fill="#2E86DE" opacity="0.45">
        <animate attributeName="d" dur="4s" repeatCount="indefinite"
          values="M0,58 Q30,52 60,58 T120,58 V80 H0 Z;M0,58 Q30,64 60,58 T120,58 V80 H0 Z;M0,58 Q30,52 60,58 T120,58 V80 H0 Z" />
      </path>
      <g className="animate-bob">
        <rect x="30" y="34" width="52" height="18" fill="#0F2A52" rx="2" />
        <rect x="42" y="22" width="28" height="12" fill="#F7941D" rx="1" />
        <rect x="46" y="26" width="4" height="4" fill="#fff" />
        <rect x="54" y="26" width="4" height="4" fill="#fff" />
        <rect x="62" y="26" width="4" height="4" fill="#fff" />
        <polygon points="30,52 82,52 76,58 36,58" fill="#0A2E5C" />
      </g>
    </svg>
  );
}

export function PlaneGlyph() {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-full">
      <g style={{ animation: "planeGlide 3.4s ease-in-out infinite" }}>
        <path d="M20,50 L80,42 L92,38 L94,44 L82,48 L74,58 L66,60 L70,50 L46,54 L40,60 L34,58 L38,52 Z"
          fill="#F7941D" stroke="#0F2A52" strokeWidth="1" />
      </g>
      <path d="M10,66 Q60,60 110,66" stroke="#2E86DE" strokeWidth="1.5" strokeDasharray="3 4" fill="none" opacity="0.5" />
      <style>{`@keyframes planeGlide {
        0%,100% { transform: translate(0,0) }
        50% { transform: translate(0,-6px) }
      }`}</style>
    </svg>
  );
}

export function TruckGlyph() {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-full">
      <line x1="0" y1="66" x2="120" y2="66" stroke="#0F2A52" strokeWidth="1" strokeDasharray="4 6" opacity="0.35" />
      <g style={{ animation: "truckRoll 3s ease-in-out infinite" }}>
        <rect x="30" y="34" width="42" height="24" fill="#0F2A52" rx="2" />
        <rect x="70" y="40" width="20" height="18" fill="#F7941D" rx="2" />
        <rect x="74" y="44" width="12" height="8" fill="#7ec7ff" />
        <circle cx="42" cy="62" r="6" fill="#111" />
        <circle cx="42" cy="62" r="2" fill="#F7941D">
          <animateTransform attributeName="transform" type="rotate" from="0 42 62" to="360 42 62" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="78" cy="62" r="6" fill="#111" />
        <circle cx="78" cy="62" r="2" fill="#F7941D">
          <animateTransform attributeName="transform" type="rotate" from="0 78 62" to="360 78 62" dur="1s" repeatCount="indefinite" />
        </circle>
      </g>
      <style>{`@keyframes truckRoll { 0%,100% { transform: translateX(0) } 50% { transform: translateX(3px) } }`}</style>
    </svg>
  );
}

export function WarehouseGlyph() {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-full">
      <polygon points="10,32 60,10 110,32 110,36 60,14 10,36" fill="#F7941D" />
      <rect x="14" y="34" width="92" height="34" fill="#0F2A52" />
      <rect x="24" y="42" width="18" height="26" fill="#fff" opacity="0.9">
        <animate attributeName="height" values="26;4;26" dur="4s" repeatCount="indefinite" />
        <animate attributeName="y" values="42;64;42" dur="4s" repeatCount="indefinite" />
      </rect>
      <rect x="50" y="42" width="18" height="26" fill="#2E86DE" opacity="0.8" />
      <rect x="76" y="42" width="18" height="26" fill="#fff" opacity="0.9">
        <animate attributeName="height" values="26;10;26" dur="4s" begin="1s" repeatCount="indefinite" />
        <animate attributeName="y" values="42;58;42" dur="4s" begin="1s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

export function CustomsGlyph() {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-full">
      <rect x="30" y="14" width="60" height="52" rx="4" fill="#fff" stroke="#0F2A52" strokeWidth="1.5" />
      <line x1="36" y1="26" x2="84" y2="26" stroke="#0F2A52" strokeWidth="1.2" />
      <line x1="36" y1="34" x2="72" y2="34" stroke="#0F2A52" strokeWidth="1.2" />
      <line x1="36" y1="42" x2="80" y2="42" stroke="#0F2A52" strokeWidth="1.2" />
      <line x1="36" y1="50" x2="68" y2="50" stroke="#0F2A52" strokeWidth="1.2" />
      <g style={{ animation: "stamp 2.2s ease-in-out infinite" }}>
        <circle cx="76" cy="54" r="10" fill="none" stroke="#F7941D" strokeWidth="2" />
        <text x="76" y="57" textAnchor="middle" fontSize="7" fill="#F7941D" fontWeight="700">OK</text>
      </g>
      <style>{`@keyframes stamp {
        0%,60%,100% { transform: translateY(0) scale(1); opacity: 1 }
        70% { transform: translateY(-10px) scale(0.9); opacity: .4 }
        80% { transform: translateY(0) scale(1.15); opacity: 1 }
      }`}</style>
    </svg>
  );
}
