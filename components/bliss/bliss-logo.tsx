export function BlissLogo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient
            id="bliss-grad"
            x1="0"
            y1="0"
            x2="28"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#F6A26A" />
            <stop offset="55%" stopColor="#E76B9E" />
            <stop offset="100%" stopColor="#8A4DFF" />
          </linearGradient>
        </defs>
        <rect width="28" height="28" rx="7" fill="url(#bliss-grad)" />
        <path
          d="M9.5 19V9h4.1c1.7 0 2.8.9 2.8 2.3 0 1-.5 1.7-1.3 2 1.1.3 1.8 1.1 1.8 2.3 0 1.5-1.2 2.5-3 2.5H9.5Zm2-6h1.9c.8 0 1.2-.4 1.2-1 0-.7-.5-1-1.3-1h-1.8v2Zm0 4.4h2c.9 0 1.4-.4 1.4-1.1 0-.7-.6-1.1-1.5-1.1h-2v2.2Z"
          fill="white"
          fillOpacity="0.95"
        />
      </svg>
    </div>
  )
}
