import { BRAND_TITLE } from "@/lib/brand";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const iconSizeMap: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "w-10 h-10 sm:w-12 sm:h-12",
  md: "w-12 h-12 sm:w-14 sm:h-14",
  lg: "w-14 h-14 sm:w-16 sm:h-16",
};

const textSizeMap: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-base sm:text-lg",
  md: "text-lg sm:text-xl",
  lg: "text-xl sm:text-2xl",
};

export default function Logo({
  className = "",
  showText = true,
  size = "md",
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <div className={`relative shrink-0 ${iconSizeMap[size]}`}>
        <img
          src="/rozka_1.png"
          alt="ROZKA CAPTIALS logo"
          className="w-full h-full object-contain object-center"
        />
      </div>
      {showText && (
        <span
          className={`font-serif font-bold ${textSizeMap[size]} text-[#D4AF37] uppercase tracking-wider`}
          style={{ color: '#D4AF37' }}
        >
          {BRAND_TITLE}
        </span>
      )}
    </div>
  );
}
