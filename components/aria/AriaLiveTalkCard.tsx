export default function AriaLiveTalkCard() {
  return (
    <svg viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="talkGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2E6B52" />
          <stop offset="100%" stopColor="#123424" />
        </linearGradient>
      </defs>

      <rect width="220" height="240" rx="28" fill="url(#talkGreenGrad)" />

      <g transform="translate(65, 68) scale(2.5)">
        <path
          d="M23,26a1,1,0,0,1-1,1H8c-.22,0-.43.2-.61.33L4,30V14a1,1,0,0,1,1-1H8.86V11H5a3,3,0,0,0-3,3V32a1,1,0,0,0,.56.89,1,1,0,0,0,1-.1L8.71,29H22.15A2.77,2.77,0,0,0,25,26.13V25H23Z"
          fill="#EFE3D8"
        />
        <path
          d="M32,13.22v9.72L28.5,20.21a1,1,0,0,0-.61-.21H14a1,1,0,0,1-1-1V7a1,1,0,0,1,1-1H22.5a7.49,7.49,0,0,1,.28-2H14a3,3,0,0,0-3,3V19a3,3,0,0,0,3,3H27.55l4.78,3.71a1,1,0,0,0,1,.11,1,1,0,0,0,.57-.9V12.37A7.45,7.45,0,0,1,32,13.22Z"
          fill="#EFE3D8"
        />
        <circle cx="30" cy="6" r="5" fill="#C9A253" />
      </g>

      <text x="110" y="200" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="15" letterSpacing="1.2">
        LIVE TALK
      </text>
      <text x="110" y="222" textAnchor="middle" fill="#B9D3C6" fontWeight="500" fontSize="12">
        Talk to a human
      </text>
    </svg>
  );
}
