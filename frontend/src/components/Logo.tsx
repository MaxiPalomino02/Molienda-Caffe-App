interface LogoProps {
  className?: string;
}

function Logo({ className }: LogoProps) {
  return (
    <span className={className ? `logo ${className}` : 'logo'}>
      <svg
        className="logo__icon"
        viewBox="0 0 48 48"
        role="img"
        aria-label="Molienda Café"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="24"
          cy="24"
          r="22.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <g transform="rotate(-32 24 24)">
          <ellipse
            cx="24"
            cy="24"
            rx="8.5"
            ry="14.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M21 12.8c0 4.4 6 5.6 6 11.2s-6 6.8-6 11.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="logo__text">
        <span className="logo__name">Molienda</span>
        <span className="logo__tag">Café</span>
      </span>
    </span>
  );
}

export default Logo;
