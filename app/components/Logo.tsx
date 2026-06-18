type LogoProps = {
  showText?: boolean;
  className?: string;
};

export function Logo({ showText = true, className = "" }: LogoProps) {
  return (
    <span className={`brand-logo ${className}`}>
      <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="brand-bg-gradient" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" />
            <stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <rect className="brand-mark-bg" x="3" y="3" width="42" height="42" rx="14" />
        <path className="brand-mark-flow-main" d="M16 18c5.2-5.2 17.5-3.4 17.5 3.8 0 6.8-12.7 4.2-12.7 8.8 0 3.3 6.9 4.4 11.9 1.2" />
        <path className="brand-mark-flow-accent" d="M14.5 29.5c3.2 4.8 10.6 7.5 17.8 4.4" />
        <circle className="brand-mark-dot-start" cx="16" cy="18" r="4" />
        <circle className="brand-mark-dot-end" cx="32.7" cy="31.8" r="4" />
      </svg>
      {showText ? <span className="brand-text">文枢</span> : null}
    </span>
  );
}
