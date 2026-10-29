// Bomb-with-clock icon matching the reference site's deal-timer glyph:
// black round bomb body, white clock hands, a fuse with a red/orange spark.
export default function TimerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* fuse */}
      <path d="M15.2 5.8c1-1.7 2.5-2.2 3.7-1.8" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" />
      {/* nozzle / cap */}
      <rect x="12.5" y="4.5" width="2.8" height="2.8" rx="0.6" transform="rotate(45 13.9 5.9)" fill="#2b2b2b" />
      {/* red spark burst at the fuse tip */}
      <path
        d="M19.4 3.1l.6-1.4M20.7 4l1.3-.7M20.8 5.5l1.4.1"
        stroke="#E11900"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="19.1" cy="4.3" r="1.3" fill="#F4A93B" />
      {/* bomb body */}
      <circle cx="10.8" cy="14" r="7" fill="#2b2b2b" />
      <circle cx="8.4" cy="11.6" r="1.5" fill="#4a4a4a" />
      {/* clock hands */}
      <path d="M10.8 14V10.5M10.8 14l2.5 1.7" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10.8" cy="14" r="0.95" fill="#fff" />
    </svg>
  );
}
