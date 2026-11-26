type SamaLogoProps = {
  size?: number
  className?: string
  withBackground?: boolean
}

function SamaLogo({
  size = 64,
  className = '',
  withBackground = true,
}: SamaLogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Emblème SAMA FBO"
    >
      <defs>
        <linearGradient id="samaGold" x1="28" y1="18" x2="96" y2="112">
          <stop offset="0" stopColor="#FBBF24" />
          <stop offset="0.48" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="samaLeaf" x1="70" y1="10" x2="112" y2="57">
          <stop offset="0" stopColor="#FDE68A" />
          <stop offset="0.5" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="samaBackground" x1="12" y1="8" x2="116" y2="120">
          <stop offset="0" stopColor="#08241A" />
          <stop offset="1" stopColor="#051610" />
        </linearGradient>

        <filter id="samaGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        <filter id="samaShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {withBackground && (
        <>
          <rect
            x="3"
            y="3"
            width="122"
            height="122"
            rx="34"
            fill="url(#samaBackground)"
            stroke="#D6A441"
            strokeOpacity="0.38"
            strokeWidth="1.5"
          />
          <circle
            cx="67"
            cy="60"
            r="39"
            fill="#10B981"
            opacity="0.13"
            filter="url(#samaGlow)"
          />
        </>
      )}

      <path
        d="M89 15C99 18 108 27 110 39C98 41 87 36 82 27C79 22 83 17 89 15Z"
        fill="#10B981"
        opacity="0.22"
        filter="url(#samaShadow)"
      />

      <path
        d="M83 14C96 13 108 22 111 35C99 39 86 33 81 23C79 19 80 16 83 14Z"
        fill="url(#samaLeaf)"
        stroke="#FDE68A"
        strokeOpacity="0.65"
        strokeWidth="1.2"
      />

      <path
        d="M85 31C94 27 102 25 108 25"
        stroke="#FFF1B8"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      <path
        d="M82 34C79 28 77 22 79 16"
        stroke="#FBBF24"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M84 39C76 32 70 27 64 24"
        stroke="#D97706"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M91 44C85 55 77 62 67 67"
        stroke="#10B981"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />

      <path
        d="M88 43C81 35 75 30 68 27"
        stroke="#FBBF24"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />

      <path
        d="M91 44C83 49 77 54 72 61"
        stroke="#FBBF24"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />

      <path
        d="M88 43C84 37 80 31 77 25"
        stroke="#FDE68A"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />

      <path
        d="M89 43C101 40 109 33 112 24"
        stroke="#10B981"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      <path
        d="M83 45C76 36 67 31 58 30"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />

      <path
        d="M88 48C81 56 74 62 65 67"
        stroke="#FBBF24"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M88 48C81 56 74 62 65 67"
        stroke="#FFF1B8"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.65"
      />

      <path
        d="M87 49C77 43 65 39 52 40C39 41 29 49 29 60C29 70 37 75 53 79L68 83C78 86 83 91 83 98C83 111 70 117 54 115C43 114 34 109 27 101"
        stroke="#6B3D08"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
        filter="url(#samaShadow)"
      />

      <path
        d="M87 49C77 43 65 39 52 40C39 41 29 49 29 60C29 70 37 75 53 79L68 83C78 86 83 91 83 98C83 111 70 117 54 115C43 114 34 109 27 101"
        stroke="url(#samaGold)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M85 47C73 41 62 38 51 40C39 42 31 49 31 59"
        stroke="#FFF1B8"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      <path
        d="M30 101C38 109 47 113 56 113"
        stroke="#FFF1B8"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.65"
      />

      <path
        d="M73 65C81 58 88 51 94 43"
        stroke="#FDE68A"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />

      <circle cx="96" cy="20" r="2" fill="#FDE68A" opacity="0.9" />
    </svg>
  )
}

export default SamaLogo
