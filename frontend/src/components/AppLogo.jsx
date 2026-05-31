/** Slopify brand mark — git node + radar pulse */
export default function Logo({ size = 28, className = '' }) {
  const gradId = `slopify-grad-${size}`
  const pulseId = `slopify-pulse-${size}`
  const ringId = `slopify-ring-${size}`

  return (
    <svg
      className={`logo-mark ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff2a6d" />
          <stop offset="0.5" stopColor="#c9184a" />
          <stop offset="1" stopColor="#ff6b6b" />
        </linearGradient>
        <radialGradient id={ringId} cx="24" cy="24" r="20" gradientUnits="userSpaceOnUse">
          <stop offset="0.6" stopColor="#ff2a6d" stopOpacity="0" />
          <stop offset="1" stopColor="#ff2a6d" stopOpacity="0.35" />
        </radialGradient>
        <filter id={pulseId} x="0" y="0" width="48" height="48">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer radar ring */}
      <circle cx="24" cy="24" r="20" stroke={`url(#${gradId})`} strokeWidth="0.5" opacity="0.25" />
      <circle cx="24" cy="24" r="14" stroke={`url(#${gradId})`} strokeWidth="0.5" opacity="0.35" strokeDasharray="2 4" />

      {/* Git branch structure */}
      <path
        d="M16 32c-4 0-6-3-6-7 0-3 2-5 5-6 4-1 7-2 7-5 0-4-3-7-7-7"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 32c4 0 6-3 6-7 0-3-2-5-5-6-4-1-7-2-7-5 0-4 3-7 7-7"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <line x1="24" y1="15" x2="24" y2="33" stroke={`url(#${gradId})`} strokeWidth="2.5" strokeLinecap="round" />

      {/* Commit nodes */}
      <circle cx="24" cy="15" r="3" fill={`url(#${gradId})`} filter={`url(#${pulseId})`} />
      <circle cx="16" cy="32" r="2.5" fill={`url(#${gradId})`} opacity="0.9" />
      <circle cx="32" cy="32" r="2.5" fill={`url(#${gradId})`} opacity="0.6" />

      {/* Center pulse dot */}
      <circle cx="24" cy="24" r="1.5" fill="#ff2a6d" opacity="0.9" />
    </svg>
  )
}
