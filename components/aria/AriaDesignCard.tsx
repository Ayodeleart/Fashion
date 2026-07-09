export default function AriaDesignCard() {
  return (
    <svg viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="designGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A38450" />
          <stop offset="100%" stopColor="#604A26" />
        </linearGradient>
        <linearGradient id="designPadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D7BE95" />
          <stop offset="100%" stopColor="#A78D61" />
        </linearGradient>
      </defs>

      <rect width="220" height="240" rx="28" fill="url(#designGoldGrad)" />

      <g transform="translate(106, 110) rotate(-8) translate(-106, -110)">
        <rect x="54" y="54" width="104" height="114" rx="8" fill="#423319" />
        <rect x="50" y="50" width="104" height="114" rx="8" fill="url(#designPadGrad)" stroke="#423319" strokeWidth="1.5" />
        <rect x="62" y="56" width="86" height="102" rx="4" fill="#EFEADB" />

        <line x1="68" y1="74" x2="142" y2="74" stroke="#C4BBA4" strokeWidth="1" />
        <line x1="68" y1="90" x2="142" y2="90" stroke="#C4BBA4" strokeWidth="1" />
        <line x1="68" y1="106" x2="142" y2="106" stroke="#C4BBA4" strokeWidth="1" />
        <line x1="68" y1="122" x2="142" y2="122" stroke="#C4BBA4" strokeWidth="1" />
        <line x1="68" y1="138" x2="142" y2="138" stroke="#C4BBA4" strokeWidth="1" />

        <path
          d="M92,80 q13,-5 26,0 l-4,22 q8,18 -4,34 h-14 q-12,-16 -4,-34 z"
          fill="none"
          stroke="#665233"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        <path d="M96,102 h18 M100,114 h10" stroke="#665233" strokeWidth="1" opacity="0.5" />

        <path d="M46, 64 c0,-5 12,-5 12,0 v6 c0,5 -12,5 -12,0 z" fill="#D1C7B7" stroke="#312512" strokeWidth="1" />
        <circle cx="58" cy="67" r="2" fill="#312512" />
        <path d="M46, 84 c0,-5 12,-5 12,0 v6 c0,5 -12,5 -12,0 z" fill="#D1C7B7" stroke="#312512" strokeWidth="1" />
        <circle cx="58" cy="87" r="2" fill="#312512" />
        <path d="M46, 104 c0,-5 12,-5 12,0 v6 c0,5 -12,5 -12,0 z" fill="#D1C7B7" stroke="#312512" strokeWidth="1" />
        <circle cx="58" cy="107" r="2" fill="#312512" />
        <path d="M46, 124 c0,-5 12,-5 12,0 v6 c0,5 -12,5 -12,0 z" fill="#D1C7B7" stroke="#312512" strokeWidth="1" />
        <circle cx="58" cy="127" r="2" fill="#312512" />
        <path d="M46, 144 c0,-5 12,-5 12,0 v6 c0,5 -12,5 -12,0 z" fill="#D1C7B7" stroke="#312512" strokeWidth="1" />
        <circle cx="58" cy="147" r="2" fill="#312512" />

        <g transform="translate(115, 65) rotate(25)">
          <rect x="0" y="0" width="12" height="75" rx="2" fill="#2C3E50" stroke="#1A252F" strokeWidth="1" />
          <polygon points="0,0 6,-14 12,0" fill="#E5C185" stroke="#1A252F" strokeWidth="1" />
          <polygon points="4,-9 6,-14 8,-9" fill="#1A252F" />
          <rect x="0" y="70" width="12" height="5" fill="#E2C99D" />
          <path d="M0,75 c0,3 3,5 6,5 s6,-2 6,-5 z" fill="#E74C3C" />
        </g>
      </g>

      <text x="110" y="200" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="15" letterSpacing="1.2">
        DESIGN
      </text>
      <text x="110" y="222" textAnchor="middle" fill="#E6D3B3" fontWeight="500" fontSize="12">
        Style Ideas
      </text>
    </svg>
  );
}
