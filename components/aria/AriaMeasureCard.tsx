export default function AriaMeasureCard() {
  return (
    <svg viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="measureBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1B4958" />
          <stop offset="100%" stopColor="#0F2B35" />
        </linearGradient>
        <linearGradient id="measureTapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2C99D" />
          <stop offset="50%" stopColor="#C5A670" />
          <stop offset="100%" stopColor="#8F713F" />
        </linearGradient>
        <linearGradient id="measureMannequinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#467383" />
          <stop offset="50%" stopColor="#2D5564" />
          <stop offset="100%" stopColor="#183642" />
        </linearGradient>
      </defs>

      <rect width="220" height="240" rx="28" fill="url(#measureBlueGrad)" />

      <path d="M102, 50 q8,-8 16,0 v8 h-16 z" fill="#183642" stroke="#0B1A20" strokeWidth="1.5" />
      <ellipse cx="110" cy="46" rx="5" ry="3" fill="#C5A670" />
      <ellipse cx="110" cy="58" rx="14" ry="5" fill="url(#measureMannequinGrad)" stroke="#11252E" strokeWidth="1.5" />

      <path
        d="M82, 78 c-6,22 -4,42 -4,64 c0,16 8,24 32,24 s32,-8 32,-24 c0,-22 2,-42 -4,-64 c-2,-8 -6,-14 -12,-16 l-6,-4 h-16 l-6,4 c-6,2 -10,8 -12,16 z"
        fill="url(#measureMannequinGrad)"
        stroke="#11252E"
        strokeWidth="1.5"
      />

      <path d="M110, 58 v108" stroke="#11252E" strokeWidth="1.5" opacity="0.6" strokeDasharray="3,3" />
      <path d="M80, 100 q30,12 60,0" fill="none" stroke="#11252E" strokeWidth="1.5" opacity="0.4" />
      <path d="M78, 126 q32,15 64,0" fill="none" stroke="#11252E" strokeWidth="1.5" opacity="0.4" />

      <path
        d="M76, 85 c-15,-15 -5,-30 15,-20 c15,8 25,25 35,30"
        fill="none"
        stroke="url(#measureTapeGrad)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M136, 74 c15,5 30,30 5,55 c-20,20 -60,25 -65,55 c-3,18 15,28 35,22 c25,-8 35,-30 25,-45"
        fill="none"
        stroke="url(#measureTapeGrad)"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="M136, 74 c15,5 30,30 5,55 c-20,20 -60,25 -65,55 c-3,18 15,28 35,22 c25,-8 35,-30 25,-45"
        fill="none"
        stroke="#4A3B20"
        strokeWidth="15"
        strokeLinecap="round"
        strokeDasharray="1,11"
        strokeDashoffset="3"
        opacity="0.7"
      />

      <text x="110" y="200" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="15" letterSpacing="1.2">
        MEASURE
      </text>
      <text x="110" y="222" textAnchor="middle" fill="#A9C6D0" fontWeight="500" fontSize="12">
        Instant Measure
      </text>
    </svg>
  );
}
