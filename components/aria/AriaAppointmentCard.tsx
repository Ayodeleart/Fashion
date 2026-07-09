export default function AriaAppointmentCard() {
  return (
    <svg viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="apptRustGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B4623D" />
          <stop offset="100%" stopColor="#6E3620" />
        </linearGradient>
      </defs>

      <rect width="220" height="240" rx="28" fill="url(#apptRustGrad)" />

      <g transform="translate(65, 65) scale(3.75)">
        <path
          d="M21 10H3M21 12.5V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22H12M16 2V6M8 2V6M14.5 19L16.5 21L21 16.5"
          stroke="#F3E4D8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      <text x="110" y="200" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="15" letterSpacing="1.2">
        APPOINTMENT
      </text>
      <text x="110" y="222" textAnchor="middle" fill="#EAC7B4" fontWeight="500" fontSize="12">
        Book a fitting
      </text>
    </svg>
  );
}
