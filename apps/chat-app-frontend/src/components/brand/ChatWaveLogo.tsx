import { cn } from "@/lib/utils";

type ChatWaveLogoProps = {
  className?: string;
};

export const ChatWaveLogo = ({ className }: ChatWaveLogoProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    role="img"
    aria-label="ChatWave"
    className={cn("shrink-0", className)}
  >
    <rect width="64" height="64" rx="16" fill="currentColor" className="text-primary" />
    <path
      fill="#ffffff"
      d="M17 20.5c0-4.14 3.36-7.5 7.5-7.5h15c4.14 0 7.5 3.36 7.5 7.5v10.5c0 4.14-3.36 7.5-7.5 7.5H29l-7.3 7.3V38.5h-.7c-4.14 0-7.5-3.36-7.5-7.5V20.5Z"
    />
    <circle cx="25.5" cy="27.5" r="2.3" className="fill-primary" />
    <circle cx="32" cy="27.5" r="2.3" className="fill-primary" />
    <circle cx="38.5" cy="27.5" r="2.3" className="fill-primary" />
  </svg>
);
