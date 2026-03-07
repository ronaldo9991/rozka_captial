interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const iconSizeMap: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "w-16 h-12 sm:w-20 sm:h-14",
  md: "w-20 h-14 sm:w-24 sm:h-16",
  lg: "w-24 h-16 sm:w-28 sm:h-20",
};

const textSizeMap: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export default function Logo({
  className = "",
  showText = true,
  size = "md",
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${iconSizeMap[size]}`}>
        <img
          src="/broad.png"
          alt="Binofox logo"
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span
          className={`font-serif font-bold ${textSizeMap[size]} text-foreground`}
        >
          Binofox
        </span>
      )}
    </div>
  );
}
